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
  History,
  Search,
  ArrowRight,
} from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditLogEntryWithActor } from "@/lib/audit/queries";
import type { AuditAction } from "@/lib/audit/log";

const ACTION_META: Record<
  AuditAction,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    wrapClass: string;
  }
> = {
  "speaker.created": {
    label: "Added speaker",
    icon: PlusCircle,
    wrapClass: "border-[#22C55E]/30 bg-[#22C55E]/12 text-[#22C55E]",
  },
  "speaker.updated": {
    label: "Updated speaker",
    icon: Pencil,
    wrapClass: "border-[#382626] bg-[#1E1415] text-[#C8C0C0]",
  },
  "speaker.status_changed": {
    label: "Changed status",
    icon: CheckCircle2,
    wrapClass: "border-[#F59E0B]/30 bg-[#F59E0B]/12 text-[#F59E0B]",
  },
  "speaker.tag_added": {
    label: "Added tag",
    icon: TagIcon,
    wrapClass: "border-[#382626] bg-[#1E1415] text-[#C8C0C0]",
  },
  "speaker.tag_removed": {
    label: "Removed tag",
    icon: TagIcon,
    wrapClass: "border-[#382626] bg-[#1E1415] text-[#8A8282]",
  },
  "speaker.delete_requested": {
    label: "Moved speaker to trash",
    icon: Trash2,
    wrapClass: "border-[#EF4444]/30 bg-[#EF4444]/12 text-[#EF4444]",
  },
  "speaker.delete_confirmed": {
    label: "Permanently deleted speaker",
    icon: Trash2,
    wrapClass: "border-[#EF4444]/40 bg-[#EF4444]/18 text-[#FF5C6C]",
  },
  "speaker.restored": {
    label: "Restored speaker",
    icon: RotateCcw,
    wrapClass: "border-[#22C55E]/30 bg-[#22C55E]/12 text-[#22C55E]",
  },
  "team_member.invited": {
    label: "Invited team member",
    icon: UserPlus,
    wrapClass: "border-[#22C55E]/30 bg-[#22C55E]/12 text-[#22C55E]",
  },
  "team_member.updated": {
    label: "Updated team member",
    icon: Pencil,
    wrapClass: "border-[#382626] bg-[#1E1415] text-[#C8C0C0]",
  },
  "team_member.removed": {
    label: "Removed team member",
    icon: UserMinus,
    wrapClass: "border-[#EF4444]/30 bg-[#EF4444]/12 text-[#EF4444]",
  },
  "team_member.role_changed": {
    label: "Changed role",
    icon: Shield,
    wrapClass: "border-[#E31B2B]/35 bg-[#E31B2B]/15 text-[#FF5C6C]",
  },
};

export function AuditLogClient({ entries }: { entries: AuditLogEntryWithActor[] }) {
  const [filter, setFilter] = useState<"all" | "speaker" | "profile">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== "all" && e.entity_type !== filter) return false;
      if (!q) return true;
      const actor = (e.actor?.full_name ?? "").toLowerCase();
      const target = typeof e.metadata?.name === "string" ? e.metadata.name.toLowerCase() : "";
      const action = e.action.toLowerCase();
      return actor.includes(q) || target.includes(q) || action.includes(q);
    });
  }, [entries, filter, search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#382325] bg-gradient-to-br from-[#201214] via-[#140D0E] to-[#0D0909] p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(227,27,43,0.18) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/15 text-[#FF3B4E]">
            <History className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-3xl">
                Audit <span className="text-[#E31B2B]">Log</span>
              </h1>
              <span className="rounded-full border border-[#382626] bg-[#1E1415] px-2.5 py-0.5 text-xs font-semibold text-[#C8C0C0]">
                {filtered.length} events
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#A6A0A0]">
              Chronological record of speaker pipeline updates, status transitions, and team administration (latest 200 events).
            </p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888080]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by coordinator, speaker name, or action…"
            className="h-10 rounded-xl border-[#332323] bg-[#120C0D] pl-10 text-sm"
          />
        </div>

        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="h-10 w-48 rounded-xl border-[#332323] bg-[#140D0E] text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platform activity</SelectItem>
            <SelectItem value="speaker">Speaker changes</SelectItem>
            <SelectItem value="profile">Team changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chronological Event Feed */}
      <div className="tedx-table-shell overflow-hidden rounded-2xl divide-y divide-[#221617]">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-[#A6A0A0]">No matching audit entries.</p>
          </div>
        ) : (
          filtered.map((entry) => {
            const meta = ACTION_META[entry.action as AuditAction] ?? {
              label: entry.action,
              icon: Pencil,
              wrapClass: "border-[#382626] bg-[#1E1415] text-[#C8C0C0]",
            };
            const Icon = meta.icon;
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#1B1213]/80"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.wrapClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#E5E0E0]">
                    <span className="font-semibold text-[#F5F5F5]">
                      {entry.actor?.full_name ?? "Deleted user"}
                    </span>{" "}
                    <span className="text-[#A6A0A0]">{meta.label.toLowerCase()}</span>
                    {typeof entry.metadata?.name === "string" && (
                      <>
                        {" "}
                        <span className="font-semibold text-[#FF7583]">
                          “{entry.metadata.name as string}”
                        </span>
                      </>
                    )}
                  </p>

                  {entry.action === "speaker.status_changed" &&
                    typeof entry.metadata?.from === "string" &&
                    typeof entry.metadata?.to === "string" && (
                      <div className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-[#322122] bg-[#120C0D] px-2 py-0.5 text-[11px] text-[#C8C0C0]">
                        <span>{entry.metadata.from as string}</span>
                        <ArrowRight className="h-3 w-3 text-[#E31B2B]" />
                        <span className="font-semibold text-[#F5F5F5]">
                          {entry.metadata.to as string}
                        </span>
                      </div>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className="hidden text-xs text-[#8A8282] sm:inline"
                    title={format(new Date(entry.created_at), "PPpp")}
                  >
                    {formatDistanceToNow(new Date(entry.created_at), {
                      addSuffix: true,
                    }).replace(/^about\s+/i, "")}
                  </span>
                  <InitialsAvatar
                    name={entry.actor?.full_name ?? "?"}
                    src={entry.actor?.avatar_url}
                    size="xs"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
