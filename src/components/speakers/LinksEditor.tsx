"use client";

import { Globe, Link2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkedinIcon, FacebookIcon, InstagramIcon, XSocialIcon } from "@/components/icons/BrandIcons";
import { PLATFORM_LABELS, type LinkPlatform } from "@/lib/types";

export interface LinkDraft {
  platform: LinkPlatform;
  url: string;
  label: string | null;
}

const PLATFORM_ICONS: Record<LinkPlatform, React.ComponentType<{ className?: string }>> = {
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
  x: XSocialIcon,
  instagram: InstagramIcon,
  website: Globe,
  other: Link2,
};

const PLATFORMS: LinkPlatform[] = ["linkedin", "facebook", "x", "instagram", "website", "other"];

export function LinksEditor({
  value,
  onChange,
}: {
  value: LinkDraft[];
  onChange: (links: LinkDraft[]) => void;
}) {
  function update(index: number, patch: Partial<LinkDraft>) {
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...value, { platform: "linkedin", url: "", label: null }]);
  }

  return (
    <div className="space-y-2">
      {value.map((link, i) => {
        const Icon = PLATFORM_ICONS[link.platform];
        return (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={link.platform}
              onValueChange={(v) => update(i, { platform: v as LinkPlatform })}
            >
              <SelectTrigger className="w-36 shrink-0">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-text-tertiary" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {link.platform === "other" && (
              <Input
                placeholder="Label"
                value={link.label ?? ""}
                onChange={(e) => update(i, { label: e.target.value })}
                className="w-28 shrink-0"
              />
            )}

            <Input
              placeholder="https://…"
              value={link.url}
              onChange={(e) => update(i, { url: e.target.value })}
              className="flex-1"
            />

            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 rounded-lg p-2 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}

      <Button type="button" variant="ghost" size="sm" onClick={add} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" /> Add a link
      </Button>
    </div>
  );
}

export { PLATFORM_ICONS };
