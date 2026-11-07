"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ImageCropUploader } from "@/components/media/ImageCropUploader";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function ProfileSettings({ profile }: { profile: Profile }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null);
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [contactedCount, setContactedCount] = useState<string>(
    profile.contacted_count !== null && profile.contacted_count !== undefined
      ? String(profile.contacted_count)
      : ""
  );
  const [facebookUrl, setFacebookUrl] = useState(profile.facebook_url ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const parsedContacted =
      contactedCount.trim() === "" ? null : Math.max(0, parseInt(contactedCount, 10) || 0);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
          facebook_url: facebookUrl || null,
          avatar_url: avatarUrl,
          bio: bio || null,
          contacted_count: parsedContacted,
        })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <User className="h-4 w-4 text-red-400" />
        <h2 className="text-sm font-semibold text-text-primary">Your profile</h2>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Profile picture</Label>
          <ImageCropUploader value={avatarUrl} onChange={setAvatarUrl} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Who are you (Role / Bio)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the team who you are, your role in TEDxTBS, or what speakers you focus on…"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contacted-count">Speakers contacted</Label>
            <Input
              id="contacted-count"
              type="number"
              min={0}
              value={contactedCount}
              onChange={(e) => setContactedCount(e.target.value)}
              placeholder="Auto"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook">Facebook link</Label>
            <Input
              id="facebook"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>
    </Card>
  );
}
