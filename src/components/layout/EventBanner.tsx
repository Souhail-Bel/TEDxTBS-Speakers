"use client";

import { differenceInCalendarDays, format } from "date-fns";
import { CalendarDays } from "lucide-react";

export function EventBanner({ eventDate }: { eventDate: string | null }) {
  if (!eventDate) return null;

  const date = new Date(eventDate);
  const days = differenceInCalendarDays(date, new Date());
  const label =
    days > 1
      ? `${days} days to go`
      : days === 1
      ? "Tomorrow"
      : days === 0
      ? "Today"
      : "Date has passed";

  return (
    <div className="border-b border-[#3A1E20] bg-gradient-to-r from-[#2A0B0E]/90 via-[#160A0B]/95 to-[#0B0808] lg:pr-24">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2.5 px-5 py-2 text-xs sm:px-7">
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#E31B2B]" />
        <span className="text-[#A6A0A0]">
          TEDxTBS Event Date:{" "}
          <span className="font-semibold text-[#F5F5F5]">
            {format(date, "d MMMM yyyy")}
          </span>
        </span>
        <span className="ml-auto rounded-full border border-[#E31B2B]/30 bg-[#E31B2B]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#FF7583]">
          {label}
        </span>
      </div>
    </div>
  );
}
