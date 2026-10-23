"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { Camera, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface ImageCropUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

/** Crops an image into a canvas region and returns a compressed JPEG Blob. */
async function getCroppedBlob(imageSrc: string, cropPixels: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const SIZE = 640; // output square size in px — plenty for avatars/cards, keeps file small
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    SIZE,
    SIZE
  );

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not export image"))), "image/jpeg", 0.92)
  );

  return imageCompression(new File([blob], "crop.jpg", { type: "image/jpeg" }), {
    maxSizeMB: 0.4,
    maxWidthOrHeight: SIZE,
    useWebWorker: true,
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function ImageCropUploader({ value, onChange }: ImageCropUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirmCrop() {
    if (!rawImage || !croppedAreaPixels) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(rawImage, croppedAreaPixels);
      const supabase = createClient();
      const fileName = `${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("speaker-photos")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from("speaker-photos").getPublicUrl(fileName);
      onChange(publicUrl.publicUrl);
      setCropOpen(false);
      setRawImage(null);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Speaker" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-tertiary">
            <Camera className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
          {value ? "Change photo" : "Upload photo"}
        </Button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-red-400"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <Dialog open={cropOpen} onOpenChange={(open) => !uploading && setCropOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop photo</DialogTitle>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black">
            {rawImage && (
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <ZoomIn className="h-4 w-4 text-text-tertiary" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full appearance-none rounded-full bg-surface-3 accent-red-500"
            />
          </div>

          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setCropOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCrop} loading={uploading}>
              {uploading ? "Uploading…" : "Save photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
