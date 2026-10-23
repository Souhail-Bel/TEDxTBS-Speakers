"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Plus, Mail, Phone, Pencil, Trash2, Shield, MoreHorizontal } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FacebookIcon } from "@/components/icons/BrandIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/speakers/ConfirmDialog";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { useProfile } from "@/components/auth/ProfileProvider";
import type { Profile } from "@/lib/types";
import type { LatestCommentByAuthor } from "@/lib/team/queries";

export function TeamListClient({
  members: initialMembers,
  latestComments,
}: {
  members: Profile[];
  latestComments: Record<string, LatestCommentByAuthor>;
}) {
  const profile = useProfile();
  const [members, setMembers] = useState(initialMembers);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  // Bumped every time the form is opened, so TeamMemberForm remounts fresh.
  const [formKey, setFormKey] = useState(0);
  const [removeTarget, setRemoveTarget] = useState<Profile | null>(null);
  const [removing, setRemoving] = useState(false);

  function refetchLocal() {
    // Simple full reload keeps this page in sync without building a second
    // realtime subscription just for an admin-only, low-traffic page.
    window.location.reload();
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Team</h1>
          <p className="text-sm text-text-tertiary">Manage who has access and at what level.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormKey((k) => k + 1);
            setFormOpen(true);
          }}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add team member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {members.map((member) => {
          const latest = latestComments[member.id];
          return (
            <Card key={member.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={member.full_name} size="md" />
                  <div>
                    <p className="font-medium text-text-primary">{member.full_name}</p>
                    <Badge variant={member.role === "admin" ? "red" : "default"} className="mt-0.5">
                      {member.role === "admin" && <Shield className="h-3 w-3" />}
                      {member.role === "admin" ? "Admin" : "Team member"}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-2 hover:text-text-primary">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        setEditing(member);
                        setFormKey((k) => k + 1);
                        setFormOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </DropdownMenuItem>
                    {member.id !== profile.id && (
                      <DropdownMenuItem
                        onSelect={() => setRemoveTarget(member)}
                        className="gap-2 text-red-400 focus:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-text-tertiary" />
                  <a href={`mailto:${member.email}`} className="truncate hover:text-red-300">
                    {member.email}
                  </a>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-text-tertiary" />
                    <a href={`tel:${member.phone}`} className="hover:text-red-300">
                      {member.phone}
                    </a>
                  </div>
                )}
                {member.facebook_url && (
                  <div className="flex items-center gap-2">
                    <FacebookIcon className="h-3.5 w-3.5 text-text-tertiary" />
                    <a
                      href={member.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:text-red-300"
                    >
                      {member.facebook_url}
                    </a>
                  </div>
                )}
              </div>

              {latest && (
                <Link
                  href={`/speakers/${latest.speaker_id}`}
                  className="mt-3 block rounded-lg border border-border-subtle bg-surface-2/60 px-3 py-2 text-xs transition-colors hover:border-red-500/30"
                >
                  <p className="mb-0.5 text-text-tertiary">
                    Latest, on <span className="text-text-secondary">{latest.speaker_name}</span> ·{" "}
                    {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}
                  </p>
                  <p className="line-clamp-2 text-text-primary">{latest.body}</p>
                </Link>
              )}
            </Card>
          );
        })}
      </div>

      <TeamMemberForm
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editing}
        currentUserId={profile.id}
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
