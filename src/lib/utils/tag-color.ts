/**
 * Deterministic color per tag name: the same tag always gets the same
 * color, and different names are spread evenly around the hue wheel so
 * tags stay visually distinct from each other even as the list grows.
 * Tuned for the dark theme — saturated-but-dark background, bright text.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }
  return Math.abs(hash);
}

export function tagColor(name: string) {
  const hue = hashString(name.trim().toLowerCase()) % 360;
  return {
    background: `hsl(${hue} 70% 16%)`,
    border: `hsl(${hue} 55% 30%)`,
    text: `hsl(${hue} 85% 75%)`,
  };
}