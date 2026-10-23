"use client";

import { differenceInCalendarDays, format } from "date-fns";
import { CalendarDays } from "lucide-react";

export function EventBanner({ eventDate }: { eventDate: string | null }) {
  if (!eventDate) return null;

  const date = new Date(eventDate);
  const days = differenceInCalendarDays(date, new Date());
  const label =
    days > 1 ? `${days} days to go` : days === 1 ? "Tomorrow" : days === 0 ? "Today" : "Date has passed";

  return (
    <div className="border-b border-red-500/20 bg-gradient-to-r from-red-900/30 via-red-900/10 to-transparent">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-sm">
        <CalendarDays className="h-4 w-4 text-red-400" />
        <span className="text-text-secondary">
          TEDxTBS is on <span className="font-medium text-text-primary">{format(date, "d MMMM yyyy")}</span>
        </span>
        <span className="ml-auto rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300">
          {label}
        </span>
      </div>
    </div>
  );
}
