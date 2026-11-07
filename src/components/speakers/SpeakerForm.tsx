"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import { createSpeaker, createStatusOption, updateSpeaker } from "@/lib/speakers/mutations";
import { useProfile } from "@/components/auth/ProfileProvider";
import {
  DEFAULT_STATUSES,
  TIER_LABELS,
  TIER_ORDER,
  type SpeakerStatus,
  type SpeakerStatusOption,
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
  bio: z.string().trim().max(400, "Keep it to 400 characters max").optional(),
  idea_text: z.string().trim().optional(),
  experience_text: z.string().trim().optional(),
  custom_message: z.string().trim().optional(),
  status: z.string().trim().min(1, "Status is required"),
  importance: z.union([z.enum(["s", "a", "b", "c", "f"]), z.literal("")]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface SpeakerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speaker?: SpeakerWithRelations | null;
  allTags: Tag[];
  statuses?: SpeakerStatusOption[];
  onSaved?: () => void;
}

export function SpeakerForm({
  open,
  onOpenChange,
  speaker,
  allTags,
  statuses: propStatuses,
  onSaved,
}: SpeakerFormProps) {
  const profile = useProfile();
  const isEdit = Boolean(speaker);

  const [photoUrl, setPhotoUrl] = useState<string | null>(speaker?.photo_url ?? null);
  const [links, setLinks] = useState<LinkDraft[]>(
    speaker?.speaker_links.map((l) => ({ platform: l.platform, url: l.url, label: l.label })) ?? []
  );
  const [tagNames, setTagNames] = useState<string[]>(speaker?.tags.map((t) => t.name) ?? []);
  const [localStatuses, setLocalStatuses] = useState<SpeakerStatusOption[]>(
    propStatuses && propStatuses.length > 0 ? propStatuses : DEFAULT_STATUSES
  );
  const [addingStatus, setAddingStatus] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [creatingStatus, setCreatingStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: speaker?.name ?? "",
      origin: speaker?.origin ?? "Tunisian",
      age: (speaker?.age ?? "") as unknown as number,
      email: speaker?.email ?? "",
      phone: speaker?.phone ?? "",
      bio: speaker?.bio ?? "",
      idea_text: speaker?.idea_text ?? "",
      experience_text: speaker?.experience_text ?? "",
      custom_message: speaker?.custom_message ?? "",
      status: speaker?.status ?? "no_reply",
      importance: speaker?.importance ?? "",
    },
  });

  async function handleAddNewStatus() {
    const trimmed = newStatusLabel.trim();
    if (!trimmed || creatingStatus) return;

    setCreatingStatus(true);
    try {
      const supabase = createClient();
      const created = await createStatusOption(supabase, trimmed);
      setLocalStatuses((prev) =>
        prev.some((s) => s.slug === created.slug) ? prev : [...prev, created]
      );
      setValue("status", created.slug);
      setNewStatusLabel("");
      setAddingStatus(false);
      toast.success(`Status "${created.label}" added`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create status.");
    } finally {
      setCreatingStatus(false);
    }
  }

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
      bio: values.bio || null,
      idea_text: values.idea_text || null,
      experience_text: values.experience_text || null,
      custom_message: values.custom_message || null,
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
            {isEdit
              ? "Update their details below."
              : "Fill in what you know — you'll automatically be assigned as the default tracker for this speaker."}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Status</Label>
                <button
                  type="button"
                  onClick={() => setAddingStatus((v) => !v)}
                  className="flex items-center gap-0.5 text-[11px] font-medium text-red-300 hover:text-red-200"
                >
                  <Plus className="h-3 w-3" /> New status
                </button>
              </div>
              {addingStatus ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={newStatusLabel}
                    onChange={(e) => setNewStatusLabel(e.target.value)}
                    placeholder="Status name…"
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewStatus}
                    loading={creatingStatus}
                    disabled={!newStatusLabel.trim()}
                    className="h-9 px-2.5 text-xs"
                  >
                    Add
                  </Button>
                </div>
              ) : (
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {localStatuses.map((s) => (
                          <SelectItem key={s.slug} value={s.slug}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
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
            <Label htmlFor="bio">Brief bio</Label>
            <Textarea id="bio" {...register("bio")} placeholder="A couple of sentences; who they are..." />
            {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
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
            <Label htmlFor="custom_message">Custom message for this speaker</Label>
            <Textarea
              id="custom_message"
              {...register("custom_message")}
              placeholder="Tailored outreach message or pitch specifically for this speaker (for LinkedIn, Instagram, Email…)"
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
