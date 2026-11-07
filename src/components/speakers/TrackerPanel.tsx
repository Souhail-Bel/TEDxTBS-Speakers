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
    <div className="flex flex-wrap items-center gap-2">
      {trackers.map((t) => (
        <div
          key={t.profile_id}
          className="group flex items-center gap-2 rounded-full border border-[#342324] bg-[#140D0E] py-1 pl-1.5 pr-2.5 transition-colors hover:border-[#4A2E30]"
        >
          <InitialsAvatar
            name={t.profile?.full_name ?? "?"}
            src={t.profile?.avatar_url}
            size="xs"
          />
          <span className="text-xs font-medium text-[#F5F5F5]">
            {t.profile?.full_name}
          </span>
          <button
            type="button"
            onClick={() => handleToggle(t.profile_id, true)}
            disabled={busyId === t.profile_id}
            className="rounded-full p-0.5 text-[#777070] transition-colors hover:bg-[#261819] hover:text-[#EF4444]"
            title={`Remove ${t.profile?.full_name}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#3B2627] bg-[#140D0E]/70 px-3 py-1.5 text-xs font-medium text-[#A6A0A0] transition-colors hover:border-[#E31B2B]/50 hover:bg-[#1E1314] hover:text-[#F5F5F5]"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#E31B2B]" /> Assign coordinator
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-h-64 w-56 overflow-y-auto p-1.5" align="start">
          {!trackerIds.has(profile.id) && (
            <button
              type="button"
              onClick={() => {
                handleToggle(profile.id, false);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[#FF7583] hover:bg-[#241819]"
            >
              <UserPlus className="h-3.5 w-3.5 text-[#E31B2B]" /> Assign myself
            </button>
          )}
          {availableProfiles
            .filter((p) => p.id !== profile.id)
            .map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  handleToggle(p.id, false);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-[#F5F5F5] hover:bg-[#241819]"
              >
                <InitialsAvatar name={p.full_name} src={p.avatar_url} size="xs" />
                <span className="truncate">{p.full_name}</span>
              </button>
            ))}
          {availableProfiles.length === 0 && trackerIds.has(profile.id) && (
            <p className="px-2.5 py-2 text-xs text-[#777070]">
              Everyone is already tracking this speaker.
            </p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
