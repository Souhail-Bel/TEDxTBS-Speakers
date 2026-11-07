"use client";

import { useMemo, useState } from "react";
import {
  Users,
  CheckCircle2,
  Hourglass,
  XCircle,
  Trash2,
  Sparkles,
  Plus,
  X,
  ArrowUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { tagColor } from "@/lib/utils/tag-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createStatusOption, deleteStatusOption } from "@/lib/speakers/mutations";
import type { SpeakerStatus, SpeakerStatusOption } from "@/lib/types";

const PREFERRED_BUILTIN_ORDER = ["accepted", "no_reply", "unclear", "refused"];

const BUILTIN_CARD_META: Record<
  string,
  {
    icon: typeof Users;
    iconWrapClass: string;
    iconClass: string;
    metricClass: string;
  }
> = {
  accepted: {
    icon: CheckCircle2,
    iconWrapClass: "bg-[#22C55E]/12 ring-1 ring-[#22C55E]/30",
    iconClass: "text-[#22C55E]",
    metricClass: "text-[#22C55E]",
  },
  no_reply: {
    icon: Hourglass,
    iconWrapClass: "bg-[#E31B2B]/14 ring-1 ring-[#E31B2B]/30",
    iconClass: "text-[#FF2E40]",
    metricClass: "text-[#9CA3AF]",
  },
  unclear: {
    icon: XCircle,
    iconWrapClass: "bg-[#F59E0B]/14 ring-1 ring-[#F59E0B]/30",
    iconClass: "text-[#F59E0B]",
    metricClass: "text-[#F59E0B]",
  },
  refused: {
    icon: Trash2,
    iconWrapClass: "bg-[#EF4444]/14 ring-1 ring-[#EF4444]/30",
    iconClass: "text-[#EF4444]",
    metricClass: "text-[#EF4444]",
  },
};

export function StatsStrip({
  total,
  recentAddedCount = 0,
  counts,
  statuses,
  activeStatus,
  onToggleStatus,
  onClearStatuses,
  onStatusesChanged,
}: {
  total: number;
  recentAddedCount?: number;
  counts: Record<string, number>;
  statuses: SpeakerStatusOption[];
  activeStatus: Set<SpeakerStatus>;
  onToggleStatus: (s: SpeakerStatus) => void;
  onClearStatuses?: () => void;
  onStatusesChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const orderedStatuses = useMemo(() => {
    const builtins: SpeakerStatusOption[] = [];
    for (const slug of PREFERRED_BUILTIN_ORDER) {
      const found = statuses.find((s) => s.slug === slug);
      if (found) builtins.push(found);
    }
    const others = statuses.filter((s) => !PREFERRED_BUILTIN_ORDER.includes(s.slug));
    return [...builtins, ...others];
  }, [statuses]);

  async function handleAddStatus(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newLabel.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const created = await createStatusOption(supabase, trimmed);
      toast.success(`Status "${created.label}" added`);
      setNewLabel("");
      setOpen(false);
      onStatusesChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStatus(e: React.MouseEvent, status: SpeakerStatusOption) {
    e.stopPropagation();
    if (status.is_builtin) return;
    try {
      const supabase = createClient();
      await deleteStatusOption(supabase, status.slug);
      toast.success(`Status "${status.label}" removed`);
      onStatusesChanged?.();
    } catch {
      toast.error("Couldn't remove status.");
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {/* 1. Total Speakers Card */}
        <div
          onClick={() => activeStatus.size > 0 && onClearStatuses?.()}
          role={activeStatus.size > 0 ? "button" : undefined}
          tabIndex={activeStatus.size > 0 ? 0 : undefined}
          className={cn(
            "tedx-stat-card relative flex items-center gap-3.5 rounded-2xl px-4 py-4 transition-all duration-150",
            activeStatus.size > 0 && "cursor-pointer hover:border-[#E31B2B]/50"
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E31B2B]/15 ring-1 ring-[#E31B2B]/35">
            <Users className="h-5 w-5 text-[#FF1E32]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#B8B0B0]">Total Speakers</p>
            <p className="mt-0.5 text-[26px] font-bold leading-none tracking-tight text-white">
              {total}
            </p>
          </div>
          {recentAddedCount > 0 && (
            <span
              className=" inline-flex items-center gap-0.5 self-end text-xs font-semibold text-[#22C55E]"
              title={`${recentAddedCount} added in the last 7 days`}
            >
              <ArrowUp className="h-3 w-3 stroke-[2.5]" />+{recentAddedCount}
            </span>
          )}
        </div>

        {/* Status Cards (Built-in + Any Custom Statuses) */}
        {orderedStatuses.map((status) => {
          const isActive = activeStatus.has(status.slug);
          const count = counts[status.slug] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const builtinMeta = BUILTIN_CARD_META[status.slug];
          const customColor = !builtinMeta ? tagColor(status.slug) : null;
          const IconComponent = builtinMeta?.icon ?? Sparkles;

          return (
            <div
              key={status.slug}
              onClick={() => onToggleStatus(status.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleStatus(status.slug);
                }
              }}
              className={cn(
                "tedx-stat-card group relative flex cursor-pointer items-center gap-3.5 rounded-2xl px-4 py-4 text-left transition-all duration-150",
                isActive &&
                  "border-[#E31B2B]! ring-1 ring-[#E31B2B]/65 shadow-[0_0_24px_rgba(227,27,43,0.25)]!"
              )}
            >
              {!status.is_builtin && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteStatus(e, status)}
                  title={`Remove "${status.label}" status`}
                  className="absolute top-2 right-2 rounded-full p-1 text-[#777070] opacity-0 transition-opacity hover:bg-[#2A1D1D] hover:text-[#FF3B4E] group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  builtinMeta ? builtinMeta.iconWrapClass : "ring-1"
                )}
                style={
                  customColor
                    ? {
                        backgroundColor: customColor.background,
                        borderColor: customColor.border,
                        color: customColor.text,
                      }
                    : undefined
                }
              >
                <IconComponent
                  className={cn("h-5 w-5", builtinMeta?.iconClass)}
                  style={customColor ? { color: customColor.text } : undefined}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#B8B0B0]">{status.label}</p>
                <p className="mt-0.5 text-[26px] font-bold leading-none tracking-tight text-white">
                  {count}
                </p>
              </div>

              <span
                className={cn(
                  "self-end text-xs font-semibold tabular-nums",
                  count > 0
                    ? builtinMeta?.metricClass ?? "text-[#A6A0A0]"
                    : "text-[#777070]"
                )}
                style={count > 0 && customColor ? { color: customColor.text } : undefined}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtle status customization & active filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#A6A0A0]">
          {activeStatus.size > 0 && (
            <button
              type="button"
              onClick={onClearStatuses}
              className="inline-flex items-center gap-1 rounded-full border border-[#E31B2B]/35 bg-[#E31B2B]/12 px-2.5 py-0.5 text-[11px] font-medium text-[#FF7583] transition-colors hover:bg-[#E31B2B]/20"
            >
              Filtering by {activeStatus.size} {activeStatus.size === 1 ? "status" : "statuses"}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#382425] bg-[#140D0E]/80 px-2.5 py-1 text-[11px] font-medium text-[#9A9292] transition-colors hover:border-[#E31B2B]/50 hover:bg-[#1C1213] hover:text-[#F5F5F5]"
            >
              <Plus className="h-3 w-3 text-[#E31B2B]" /> Add status state
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <form onSubmit={handleAddStatus} className="space-y-2.5">
              <p className="text-xs font-semibold text-[#F5F5F5]">Add custom status state</p>
              <Input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Contacted, Follow-up, Confirmed…"
                className="h-8 text-xs"
              />
              <div className="flex justify-end gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  loading={saving}
                  disabled={!newLabel.trim()}
                >
                  Create
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
