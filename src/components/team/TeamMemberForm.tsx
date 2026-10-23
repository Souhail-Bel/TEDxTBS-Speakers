"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/lib/types";

interface TeamMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Profile | null;
  currentUserId: string;
  onSaved?: () => void;
}

export function TeamMemberForm({ open, onOpenChange, member, currentUserId, onSaved }: TeamMemberFormProps) {
  const isEdit = Boolean(member);

  const [fullName, setFullName] = useState(member?.full_name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [facebookUrl, setFacebookUrl] = useState(member?.facebook_url ?? "");
  const [role, setRole] = useState<"admin" | "member">(member?.role ?? "member");
  const [mode, setMode] = useState<"invite" | "temp_password">("invite");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // No reset-on-open effect: the parent remounts this component (via a
  // `key` bumped on each "add"/"edit" click) whenever it's reopened, so the
  // useState initial values above are already correct on every mount.

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEdit && member) {
        const res = await fetch(`/api/team/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            phone,
            facebookUrl,
            role: member.id === currentUserId ? undefined : role,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Couldn't save changes.");
        toast.success(`${fullName} updated`);
        onOpenChange(false);
        onSaved?.();
      } else {
        const res = await fetch("/api/auth/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName, role, phone, facebookUrl, mode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Couldn't add that team member.");

        if (mode === "temp_password" && data.tempPassword) {
          setTempPassword(data.tempPassword);
          toast.success(`${fullName} added`, { description: "Share the temporary password with them securely." });
          onSaved?.();
        } else {
          toast.success(`Invite sent to ${email}`);
          onOpenChange(false);
          onSaved?.();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyPassword() {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit team member" : "Add a team member"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update their details below." : "They'll get an email to set their own password."}
          </DialogDescription>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Account created. Share this temporary password with {fullName} — they should change it after
              signing in.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <code className="flex-1 font-mono text-sm text-text-primary">{tempPassword}</code>
              <button
                onClick={handleCopyPassword}
                className="text-text-tertiary transition-colors hover:text-red-400"
              >
                {copied ? <Check className="h-4 w-4 text-status-accepted" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name *</Label>
              <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                disabled={isEdit}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="facebook">Facebook link</Label>
              <Input
                id="facebook"
                value={facebookUrl ?? ""}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/…"
              />
            </div>

            {(!isEdit || member?.id !== currentUserId) && (
              <div className="space-y-1.5">
                <Label htmlFor="role">Privilege level</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "admin" | "member")}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Team member</SelectItem>
                    <SelectItem value="admin">Admin (highest privilege)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="mode">Account setup</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as "invite" | "temp_password")}>
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invite">Email them an invite link (recommended)</SelectItem>
                    <SelectItem value="temp_password">Generate a temporary password instead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                {isEdit ? "Save changes" : "Add team member"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
