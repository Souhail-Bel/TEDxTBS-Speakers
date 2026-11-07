"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  Lightbulb,
  History,
  Pencil,
  Trash2,
  Users,
  MessageSquareText,
  Copy,
  Check,
  FileText,
  Link2,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { StatusChanger } from "@/components/speakers/StatusChanger";
import { TrackerPanel } from "@/components/speakers/TrackerPanel";
import { CommentThread } from "@/components/speakers/CommentThread";
import { SpeakerLinksDisplay } from "@/components/speakers/SpeakerLinksDisplay";
import { SpeakerForm } from "@/components/speakers/SpeakerForm";
import { ConfirmDialog } from "@/components/speakers/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { requestDeleteSpeaker, updateSpeakerCustomMessage } from "@/lib/speakers/mutations";
import { fetchSpeakerById, fetchAllTags, fetchAllStatuses } from "@/lib/speakers/queries";
import { useRealtimeRefetch } from "@/lib/hooks/useRealtimeRefetch";
import { tagColor } from "@/lib/utils/tag-color";
import { useProfile } from "@/components/auth/ProfileProvider";
import type {
  CommentWithAuthor,
  Profile,
  SpeakerStatusOption,
  SpeakerWithRelations,
  Tag,
} from "@/lib/types";
import { TierBadge } from "@/components/speakers/TierBadge";

interface SpeakerDetailClientProps {
  speaker: SpeakerWithRelations;
  comments: CommentWithAuthor[];
  allTags: Tag[];
  allProfiles: Profile[];
  statuses: SpeakerStatusOption[];
}

export function SpeakerDetailClient({
  speaker: initialSpeaker,
  comments: initialComments,
  allTags: initialTags,
  allProfiles,
  statuses: initialStatuses,
}: SpeakerDetailClientProps) {
  const router = useRouter();
  const profile = useProfile();
  const [speaker, setSpeaker] = useState(initialSpeaker);
  const [comments, setComments] = useState(initialComments);
  const [allTags, setAllTags] = useState(initialTags);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [editOpen, setEditOpen] = useState(false);
  // Bumped each time Edit is clicked so SpeakerForm remounts with the
  // latest speaker data instead of reusing a possibly-stale instance.
  const [editFormKey, setEditFormKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Custom message inline editor state
  const [editingMessage, setEditingMessage] = useState(false);
  const [messageDraft, setMessageDraft] = useState(initialSpeaker.custom_message ?? "");
  const [savingMessage, setSavingMessage] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const [freshSpeaker, freshTags, freshStatuses, { data: freshComments }] = await Promise.all([
      fetchSpeakerById(supabase, speaker.id),
      fetchAllTags(supabase),
      fetchAllStatuses(supabase),
      supabase
        .from("comments")
        .select("*, author:profiles(id, full_name, role, avatar_url)")
        .eq("speaker_id", speaker.id)
        .order("created_at", { ascending: true }),
    ]);
    if (freshSpeaker) setSpeaker(freshSpeaker);
    setAllTags(freshTags);
    setStatuses(freshStatuses);
    if (freshComments) setComments(freshComments as CommentWithAuthor[]);
  }, [speaker.id]);

  useRealtimeRefetch(
    ["speakers", "comments", "speaker_trackers", "speaker_tags", "tags", "speaker_statuses"],
    refetch
  );

  async function handleSaveCustomMessage() {
    setSavingMessage(true);
    try {
      const supabase = createClient();
      const trimmed = messageDraft.trim() || null;
      await updateSpeakerCustomMessage(supabase, profile.id, speaker.id, trimmed);
      setSpeaker((prev) => ({ ...prev, custom_message: trimmed }));
      setEditingMessage(false);
      toast.success("Custom message saved");
    } catch {
      toast.error("Couldn't save custom message. Please try again.");
    } finally {
      setSavingMessage(false);
    }
  }

  function handleCopyCustomMessage() {
    if (!speaker.custom_message) return;
    navigator.clipboard.writeText(speaker.custom_message).then(() => {
      setCopiedMessage(true);
      toast.success("Custom message copied to clipboard");
      setTimeout(() => setCopiedMessage(false), 1800);
    });
  }

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
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium text-[#A6A0A0] transition-colors hover:border-[#332323] hover:bg-[#160F10] hover:text-[#F5F5F5]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#E31B2B]" /> Back to Speakers
        </Link>
      </div>

      {/* Profile Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#382325] bg-gradient-to-br from-[#201214] via-[#150E0F] to-[#0E0A0A] p-6 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.85)] sm:p-7">
        <div
          className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(227,27,43,0.2) 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {speaker.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={speaker.photo_url}
                alt={speaker.name}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-[#E31B2B]/35 shadow-lg"
              />
            ) : (
              <InitialsAvatar
                name={speaker.name}
                size="lg"
                className="h-20 w-20 rounded-2xl text-xl ring-2 ring-white/15"
              />
            )}

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-[28px]">
                  {speaker.name}
                </h1>
                <TierBadge tier={speaker.importance} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#A6A0A0]">
                <span>{speaker.origin || "Origin unspecified"}</span>
                {speaker.age ? <span>• {speaker.age} years old</span> : null}
                <span className="inline-flex items-center gap-1 text-[#777070]">
                  <Calendar className="h-3 w-3" />
                  Added {format(new Date(speaker.created_at), "d MMM yyyy")}
                  {speaker.added_by_profile ? ` by ${speaker.added_by_profile.full_name}` : ""}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <StatusChanger
                  speakerId={speaker.id}
                  status={speaker.status}
                  statuses={statuses}
                  onChanged={(next) => setSpeaker((s) => ({ ...s, status: next }))}
                  onStatusesChanged={refetch}
                />

                {speaker.tags.map((tag) => {
                  const color = tagColor(tag.name);
                  return (
                    <span
                      key={tag.id}
                      style={{
                        backgroundColor: color.background,
                        borderColor: color.border,
                        color: color.text,
                      }}
                      className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditFormKey((k) => k + 1);
                setEditOpen(true);
              }}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Dossier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1.5 border-[#452427] text-[#FF5C6C] hover:border-[#E31B2B]/50 hover:bg-[#E31B2B]/12 hover:text-[#FF8590]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Trash
            </Button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Speaker Dossier */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Biography, Links + Custom Outreach Message, Talk Topic & Experience */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Biography & Overview */}
          <section className="tedx-surface rounded-2xl p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5E0E0]">
              <FileText className="h-4 w-4 text-[#E31B2B]" />
              Biography &amp; Overview
            </div>
            {speaker.bio ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#D8D0D0]">
                {speaker.bio}
              </p>
            ) : (
              <p className="text-xs text-[#777070]">
                No biography recorded yet. Click Edit Dossier to add background details.
              </p>
            )}
          </section>

          {/* 2. Contact Channels, Social Links & Custom Outreach Message */}
          <section className="tedx-surface space-y-5 rounded-2xl p-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5E0E0]">
                <Link2 className="h-4 w-4 text-[#E31B2B]" />
                Contact &amp; Social Profiles
              </div>

              {(speaker.email || speaker.phone) && (
                <div className="mb-3.5 flex flex-wrap gap-3">
                  {speaker.email && (
                    <a
                      href={`mailto:${speaker.email}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#342324] bg-[#120C0D] px-3.5 py-2 text-xs font-medium text-[#F5F5F5] transition-colors hover:border-[#E31B2B]/50 hover:text-[#FF7583]"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#E31B2B]" />
                      {speaker.email}
                    </a>
                  )}
                  {speaker.phone && (
                    <a
                      href={`tel:${speaker.phone}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#342324] bg-[#120C0D] px-3.5 py-2 text-xs font-medium text-[#F5F5F5] transition-colors hover:border-[#E31B2B]/50 hover:text-[#FF7583]"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#E31B2B]" />
                      {speaker.phone}
                    </a>
                  )}
                </div>
              )}

              <SpeakerLinksDisplay links={speaker.speaker_links} />
            </div>

            {/* Custom Outreach Message right under/beside links */}
            <div className="rounded-xl border border-[#3C2225] bg-gradient-to-br from-[#1A1011] to-[#120B0C] p-4">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF7583]">
                  <MessageSquareText className="h-3.5 w-3.5 text-[#E31B2B]" />
                  Custom Outreach Message
                </p>
                <div className="flex items-center gap-1.5">
                  {speaker.custom_message && !editingMessage && (
                    <button
                      type="button"
                      onClick={handleCopyCustomMessage}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#382425] bg-[#140D0E] px-2.5 py-1 text-[11px] font-medium text-[#E5E0E0] transition-colors hover:border-[#E31B2B]/50 hover:text-white"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="h-3 w-3 text-[#22C55E]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-[#A6A0A0]" /> Copy
                        </>
                      )}
                    </button>
                  )}
                  {!editingMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        setMessageDraft(speaker.custom_message ?? "");
                        setEditingMessage(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#382425] bg-[#140D0E] px-2.5 py-1 text-[11px] font-medium text-[#E5E0E0] transition-colors hover:border-[#E31B2B]/50 hover:text-white"
                    >
                      <Pencil className="h-3 w-3 text-[#A6A0A0]" />
                      {speaker.custom_message ? "Edit" : "Write"}
                    </button>
                  )}
                </div>
              </div>

              {editingMessage ? (
                <div className="space-y-2.5">
                  <Textarea
                    autoFocus
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    placeholder={`Write a tailored outreach message specifically for ${speaker.name} (to send via LinkedIn, Instagram, Email…)`}
                    className="min-h-28 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      onClick={() => {
                        setEditingMessage(false);
                        setMessageDraft(speaker.custom_message ?? "");
                      }}
                      disabled={savingMessage}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-3 text-xs"
                      loading={savingMessage}
                      onClick={handleSaveCustomMessage}
                    >
                      Save message
                    </Button>
                  </div>
                </div>
              ) : speaker.custom_message ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#F5F5F5]">
                  {speaker.custom_message}
                </p>
              ) : (
                <p className="text-xs text-[#8A8282]">
                  No tailored outreach message written for {speaker.name} yet. Click{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMessageDraft(speaker.custom_message ?? "");
                      setEditingMessage(true);
                    }}
                    className="font-semibold text-[#FF5C6C] underline-offset-2 hover:underline"
                  >
                    Write
                  </button>{" "}
                  to draft a custom pitch.
                </p>
              )}
            </div>
          </section>

          {/* 3. Talk Topic / Idea & Past Speaking Experience */}
          <section className="tedx-surface space-y-5 rounded-2xl p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5E0E0]">
                <Lightbulb className="h-4 w-4 text-[#E31B2B]" />
                Idea &amp; Potential Talk Topic
              </div>
              {speaker.idea_text ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#D8D0D0]">
                  {speaker.idea_text}
                </p>
              ) : (
                <p className="text-xs text-[#777070]">No talk idea documented yet.</p>
              )}
            </div>

            <div className="border-t border-[#261919] pt-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5E0E0]">
                <History className="h-4 w-4 text-[#E31B2B]" />
                Speaking &amp; Stage Experience
              </div>
              {speaker.experience_text ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#D8D0D0]">
                  {speaker.experience_text}
                </p>
              ) : (
                <p className="text-xs text-[#777070]">No past stage experience recorded yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Assigned Coordinators & Coordination Timeline */}
        <div className="space-y-6 lg:col-span-5">
          {/* Assigned Coordinators */}
          <section className="tedx-surface rounded-2xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5E0E0]">
                <Users className="h-4 w-4 text-[#E31B2B]" />
                Assigned Coordinators
              </div>
              <span className="rounded-full border border-[#342324] bg-[#140D0E] px-2 py-0.5 text-[11px] font-semibold text-[#A6A0A0]">
                {speaker.trackers.length}
              </span>
            </div>
            <TrackerPanel
              speakerId={speaker.id}
              trackers={speaker.trackers}
              allProfiles={allProfiles}
              onChanged={refetch}
            />
          </section>

          {/* Coordination & Progress Timeline */}
          <section className="tedx-surface rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5E0E0]">
                <MessageSquare className="h-4 w-4 text-[#E31B2B]" />
                Coordination Timeline
              </div>
              <span className="rounded-full border border-[#342324] bg-[#140D0E] px-2 py-0.5 text-[11px] font-semibold text-[#A6A0A0]">
                {comments.length} {comments.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <CommentThread speakerId={speaker.id} comments={comments} onPosted={refetch} />
          </section>
        </div>
      </div>

      <SpeakerForm
        key={editFormKey}
        open={editOpen}
        onOpenChange={setEditOpen}
        speaker={speaker}
        allTags={allTags}
        statuses={statuses}
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
