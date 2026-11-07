"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Trash2, Pencil, MessageSquare, ExternalLink } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/speakers/StatusBadge";
import { TrackerAvatars } from "@/components/speakers/TrackerAvatars";
import { tagColor } from "@/lib/utils/tag-color";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SpeakerStatusOption, SpeakerWithRelations } from "@/lib/types";
import { TierBadge } from "@/components/speakers/TierBadge";

interface SpeakerTableProps {
  speakers: SpeakerWithRelations[];
  statuses?: SpeakerStatusOption[];
  onEdit: (speaker: SpeakerWithRelations) => void;
  onDeleteRequest: (speaker: SpeakerWithRelations) => void;
}

function cleanRelativeTime(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true }).replace(/^about\s+/i, "");
}

export function SpeakerTable({
  speakers,
  statuses,
  onEdit,
  onDeleteRequest,
}: SpeakerTableProps) {
  if (speakers.length === 0) {
    return (
      <div className="tedx-table-shell flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <p className="text-sm font-medium text-[#A6A0A0]">No speakers match your filters.</p>
        <p className="mt-1 text-xs text-[#777070]">
          Try clearing active tag or status filters, or add a new speaker.
        </p>
      </div>
    );
  }

  return (
    <div className="tedx-table-shell overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="tedx-table-head border-b border-[#341E20] text-left text-xs font-medium text-[#C8C0C0]">
              <th className="px-5 py-3.5 font-medium">Speaker</th>
              <th className="px-4 py-3.5 font-medium">Tier</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-4 py-3.5 font-medium">Tags</th>
              <th className="px-4 py-3.5 font-medium">Tracking</th>
              <th className="px-4 py-3.5 font-medium">Added</th>
              <th className="w-12 px-4 py-3.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {speakers.map((speaker) => (
                <motion.tr
                  key={speaker.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="group border-b border-[#211516] last:border-0 transition-colors hover:bg-[#1E1314]/85"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/speakers/${speaker.id}`}
                      className="flex items-center gap-3.5 outline-none"
                    >
                      {speaker.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={speaker.photo_url}
                          alt={speaker.name}
                          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                        />
                      ) : (
                        <InitialsAvatar name={speaker.name} size="sm" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold text-[#F5F5F5] transition-colors group-hover:text-[#FF5C6C]">
                          {speaker.name}
                        </p>
                        <p className="truncate text-xs text-[#8A8282]">
                          {speaker.origin || "—"}
                        </p>
                      </div>
                      {speaker.comment_count > 0 && (
                        <span
                          className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#342425] bg-[#1C1314] px-2 py-0.5 text-[10.5px] text-[#A6A0A0]"
                          title={`${speaker.comment_count} timeline notes`}
                        >
                          <MessageSquare className="h-2.5 w-2.5 text-[#E31B2B]" />
                          {speaker.comment_count}
                        </span>
                      )}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <TierBadge tier={speaker.importance} />
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={speaker.status} statuses={statuses} />
                  </td>

                  <td className="px-4 py-3">
                    {speaker.tags.length === 0 ? (
                      <span className="text-xs text-[#6E6666]">—</span>
                    ) : (
                      <div className="flex max-w-52 flex-wrap gap-1">
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
                              className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                        {speaker.tags.length > 3 && (
                          <span className="self-center text-[11px] text-[#777070]">
                            +{speaker.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <TrackerAvatars trackers={speaker.trackers} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-xs text-[#9A9292]">
                    {cleanRelativeTime(speaker.created_at)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="rounded-lg p-1.5 text-[#8A8282] transition-colors hover:bg-[#26191A] hover:text-[#F5F5F5] data-[state=open]:bg-[#26191A] data-[state=open]:text-[#F5F5F5] outline-none"
                        aria-label={`Actions for ${speaker.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/speakers/${speaker.id}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-[#A6A0A0]" />
                            Open profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onEdit(speaker)}
                          className="gap-2 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-[#A6A0A0]" />
                          Edit speaker
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onDeleteRequest(speaker)}
                          className="gap-2 cursor-pointer text-[#FF3B4E] focus:bg-[#E31B2B]/15 focus:text-[#FF7583]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Move to trash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
