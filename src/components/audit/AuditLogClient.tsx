"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  UserPlus,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Tag as TagIcon,
  Shield,
  UserMinus,
  PlusCircle,
} from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuditLogEntryWithActor } from "@/lib/audit/queries";
import type { AuditAction } from "@/lib/audit/log";

const ACTION_META: Record<
  AuditAction,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  "speaker.created": { label: "Added speaker", icon: PlusCircle, color: "text-status-accepted" },
  "speaker.updated": { label: "Updated speaker", icon: Pencil, color: "text-text-secondary" },
  "speaker.status_changed": { label: "Changed status", icon: CheckCircle2, color: "text-status-unclear" },
  "speaker.tag_added": { label: "Added tag", icon: TagIcon, color: "text-text-secondary" },
  "speaker.tag_removed": { label: "Removed tag", icon: TagIcon, color: "text-text-secondary" },
  "speaker.delete_requested": { label: "Moved speaker to trash", icon: Trash2, color: "text-status-refused" },
  "speaker.delete_confirmed": { label: "Permanently deleted speaker", icon: Trash2, color: "text-status-refused" },
  "speaker.restored": { label: "Restored speaker", icon: RotateCcw, color: "text-status-accepted" },
  "team_member.invited": { label: "Invited team member", icon: UserPlus, color: "text-status-accepted" },
  "team_member.updated": { label: "Updated team member", icon: Pencil, color: "text-text-secondary" },
  "team_member.removed": { label: "Removed team member", icon: UserMinus, color: "text-status-refused" },
  "team_member.role_changed": { label: "Changed role", icon: Shield, color: "text-red-400" },
};

export function AuditLogClient({ entries }: { entries: AuditLogEntryWithActor[] }) {
  const [filter, setFilter] = useState<"all" | "speaker" | "profile">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.entity_type === filter);
  }, [entries, filter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Audit log</h1>
          <p className="text-sm text-text-tertiary">Who did what, and when — most recent 200 actions.</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            <SelectItem value="speaker">Speaker changes</SelectItem>
            <SelectItem value="profile">Team changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="divide-y divide-border-subtle">
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-text-tertiary">No activity yet.</p>
        ) : (
          filtered.map((entry) => {
            const meta = ACTION_META[entry.action as AuditAction] ?? {
              label: entry.action,
              icon: Pencil,
              color: "text-text-secondary",
            };
            const Icon = meta.icon;
            return (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <div className={`mt-0.5 ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{entry.actor?.full_name ?? "Deleted user"}</span>{" "}
                    <span className="text-text-secondary">{meta.label.toLowerCase()}</span>
                    {typeof entry.metadata?.name === "string" && (
                      <>
                        {" "}
                        <span className="text-text-primary">&quot;{entry.metadata.name as string}&quot;</span>
                      </>
                    )}
                  </p>
                  {entry.action === "speaker.status_changed" &&
                    typeof entry.metadata?.from === "string" &&
                    typeof entry.metadata?.to === "string" && (
                      <p className="text-xs text-text-tertiary">
                        {entry.metadata.from as string} &rarr; {entry.metadata.to as string}
                      </p>
                    )}
                  <p
                    className="mt-0.5 text-xs text-text-tertiary"
                    title={format(new Date(entry.created_at), "PPpp")}
                  >
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </p>
                </div>
                <InitialsAvatar name={entry.actor?.full_name ?? "?"} size="xs" />
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
