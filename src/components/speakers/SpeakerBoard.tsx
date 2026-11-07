"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { TrackerAvatars } from "@/components/speakers/TrackerAvatars";
import { tagColor } from "@/lib/utils/tag-color";
import {
  DEFAULT_STATUSES,
  type SpeakerStatusOption,
  type SpeakerWithRelations,
} from "@/lib/types";
import { TierBadge } from "@/components/speakers/TierBadge";
import { cn } from "@/lib/utils/cn";

const BUILTIN_COLUMN_STYLE: Record<
  string,
  { dot: string; topBorder: string; countBadge: string }
> = {
  no_reply: {
    dot: "bg-[#9CA3AF]",
    topBorder: "border-t-[#9CA3AF]",
    countBadge: "bg-[#241D1D] text-[#B8B0B0] border-[#382C2C]",
  },
  unclear: {
    dot: "bg-[#F59E0B]",
    topBorder: "border-t-[#F59E0B]",
    countBadge: "bg-[#F59E0B]/12 text-[#FCD34D] border-[#F59E0B]/30",
  },
  accepted: {
    dot: "bg-[#22C55E]",
    topBorder: "border-t-[#22C55E]",
    countBadge: "bg-[#22C55E]/12 text-[#86EFAC] border-[#22C55E]/30",
  },
  refused: {
    dot: "bg-[#EF4444]",
    topBorder: "border-t-[#EF4444]",
    countBadge: "bg-[#EF4444]/12 text-[#FCA5A5] border-[#EF4444]/30",
  },
};

export function SpeakerBoard({
  speakers,
  statuses = DEFAULT_STATUSES,
}: {
  speakers: SpeakerWithRelations[];
  statuses?: SpeakerStatusOption[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statuses.map((status) => {
        const items = speakers.filter((s) => s.status === status.slug);
        const builtin = BUILTIN_COLUMN_STYLE[status.slug];
        const customColor = !builtin ? tagColor(status.slug) : null;

        return (
          <div
            key={status.slug}
            style={customColor ? { borderTopColor: customColor.text } : undefined}
            className={cn(
              "tedx-surface flex flex-col gap-3 rounded-2xl border-t-2 p-3.5",
              builtin?.topBorder
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 pt-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full", builtin?.dot)}
                  style={customColor ? { backgroundColor: customColor.text } : undefined}
                />
                <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-[#F5F5F5]">
                  {status.label}
                </h3>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                  builtin?.countBadge ?? "border-[#382626] bg-[#221717] text-[#E5E0E0]"
                )}
              >
                {items.length}
              </span>
            </div>

            {/* Cards Stack */}
            <div className="flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {items.map((speaker) => (
                  <motion.div
                    key={speaker.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={`/speakers/${speaker.id}`}
                      className="group block rounded-xl border border-[#2D1E1F] bg-[#120C0D]/90 p-3.5 transition-all duration-150 hover:border-[#E31B2B]/50 hover:bg-[#1B1213] hover:shadow-[0_8px_24px_-8px_rgba(227,27,43,0.22)]"
                    >
                      <div className="flex items-center gap-2.5">
                        {speaker.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={speaker.photo_url}
                            alt={speaker.name}
                            className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                          />
                        ) : (
                          <InitialsAvatar name={speaker.name} size="sm" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#F5F5F5] transition-colors group-hover:text-[#FF5C6C]">
                            {speaker.name}
                          </p>
                          <p className="truncate text-xs text-[#8A8282]">
                            {speaker.origin || "—"}
                          </p>
                        </div>
                        {speaker.importance && <TierBadge tier={speaker.importance} />}
                      </div>

                      {speaker.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {speaker.tags.slice(0, 3).map((tag) => {
                            const color = tagColor(tag.name);
                            return (
                              <span
                                key={tag.id}
                                style={{
                                  backgroundColor: color.background,
                                  borderColor: color.border,
                                  color: color.text,
                                }}
                                className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-[#221617] pt-2.5">
                        <TrackerAvatars trackers={speaker.trackers} max={3} />
                        {speaker.comment_count > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-[#9A9292]">
                            <MessageSquare className="h-3 w-3 text-[#E31B2B]" />
                            {speaker.comment_count}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#2A1B1C] py-6 text-center">
                  <p className="text-xs text-[#6E6666]">No speakers in this stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
