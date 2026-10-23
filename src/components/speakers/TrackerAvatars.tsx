"use client";

import { InitialsAvatar } from "@/components/ui/avatar";
import type { SpeakerWithRelations } from "@/lib/types";

export function TrackerAvatars({
  trackers,
  max = 4,
}: {
  trackers: SpeakerWithRelations["trackers"];
  max?: number;
}) {
  if (trackers.length === 0) {
    return <span className="text-xs text-text-tertiary">Nobody yet</span>;
  }

  const shown = trackers.slice(0, max);
  const overflow = trackers.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((t) => (
        <div key={t.profile_id} className="ring-2 ring-surface-1 rounded-full" title={t.profile?.full_name}>
          <InitialsAvatar name={t.profile?.full_name ?? "?"} size="xs" />
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-3 text-[9px] font-semibold text-text-secondary ring-2 ring-surface-1">
          +{overflow}
        </div>
      )}
    </div>
  );
}
