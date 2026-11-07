import { ExternalLink, Globe, Link2 } from "lucide-react";
import {
  LinkedinIcon,
  FacebookIcon,
  InstagramIcon,
  XSocialIcon,
} from "@/components/icons/BrandIcons";
import type { SpeakerLink } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  website: Globe,
  other: Link2,
};

export function SpeakerLinksDisplay({ links }: { links: SpeakerLink[] }) {
  if (links.length === 0) {
    return <p className="text-xs text-[#777070]">No social or web links added yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = link.platform === "x" ? XSocialIcon : ICONS[link.platform] ?? Link2;
        const label =
          link.platform === "other"
            ? link.label || "Link"
            : link.platform === "x"
            ? "X / Twitter"
            : link.platform[0].toUpperCase() + link.platform.slice(1);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-xl border border-[#342324] bg-[#140D0E] px-3 py-1.5 text-xs font-medium text-[#F5F5F5] transition-all hover:border-[#E31B2B]/50 hover:bg-[#1E1314] hover:text-[#FF7583]"
          >
            <Icon className="h-3.5 w-3.5 text-[#E31B2B] transition-transform group-hover:scale-105" />
            <span>{label}</span>
            <ExternalLink className="h-3 w-3 text-[#777070] group-hover:text-[#FF7583]" />
          </a>
        );
      })}
    </div>
  );
}
