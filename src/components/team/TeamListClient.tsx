"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Shield,
  MoreHorizontal,
  Users,
  Mic2,
  Search,
  MessageSquare,
} from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FacebookIcon } from "@/components/icons/BrandIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/speakers/ConfirmDialog";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { useIsAdmin, useProfile } from "@/components/auth/ProfileProvider";
import type { Profile } from "@/lib/types";
import type { LatestCommentByAuthor, TeamMemberStats } from "@/lib/team/queries";

export function TeamListClient({
  members: initialMembers,
  latestComments,
  speakerStats = {},
}: {
  members: Profile[];
  latestComments: Record<string, LatestCommentByAuthor>;
  speakerStats?: Record<string, TeamMemberStats>;
}) {
  const profile = useProfile();
  const isAdmin = useIsAdmin();
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  // Bumped every time the form is opened, so TeamMemberForm remounts fresh.
  const [formKey, setFormKey] = useState(0);
  const [removeTarget, setRemoveTarget] = useState<Profile | null>(null);
  const [removing, setRemoving] = useState(false);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.bio ?? "").toLowerCase().includes(q)
    );
  }, [members, search]);

  const adminCount = useMemo(
    () => members.filter((m) => m.role === "admin").length,
    [members]
  );

  function refetchLocal() {
    window.location.reload();
  }

  function handleOpenEdit(member: Profile) {
    setEditing(member);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/team/${removeTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't remove that team member.");
      toast.success(`${removeTarget.full_name} removed`);
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
      setRemoveTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#382325] bg-gradient-to-br from-[#201214] via-[#140D0E] to-[#0D0909] p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(227,27,43,0.18) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/15 text-[#FF3B4E]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-3xl">
                  Curation <span className="text-[#E31B2B]">Team</span>
                </h1>
                <span className="rounded-full border border-[#382626] bg-[#1E1415] px-2.5 py-0.5 text-xs font-semibold text-[#C8C0C0]">
                  {members.length} members · {adminCount} {adminCount === 1 ? "admin" : "admins"}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#A6A0A0]">
                Coordinator profiles, contact channels, team roles, and live speaker outreach metrics.
              </p>
            </div>
          </div>

          {isAdmin && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormKey((k) => k + 1);
                setFormOpen(true);
              }}
              className="gap-1.5 self-start sm:self-center"
            >
              <Plus className="h-4 w-4 stroke-[2.4]" /> Add team member
            </Button>
          )}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888080]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team members by name, email, or role…"
          className="h-10 rounded-xl border-[#332323] bg-[#120C0D] pl-10 text-sm"
        />
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredMembers.map((member) => {
          const latest = latestComments[member.id];
          const stat = speakerStats[member.id];
          const contactedCount =
            member.contacted_count !== null && member.contacted_count !== undefined
              ? member.contacted_count
              : stat?.computedContactedCount ?? 0;
          const trackingCount = stat?.trackingCount ?? 0;

          return (
            <div
              key={member.id}
              className="tedx-surface flex flex-col justify-between rounded-2xl p-5 transition-colors hover:border-[#4A2B2E]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <InitialsAvatar
                      name={member.full_name}
                      src={member.avatar_url}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[#F5F5F5]">
                        {member.full_name}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant={member.role === "admin" ? "red" : "default"}>
                          {member.role === "admin" && <Shield className="h-3 w-3" />}
                          {member.role === "admin" ? "Admin" : "Coordinator"}
                        </Badge>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#382425] bg-[#140D0E] px-2.5 py-0.5 text-[11px] font-medium text-[#E5E0E0]">
                          <Mic2 className="h-3 w-3 text-[#E31B2B]" />
                          {contactedCount} contacted
                        </span>
                        {trackingCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#2F2021] bg-[#140D0E] px-2 py-0.5 text-[11px] text-[#A6A0A0]">
                            <Users className="h-3 w-3 text-[#A6A0A0]" />
                            Tracking {trackingCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEdit(member)}
                      className="h-8 gap-1 px-2.5 text-xs"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    {isAdmin && member.id !== profile.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="rounded-lg p-1.5 text-[#8A8282] hover:bg-[#241819] hover:text-[#F5F5F5] outline-none"
                          aria-label={`More actions for ${member.full_name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onSelect={() => handleOpenEdit(member)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-[#A6A0A0]" /> Edit profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setRemoveTarget(member)}
                            className="gap-2 cursor-pointer text-[#FF3B4E] focus:bg-[#E31B2B]/15 focus:text-[#FF7583]"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Who they are / Bio */}
                <div className="mt-4 rounded-xl border border-[#2A1C1D] bg-[#110B0C]/85 px-3.5 py-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A8282]">
                    About / Role in Team
                  </p>
                  {member.bio ? (
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#E5E0E0]">
                      {member.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-[#777070]">
                      No bio added yet.{" "}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(member)}
                        className="font-medium text-[#FF5C6C] hover:underline"
                      >
                        Add info about who they are
                      </button>
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="mt-3.5 space-y-1.5 text-xs text-[#A6A0A0]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#E31B2B]/80" />
                    <a
                      href={`mailto:${member.email}`}
                      className="truncate transition-colors hover:text-[#FF7583]"
                    >
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[#E31B2B]/80" />
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone}`}
                        className="transition-colors hover:text-[#FF7583]"
                      >
                        {member.phone}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(member)}
                        className="text-xs text-[#777070] transition-colors hover:text-[#FF7583]"
                      >
                        + Add phone number
                      </button>
                    )}
                  </div>
                  {member.facebook_url && (
                    <div className="flex items-center gap-2">
                      <FacebookIcon className="h-3.5 w-3.5 shrink-0 text-[#E31B2B]/80" />
                      <a
                        href={member.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate transition-colors hover:text-[#FF7583]"
                      >
                        {member.facebook_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {latest && (
                <Link
                  href={`/speakers/${latest.speaker_id}`}
                  className="mt-4 block rounded-xl border border-[#2C1D1E] bg-[#120C0D]/90 px-3.5 py-2.5 text-xs transition-colors hover:border-[#E31B2B]/45 hover:bg-[#1A1112]"
                >
                  <p className="mb-1 flex items-center gap-1.5 text-[11px] text-[#8A8282]">
                    <MessageSquare className="h-3 w-3 text-[#E31B2B]" />
                    <span>
                      Latest note on{" "}
                      <strong className="font-semibold text-[#E5E0E0]">
                        {latest.speaker_name}
                      </strong>{" "}
                      ·{" "}
                      {formatDistanceToNow(new Date(latest.created_at), {
                        addSuffix: true,
                      }).replace(/^about\s+/i, "")}
                    </span>
                  </p>
                  <p className="line-clamp-2 text-[#C8C0C0]">{latest.body}</p>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <TeamMemberForm
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editing}
        computedContactedCount={
          editing ? speakerStats[editing.id]?.computedContactedCount ?? 0 : 0
        }
        currentUserId={profile.id}
        isAdmin={isAdmin}
        onSaved={refetchLocal}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title={`Remove ${removeTarget?.full_name ?? "this team member"}?`}
        description="They'll immediately lose access to the platform. Speakers and comments they added will stay, just no longer attributed to an active account."
        confirmLabel="Remove"
        loading={removing}
        onConfirm={handleRemove}
      />
    </div>
  );
}
