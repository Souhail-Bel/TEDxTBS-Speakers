import { Globe, Link2 } from "lucide-react";
import { LinkedinIcon, FacebookIcon, InstagramIcon, XSocialIcon } from "@/components/icons/BrandIcons";
import type { SpeakerLink } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  website: Globe,
  other: Link2,
};

export function SpeakerLinksDisplay({ links }: { links: SpeakerLink[] }) {
  if (links.length === 0) return <p className="text-sm text-text-tertiary">No links added yet.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = link.platform === "x" ? XSocialIcon : ICONS[link.platform] ?? Link2;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-text-primary transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            <Icon className="h-3.5 w-3.5" />
            {link.platform === "other" ? link.label || "Link" : link.platform[0].toUpperCase() + link.platform.slice(1)}
          </a>
        );
      })}
    </div>
  );
}
