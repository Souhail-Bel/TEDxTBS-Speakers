"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { TrackerAvatars } from "@/components/speakers/TrackerAvatars";
import { tagColor } from "@/lib/utils/tag-color";
import { STATUS_LABELS, type SpeakerStatus, type SpeakerWithRelations } from "@/lib/types";

const COLUMNS: SpeakerStatus[] = ["no_reply", "unclear", "accepted", "refused"];

const COLUMN_ACCENT: Record<SpeakerStatus, string> = {
  no_reply: "border-t-status-no-reply",
  unclear: "border-t-status-unclear",
  accepted: "border-t-status-accepted",
  refused: "border-t-status-refused",
};

export function SpeakerBoard({ speakers }: { speakers: SpeakerWithRelations[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((status) => {
        const items = speakers.filter((s) => s.status === status);
        return (
          <div
            key={status}
            className={`flex flex-col gap-3 rounded-2xl border border-border border-t-2 ${COLUMN_ACCENT[status]} bg-surface-1/50 p-3`}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-text-primary">{STATUS_LABELS[status]}</h3>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-tertiary">
                {items.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
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
                      className="block rounded-xl border border-border bg-surface-1 p-3 transition-colors hover:border-red-500/40 hover:bg-surface-2"
                    >
                      <div className="flex items-center gap-2.5">
                        {speaker.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={speaker.photo_url}
                            alt={speaker.name}
                            className="h-8 w-8 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <InitialsAvatar name={speaker.name} size="sm" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-text-primary">{speaker.name}</p>
                          <p className="truncate text-xs text-text-tertiary">{speaker.origin}</p>
                        </div>
                      </div>

                      {speaker.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {speaker.tags.slice(0, 2).map((tag) => {
                            const color = tagColor(tag.name);
                            return (
                              <span
                                key={tag.id}
                                style={{ backgroundColor: color.background, color: color.text }}
                                className="rounded-full px-2 py-0.5 text-[10px]"
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center justify-between">
                        <TrackerAvatars trackers={speaker.trackers} max={3} />
                        {speaker.comment_count > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                            <MessageSquare className="h-3 w-3" /> {speaker.comment_count}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-text-tertiary">No speakers here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
