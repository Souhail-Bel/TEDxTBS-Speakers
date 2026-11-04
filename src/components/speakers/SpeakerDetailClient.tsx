"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Lightbulb, History, Pencil, Trash2, User } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusChanger } from "@/components/speakers/StatusChanger";
import { TrackerPanel } from "@/components/speakers/TrackerPanel";
import { CommentThread } from "@/components/speakers/CommentThread";
import { SpeakerLinksDisplay } from "@/components/speakers/SpeakerLinksDisplay";
import { SpeakerForm } from "@/components/speakers/SpeakerForm";
import { ConfirmDialog } from "@/components/speakers/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { requestDeleteSpeaker } from "@/lib/speakers/mutations";
import { fetchSpeakerById, fetchAllTags } from "@/lib/speakers/queries";
import { useRealtimeRefetch } from "@/lib/hooks/useRealtimeRefetch";
import { tagColor } from "@/lib/utils/tag-color";
import { useProfile } from "@/components/auth/ProfileProvider";
import type { CommentWithAuthor, Profile, SpeakerWithRelations, Tag } from "@/lib/types";
import { TierBadge } from "@/components/speakers/TierBadge";

interface SpeakerDetailClientProps {
  speaker: SpeakerWithRelations;
  comments: CommentWithAuthor[];
  allTags: Tag[];
  allProfiles: Profile[];
}

export function SpeakerDetailClient({
  speaker: initialSpeaker,
  comments: initialComments,
  allTags: initialTags,
  allProfiles,
}: SpeakerDetailClientProps) {
  const router = useRouter();
  const profile = useProfile();
  const [speaker, setSpeaker] = useState(initialSpeaker);
  const [comments, setComments] = useState(initialComments);
  const [allTags, setAllTags] = useState(initialTags);
  const [editOpen, setEditOpen] = useState(false);
  // Bumped each time Edit is clicked so SpeakerForm remounts with the
  // latest speaker data instead of reusing a possibly-stale instance.
  const [editFormKey, setEditFormKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const [freshSpeaker, freshTags, { data: freshComments }] = await Promise.all([
      fetchSpeakerById(supabase, speaker.id),
      fetchAllTags(supabase),
      supabase
        .from("comments")
        .select("*, author:profiles(id, full_name, role)")
        .eq("speaker_id", speaker.id)
        .order("created_at", { ascending: true }),
    ]);
    if (freshSpeaker) setSpeaker(freshSpeaker);
    setAllTags(freshTags);
    if (freshComments) setComments(freshComments as CommentWithAuthor[]);
  }, [speaker.id]);

  useRealtimeRefetch(
    ["speakers", "comments", "speaker_trackers", "speaker_tags", "tags"],
    refetch
  );

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      const supabase = createClient();
      await requestDeleteSpeaker(supabase, profile.id, speaker.id);
      toast.success(`${speaker.name} moved to trash`);
      router.push("/");
    } catch {
      toast.error("Couldn't move this speaker to trash. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-tertiary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to speakers
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {speaker.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={speaker.photo_url}
                alt={speaker.name}
                className="h-16 w-16 rounded-2xl border border-border object-cover"
              />
            ) : (
              <InitialsAvatar name={speaker.name} size="md" className="h-16 w-16 rounded-2xl text-lg" />
            )}
            <div>
              <h1 className="text-xl font-semibold text-text-primary">{speaker.name}</h1>
              <p className="text-sm text-text-tertiary">
                {speaker.origin}
                {speaker.age ? ` · ${speaker.age} years old` : ""}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <TierBadge tier={speaker.importance} />
                <StatusChanger
                  speakerId={speaker.id}
                  status={speaker.status}
                  onChanged={(next) => setSpeaker((s) => ({ ...s, status: next }))}
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditFormKey((k) => k + 1);
                setEditOpen(true);
              }}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1.5 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" /> Trash
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {speaker.email && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Mail className="h-4 w-4 text-text-tertiary" />
              <a href={`mailto:${speaker.email}`} className="hover:text-red-300">
                {speaker.email}
              </a>
            </div>
          )}
          {speaker.phone && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Phone className="h-4 w-4 text-text-tertiary" />
              <a href={`tel:${speaker.phone}`} className="hover:text-red-300">
                {speaker.phone}
              </a>
            </div>
          )}
        </div>

        {speaker.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {speaker.tags.map((tag) => {
              const color = tagColor(tag.name);
              return (
                <span
                  key={tag.id}
                  style={{ backgroundColor: color.background, color: color.text }}
                  className="rounded-full px-2.5 py-1 text-xs"
                >
                  {tag.name}
                </span>
              );
            })}
          </div>
        )}

        {(speaker.idea_text || speaker.experience_text) && (
          <div className="mt-5 space-y-4 border-t border-border-subtle pt-4">
            {speaker.idea_text && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
                  <Lightbulb className="h-3.5 w-3.5" /> IDEA THEY CAN BRING
                </p>
                <p className="whitespace-pre-wrap text-sm text-text-primary">{speaker.idea_text}</p>
              </div>
            )}
            {speaker.experience_text && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
                  <History className="h-3.5 w-3.5" /> PAST EXPERIENCE
                </p>
                <p className="whitespace-pre-wrap text-sm text-text-primary">{speaker.experience_text}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-border-subtle pt-4">
          <p className="mb-2 text-xs font-medium text-text-tertiary">PROFILE LINKS</p>
          <SpeakerLinksDisplay links={speaker.speaker_links} />
        </div>

        <div className="mt-5 border-t border-border-subtle pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
            <User className="h-3.5 w-3.5" /> CURRENTLY TRACKING
          </p>
          <TrackerPanel
            speakerId={speaker.id}
            trackers={speaker.trackers}
            allProfiles={allProfiles}
            onChanged={refetch}
          />
        </div>

        {speaker.added_by_profile && (
          <p className="mt-4 text-xs text-text-tertiary">
            Added by <span className="text-text-secondary">{speaker.added_by_profile.full_name}</span>
          </p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">Progress &amp; comments</h2>
        <CommentThread speakerId={speaker.id} comments={comments} onPosted={refetch} />
      </Card>

      <SpeakerForm
        key={editFormKey}
        open={editOpen}
        onOpenChange={setEditOpen}
        speaker={speaker}
        allTags={allTags}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Move ${speaker.name} to trash?`}
        description="They'll be hidden from the list but not permanently deleted — an admin can restore them or confirm the deletion later."
        confirmLabel="Move to trash"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
