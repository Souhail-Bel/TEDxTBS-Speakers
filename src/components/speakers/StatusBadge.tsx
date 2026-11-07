import { Badge } from "@/components/ui/badge";
import { tagColor } from "@/lib/utils/tag-color";
import { getStatusLabel, type SpeakerStatus, type SpeakerStatusOption } from "@/lib/types";

const BUILTIN_VARIANT: Record<string, "accepted" | "noReply" | "refused" | "unclear"> = {
  accepted: "accepted",
  no_reply: "noReply",
  refused: "refused",
  unclear: "unclear",
};

export function StatusBadge({
  status,
  statuses,
}: {
  status: SpeakerStatus;
  statuses?: SpeakerStatusOption[];
}) {
  const label = getStatusLabel(status, statuses);
  const builtinVariant = BUILTIN_VARIANT[status];

  if (builtinVariant) {
    return (
      <Badge variant={builtinVariant} dot>
        {label}
      </Badge>
    );
  }

  const color = tagColor(status);
  return (
    <span
      style={{
        backgroundColor: color.background,
        borderColor: color.border,
        color: color.text,
      }}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium leading-none whitespace-nowrap"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {label}
    </span>
  );
}
