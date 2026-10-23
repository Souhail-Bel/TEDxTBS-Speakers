import { cn } from "@/lib/utils/cn";
import { STATUS_LABELS, type SpeakerStatus } from "@/lib/types";

const ORDER: SpeakerStatus[] = ["accepted", "no_reply", "unclear", "refused"];

const DOT_CLASS: Record<SpeakerStatus, string> = {
  accepted: "bg-status-accepted",
  no_reply: "bg-status-no-reply",
  unclear: "bg-status-unclear",
  refused: "bg-status-refused",
};

export function StatsStrip({
  total,
  counts,
  activeStatus,
  onToggleStatus,
}: {
  total: number;
  counts: Record<SpeakerStatus, number>;
  activeStatus: Set<SpeakerStatus>;
  onToggleStatus: (s: SpeakerStatus) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="rounded-xl border border-border bg-surface-1 px-4 py-2.5">
        <p className="text-xs text-text-tertiary">Total speakers</p>
        <p className="text-xl font-semibold text-text-primary">{total}</p>
      </div>
      {ORDER.map((status) => {
        const isActive = activeStatus.has(status);
        return (
          <button
            key={status}
            onClick={() => onToggleStatus(status)}
            className={cn(
              "rounded-xl border px-4 py-2.5 text-left transition-colors duration-150",
              isActive
                ? "border-red-500/50 bg-red-500/10"
                : "border-border bg-surface-1 hover:border-border/80 hover:bg-surface-2"
            )}
          >
            <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
              <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[status])} />
              {STATUS_LABELS[status]}
            </p>
            <p className="text-xl font-semibold text-text-primary">{counts[status] ?? 0}</p>
          </button>
        );
      })}
    </div>
  );
}
