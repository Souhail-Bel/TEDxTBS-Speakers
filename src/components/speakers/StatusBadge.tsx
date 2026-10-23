import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type SpeakerStatus } from "@/lib/types";

const VARIANT: Record<SpeakerStatus, "accepted" | "noReply" | "refused" | "unclear"> = {
  accepted: "accepted",
  no_reply: "noReply",
  refused: "refused",
  unclear: "unclear",
};

export function StatusBadge({ status }: { status: SpeakerStatus }) {
  return (
    <Badge variant={VARIANT[status]} dot>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
