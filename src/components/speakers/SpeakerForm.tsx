"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageCropUploader } from "@/components/media/ImageCropUploader";
import { LinksEditor, type LinkDraft } from "@/components/speakers/LinksEditor";
import { TagInput } from "@/components/speakers/TagInput";
import { createClient } from "@/lib/supabase/client";
import { createSpeaker, updateSpeaker } from "@/lib/speakers/mutations";
import { useProfile } from "@/components/auth/ProfileProvider";
import {
  STATUS_LABELS,
  TIER_LABELS,
  TIER_ORDER,
  type SpeakerStatus,
  type SpeakerTier,
  type SpeakerWithRelations,
  type Tag,
} from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  origin: z.string().trim().min(1, "Origin is required"),
  age: z
    .union([z.coerce.number().int().min(1).max(119), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  email: z.union([z.string().trim().email("Enter a valid email"), z.literal("")]).optional(),
  phone: z.string().trim().optional(),
  idea_text: z.string().trim().optional(),
  experience_text: z.string().trim().optional(),
  status: z.enum(["no_reply", "accepted", "refused", "unclear"]),
  importance: z.union([z.enum(["s", "a", "b", "c", "f"]), z.literal("")]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface SpeakerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speaker?: SpeakerWithRelations | null;
  allTags: Tag[];
  onSaved?: () => void;
}

export function SpeakerForm({ open, onOpenChange, speaker, allTags, onSaved }: SpeakerFormProps) {
  const profile = useProfile();
  const isEdit = Boolean(speaker);

  const [photoUrl, setPhotoUrl] = useState<string | null>(speaker?.photo_url ?? null);
  const [links, setLinks] = useState<LinkDraft[]>(
    speaker?.speaker_links.map((l) => ({ platform: l.platform, url: l.url, label: l.label })) ?? []
  );
  const [tagNames, setTagNames] = useState<string[]>(speaker?.tags.map((t) => t.name) ?? []);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: speaker?.name ?? "",
      origin: speaker?.origin ?? "Tunisian",
      age: (speaker?.age ?? "") as unknown as number,
      email: speaker?.email ?? "",
      phone: speaker?.phone ?? "",
      idea_text: speaker?.idea_text ?? "",
      experience_text: speaker?.experience_text ?? "",
      status: speaker?.status ?? "no_reply",
      importance: speaker?.importance ?? "",
    },
  });

  // No reset-on-open effect: the parent remounts this component (via a
  // `key` tied to the target speaker) whenever a different speaker is being
  // edited or the "add" dialog is reopened, so the useState/useForm initial
  // values above are already correct on every mount.

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const supabase = createClient();

    const payload = {
      name: values.name,
      photo_url: photoUrl,
      origin: values.origin,
      age: values.age ?? null,
      email: values.email || null,
      phone: values.phone || null,
      idea_text: values.idea_text || null,
      experience_text: values.experience_text || null,
      status: values.status as SpeakerStatus,
      importance: (values.importance || null) as SpeakerTier | null,
      links: links.filter((l) => l.url.trim().length > 0),
      tagNames,
    };

    try {
      if (isEdit && speaker) {
        await updateSpeaker(supabase, profile.id, speaker.id, payload, speaker.status);
        toast.success(`${values.name} updated`);
      } else {
        await createSpeaker(supabase, profile.id, payload);
        toast.success(`${values.name} added`);
      }
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit speaker" : "Add a speaker"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update their details below." : "Fill in what you know — you can always add more later."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Photo</Label>
            <ImageCropUploader value={photoUrl} onChange={setPhotoUrl} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} placeholder="Full name" />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" {...register("origin")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min={1} max={119} {...register("age")} placeholder="Optional" />
              {errors.age && <p className="text-xs text-red-400">{errors.age.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="Optional" />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABELS) as SpeakerStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="importance">Importance</Label>
              <Controller
                control={control}
                name="importance"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger id="importance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unranked</SelectItem>
                      {TIER_ORDER.map((t) => (
                        <SelectItem key={t} value={t}>
                          {TIER_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idea">Idea they can bring</Label>
            <Textarea id="idea" {...register("idea_text")} placeholder="What would their talk be about?" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="experience">Past experience</Label>
            <Textarea
              id="experience"
              {...register("experience_text")}
              placeholder="Speaking experience, notable background…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Profile links</Label>
            <LinksEditor value={links} onChange={setLinks} />
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <TagInput value={tagNames} onChange={setTagNames} allTags={allTags} />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? "Save changes" : "Add speaker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
