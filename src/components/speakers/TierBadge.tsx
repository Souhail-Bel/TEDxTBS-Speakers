import { TIER_LABELS, type SpeakerTier } from "@/lib/types";

const TIER_COLOR: Record<SpeakerTier, { bg: string; border: string; text: string }> = {
  s: { bg: "rgba(245, 158, 11, 0.16)", border: "rgba(245, 158, 11, 0.42)", text: "#FCD34D" },
  a: { bg: "rgba(34, 197, 94, 0.16)", border: "rgba(34, 197, 94, 0.38)", text: "#6EE7B7" },
  b: { bg: "rgba(59, 130, 246, 0.18)", border: "rgba(59, 130, 246, 0.42)", text: "#93C5FD" },
  c: { bg: "rgba(161, 161, 170, 0.15)", border: "rgba(161, 161, 170, 0.34)", text: "#D4D4D8" },
  f: { bg: "rgba(227, 27, 43, 0.16)", border: "rgba(227, 27, 43, 0.38)", text: "#FDA4AF" },
};

export function TierBadge({ tier }: { tier: SpeakerTier | null }) {
  if (!tier) {
    return <span className="text-xs text-[#6E6666]">—</span>;
  }
  const color = TIER_COLOR[tier];
  return (
    <span
      style={{ backgroundColor: color.bg, borderColor: color.border, color: color.text }}
      className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 text-[11px] font-bold leading-none"
      title={TIER_LABELS[tier]}
    >
      {tier.toUpperCase()}
    </span>
  );
}
