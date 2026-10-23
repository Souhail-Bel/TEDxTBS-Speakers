"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/speakers/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { updateSpeakerStatus } from "@/lib/speakers/mutations";
import { useProfile } from "@/components/auth/ProfileProvider";
import { STATUS_LABELS, type SpeakerStatus } from "@/lib/types";

const ALL_STATUSES: SpeakerStatus[] = ["no_reply", "unclear", "accepted", "refused"];

export function StatusChanger({
  speakerId,
  status,
  onChanged,
}: {
  speakerId: string;
  status: SpeakerStatus;
  onChanged?: (next: SpeakerStatus) => void;
}) {
  const profile = useProfile();
  const [current, setCurrent] = useState(status);
  const [updating, setUpdating] = useState(false);

  async function handleSelect(next: SpeakerStatus) {
    if (next === current || updating) return;
    const previous = current;
    setCurrent(next);
    setUpdating(true);
    try {
      const supabase = createClient();
      await updateSpeakerStatus(supabase, profile.id, speakerId, previous, next);
      onChanged?.(next);
    } catch {
      setCurrent(previous);
      toast.error("Couldn't update the status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full outline-none transition-opacity hover:opacity-85 disabled:opacity-50">
        <StatusBadge status={current} />
        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {ALL_STATUSES.map((s) => (
          <DropdownMenuItem key={s} onSelect={() => handleSelect(s)} className="justify-between gap-4">
            {STATUS_LABELS[s]}
            {s === current && <Check className="h-3.5 w-3.5 text-red-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
