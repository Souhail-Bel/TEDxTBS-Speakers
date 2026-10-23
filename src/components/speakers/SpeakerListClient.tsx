"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { SpeakerFilters, type SortKey, type ViewMode } from "@/components/speakers/SpeakerFilters";
import { StatsStrip } from "@/components/speakers/StatsStrip";
import { SpeakerTable } from "@/components/speakers/SpeakerTable";
import { SpeakerBoard } from "@/components/speakers/SpeakerBoard";
import { SpeakerForm } from "@/components/speakers/SpeakerForm";
import { ConfirmDialog } from "@/components/speakers/ConfirmDialog";
import { useRealtimeRefetch } from "@/lib/hooks/useRealtimeRefetch";
import { createClient } from "@/lib/supabase/client";
import { fetchAllTags, fetchSpeakers } from "@/lib/speakers/queries";
import { requestDeleteSpeaker } from "@/lib/speakers/mutations";
import { useProfile } from "@/components/auth/ProfileProvider";
import type { SpeakerStatus, SpeakerWithRelations, Tag } from "@/lib/types";

export function SpeakerListClient({
  initialSpeakers,
  initialTags,
}: {
  initialSpeakers: SpeakerWithRelations[];
  initialTags: Tag[];
}) {
  const profile = useProfile();
  const [speakers, setSpeakers] = useState(initialSpeakers);
  const [allTags, setAllTags] = useState(initialTags);
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [activeStatus, setActiveStatus] = useState<Set<SpeakerStatus>>(new Set());
  const [sort, setSort] = useState<SortKey>("created_desc");
  const [view, setView] = useState<ViewMode>("table");

  const [formOpen, setFormOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<SpeakerWithRelations | null>(null);
  // Bumped every time the form is opened, so SpeakerForm remounts fresh (and
  // therefore resets its local state) instead of needing a reset-on-open effect.
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<SpeakerWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refetch = useCallback(() => {
    const supabase = createClient();
    startTransition(() => {
      fetchSpeakers(supabase).then(setSpeakers).catch(() => {});
      fetchAllTags(supabase).then(setAllTags).catch(() => {});
    });
  }, []);

  useRealtimeRefetch(["speakers", "comments", "speaker_trackers", "speaker_tags", "tags"], refetch);

  const counts = useMemo(() => {
    const base: Record<SpeakerStatus, number> = { accepted: 0, no_reply: 0, refused: 0, unclear: 0 };
    for (const s of speakers) base[s.status]++;
    return base;
  }, [speakers]);

  const filtered = useMemo(() => {
    let result = speakers;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (selectedTagIds.size > 0) {
      result = result.filter((s) => s.tags.some((t) => selectedTagIds.has(t.id)));
    }

    if (activeStatus.size > 0) {
      result = result.filter((s) => activeStatus.has(s.status));
    }

    const sorted = [...result];
    switch (sort) {
      case "created_desc":
        sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      case "created_asc":
        sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return sorted;
  }, [speakers, search, selectedTagIds, activeStatus, sort]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleStatusFilter(status: SpeakerStatus) {
    setActiveStatus((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await requestDeleteSpeaker(supabase, profile.id, deleteTarget.id);
      toast.success(`${deleteTarget.name} moved to trash`, {
        description: "An admin can restore or permanently remove it.",
      });
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Couldn't move this speaker to trash. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <StatsStrip
        total={speakers.length}
        counts={counts}
        activeStatus={activeStatus}
        onToggleStatus={toggleStatusFilter}
      />

      <SpeakerFilters
        search={search}
        onSearchChange={setSearch}
        allTags={allTags}
        selectedTagIds={selectedTagIds}
        onToggleTag={toggleTag}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
        onAddSpeaker={() => {
          setEditingSpeaker(null);
          setFormKey((k) => k + 1);
          setFormOpen(true);
        }}
      />

      {view === "table" ? (
        <SpeakerTable
          speakers={filtered}
          onEdit={(s) => {
            setEditingSpeaker(s);
            setFormKey((k) => k + 1);
            setFormOpen(true);
          }}
          onDeleteRequest={setDeleteTarget}
        />
      ) : (
        <SpeakerBoard speakers={filtered} />
      )}

      <SpeakerForm
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        speaker={editingSpeaker}
        allTags={allTags}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Move ${deleteTarget?.name ?? "this speaker"} to trash?`}
        description="They'll be hidden from the list but not permanently deleted — an admin can restore them or confirm the deletion later."
        confirmLabel="Move to trash"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
