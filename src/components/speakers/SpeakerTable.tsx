"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Trash2, Pencil, MessageSquare } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/speakers/StatusBadge";
import { TrackerAvatars } from "@/components/speakers/TrackerAvatars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SpeakerWithRelations } from "@/lib/types";

interface SpeakerTableProps {
  speakers: SpeakerWithRelations[];
  onEdit: (speaker: SpeakerWithRelations) => void;
  onDeleteRequest: (speaker: SpeakerWithRelations) => void;
}

export function SpeakerTable({ speakers, onEdit, onDeleteRequest }: SpeakerTableProps) {
  if (speakers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-text-secondary">No speakers match your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-1 text-left text-xs text-text-tertiary">
              <th className="px-4 py-3 font-medium">Speaker</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Tracking</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 font-medium" />
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
                  transition={{ duration: 0.15 }}
                  className="group border-b border-border-subtle last:border-0 hover:bg-surface-1/60"
                >
                  <td className="px-4 py-3">
                    <Link href={`/speakers/${speaker.id}`} className="flex items-center gap-3">
                      {speaker.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={speaker.photo_url}
                          alt={speaker.name}
                          className="h-9 w-9 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <InitialsAvatar name={speaker.name} />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text-primary group-hover:text-red-300 transition-colors">
                          {speaker.name}
                        </p>
                        <p className="truncate text-xs text-text-tertiary">{speaker.origin}</p>
                      </div>
                      {speaker.comment_count > 0 && (
                        <span className="ml-1 flex shrink-0 items-center gap-1 text-xs text-text-tertiary">
                          <MessageSquare className="h-3 w-3" /> {speaker.comment_count}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={speaker.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-48 flex-wrap gap-1">
                      {speaker.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-text-secondary"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {speaker.tags.length > 3 && (
                        <span className="text-[11px] text-text-tertiary">+{speaker.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TrackerAvatars trackers={speaker.trackers} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-tertiary">
                    {formatDistanceToNow(new Date(speaker.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-md p-1.5 text-text-tertiary opacity-0 transition-opacity hover:bg-surface-2 hover:text-text-primary group-hover:opacity-100 data-[state=open]:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEdit(speaker)} className="gap-2">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onDeleteRequest(speaker)}
                          className="gap-2 text-red-400 focus:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Move to trash
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
