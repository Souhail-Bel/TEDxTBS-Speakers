import { TIER_LABELS, type SpeakerTier } from "@/lib/types";

const TIER_COLOR: Record<SpeakerTier, { bg: string; border: string; text: string }> = {
  s: { bg: "hsl(45 90% 14%)", border: "hsl(45 70% 34%)", text: "hsl(45 90% 72%)" },
  a: { bg: "hsl(140 45% 13%)", border: "hsl(140 45% 30%)", text: "hsl(140 55% 70%)" },
  b: { bg: "hsl(210 55% 15%)", border: "hsl(210 50% 34%)", text: "hsl(210 70% 75%)" },
  c: { bg: "hsl(0 0% 16%)", border: "hsl(0 0% 32%)", text: "hsl(0 0% 72%)" },
  f: { bg: "hsl(350 60% 13%)", border: "hsl(350 50% 30%)", text: "hsl(350 70% 72%)" },
};

export function TierBadge({ tier }: { tier: SpeakerTier | null }) {
  if (!tier) {
    return <span className="text-xs text-text-tertiary">—</span>;
  }
  const color = TIER_COLOR[tier];
  return (
    <span
      style={{ backgroundColor: color.bg, borderColor: color.border, color: color.text }}
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
      title={TIER_LABELS[tier]}
    >
      {tier.toUpperCase()}
    </span>
  );
}