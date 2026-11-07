"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/speakers/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  createStatusOption,
  deleteStatusOption,
  updateSpeakerStatus,
} from "@/lib/speakers/mutations";
import { useProfile } from "@/components/auth/ProfileProvider";
import { DEFAULT_STATUSES, type SpeakerStatus, type SpeakerStatusOption } from "@/lib/types";

export function StatusChanger({
  speakerId,
  status,
  statuses: propStatuses,
  onChanged,
  onStatusesChanged,
}: {
  speakerId: string;
  status: SpeakerStatus;
  statuses?: SpeakerStatusOption[];
  onChanged?: (next: SpeakerStatus) => void;
  onStatusesChanged?: () => void;
}) {
  const profile = useProfile();
  const [optimisticStatus, setOptimisticStatus] = useState<SpeakerStatus | null>(null);
  const [addedStatuses, setAddedStatuses] = useState<SpeakerStatusOption[]>([]);
  const [removedSlugs, setRemovedSlugs] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [creatingStatus, setCreatingStatus] = useState(false);

  const current = optimisticStatus ?? status;

  const localStatuses = useMemo(() => {
    const base = propStatuses && propStatuses.length > 0 ? propStatuses : DEFAULT_STATUSES;
    const merged = [...base];
    for (const extra of addedStatuses) {
      if (!merged.some((s) => s.slug === extra.slug)) {
        merged.push(extra);
      }
    }
    return merged.filter((s) => !removedSlugs.has(s.slug));
  }, [propStatuses, addedStatuses, removedSlugs]);

  async function handleSelect(next: SpeakerStatus) {
    if (next === current || updating) return;
    const previous = current;
    setOptimisticStatus(next);
    setUpdating(true);
    try {
      const supabase = createClient();
      await updateSpeakerStatus(supabase, profile.id, speakerId, previous, next);
      setOptimisticStatus(null);
      onChanged?.(next);
    } catch {
      setOptimisticStatus(null);
      toast.error("Couldn't update the status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleCreateStatus(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newLabel.trim();
    if (!trimmed || creatingStatus) return;

    setCreatingStatus(true);
    try {
      const supabase = createClient();
      const created = await createStatusOption(supabase, trimmed);
      setAddedStatuses((prev) => [...prev, created]);
      setNewLabel("");
      setAddingNew(false);
      onStatusesChanged?.();
      await handleSelect(created.slug);
      toast.success(`Status "${created.label}" added`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create status.");
    } finally {
      setCreatingStatus(false);
    }
  }

  async function handleDeleteCustomStatus(e: React.MouseEvent, option: SpeakerStatusOption) {
    e.stopPropagation();
    e.preventDefault();
    if (option.is_builtin) return;
    try {
      const supabase = createClient();
      await deleteStatusOption(supabase, option.slug);
      setRemovedSlugs((prev) => new Set(prev).add(option.slug));
      if (current === option.slug) {
        setOptimisticStatus(null);
        onChanged?.("no_reply");
      }
      onStatusesChanged?.();
      toast.success(`Status "${option.label}" removed`);
    } catch {
      toast.error("Couldn't remove status.");
    }
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) {
          setAddingNew(false);
          setNewLabel("");
        }
      }}
    >
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full outline-none transition-opacity hover:opacity-85 disabled:opacity-50">
        <StatusBadge status={current} statuses={localStatuses} />
        <ChevronDown className="h-3.5 w-3.5 text-[#8A8282]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {localStatuses.map((s) => (
          <DropdownMenuItem
            key={s.slug}
            onSelect={() => handleSelect(s.slug)}
            className="group justify-between gap-3 cursor-pointer"
          >
            <span className="truncate">{s.label}</span>
            <span className="flex items-center gap-1.5">
              {s.slug === current && <Check className="h-3.5 w-3.5 text-[#E31B2B]" />}
              {!s.is_builtin && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomStatus(e, s)}
                  title="Remove custom status"
                  className="rounded p-0.5 text-[#777070] opacity-0 transition-opacity hover:text-[#EF4444] group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {addingNew ? (
          <form
            onSubmit={handleCreateStatus}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="space-y-2 p-1.5"
          >
            <Input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="New status name…"
              className="h-8 text-xs"
            />
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setAddingNew(false);
                  setNewLabel("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-7 px-2.5 text-xs"
                loading={creatingStatus}
                disabled={!newLabel.trim()}
              >
                Add
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAddingNew(true);
            }}
            className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#FF7583] transition-colors hover:bg-[#241819]"
          >
            <Plus className="h-3.5 w-3.5 text-[#E31B2B]" /> Add status state…
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
