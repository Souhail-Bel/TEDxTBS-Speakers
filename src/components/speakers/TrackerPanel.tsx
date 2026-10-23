"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { toggleTracker } from "@/lib/speakers/mutations";
import { useProfile } from "@/components/auth/ProfileProvider";
import type { Profile, SpeakerWithRelations } from "@/lib/types";

export function TrackerPanel({
  speakerId,
  trackers,
  allProfiles,
  onChanged,
}: {
  speakerId: string;
  trackers: SpeakerWithRelations["trackers"];
  allProfiles: Profile[];
  onChanged?: () => void;
}) {
  const profile = useProfile();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const trackerIds = new Set(trackers.map((t) => t.profile_id));
  const availableProfiles = allProfiles.filter((p) => !trackerIds.has(p.id));

  async function handleToggle(profileId: string, isTracking: boolean) {
    setBusyId(profileId);
    try {
      const supabase = createClient();
      await toggleTracker(supabase, speakerId, profileId, isTracking);
      onChanged?.();
    } catch {
      toast.error("Couldn't update tracking. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {trackers.map((t) => (
          <div
            key={t.profile_id}
            className="group flex items-center gap-1.5 rounded-full border border-border bg-surface-2 py-1 pl-1 pr-2"
          >
            <InitialsAvatar name={t.profile?.full_name ?? "?"} size="xs" />
            <span className="text-xs text-text-primary">{t.profile?.full_name}</span>
            <button
              onClick={() => handleToggle(t.profile_id, true)}
              disabled={busyId === t.profile_id}
              className="text-text-tertiary transition-colors hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-text-tertiary transition-colors hover:border-red-500/40 hover:text-red-300">
              <UserPlus className="h-3.5 w-3.5" /> Add
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 max-h-60 overflow-y-auto p-1">
            {!trackerIds.has(profile.id) && (
              <button
                onClick={() => {
                  handleToggle(profile.id, false);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-300 hover:bg-surface-3"
              >
                <UserPlus className="h-3.5 w-3.5" /> Assign myself
              </button>
            )}
            {availableProfiles
              .filter((p) => p.id !== profile.id)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    handleToggle(p.id, false);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-primary hover:bg-surface-3"
                >
                  <InitialsAvatar name={p.full_name} size="xs" /> {p.full_name}
                </button>
              ))}
            {availableProfiles.length === 0 && trackerIds.has(profile.id) && (
              <p className="px-2 py-1.5 text-xs text-text-tertiary">Everyone is already tracking this speaker.</p>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
