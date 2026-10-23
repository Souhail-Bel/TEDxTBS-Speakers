"use client";

import { useMemo, useState } from "react";
import { X, Tag as TagIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { Tag } from "@/lib/types";

interface TagInputProps {
  value: string[]; // tag names currently applied
  onChange: (names: string[]) => void;
  allTags: Tag[]; // every known tag, for autocomplete suggestions
}

export function TagInput({ value, onChange, allTags }: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const applied = new Set(value.map((v) => v.toLowerCase()));
    const base = allTags.map((t) => t.name).filter((n) => !applied.has(n.toLowerCase()));
    const filtered = q ? base.filter((n) => n.toLowerCase().includes(q)) : base;
    return filtered.slice(0, 8);
  }, [query, allTags, value]);

  const canCreate =
    query.trim().length > 0 &&
    !allTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === query.trim().toLowerCase());

  function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setQuery("");
  }

  function removeTag(name: string) {
    onChange(value.filter((v) => v !== name));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-3 px-2.5 py-1 text-xs text-text-primary"
          >
            <TagIcon className="h-3 w-3 text-text-tertiary" />
            {name}
            <button
              type="button"
              onClick={() => removeTag(name)}
              className="ml-0.5 text-text-tertiary hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            placeholder="Type to find or create a tag…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                addTag(query);
                setOpen(false);
              } else if (e.key === "Enter" && suggestions[0]) {
                e.preventDefault();
                addTag(suggestions[0]);
                setOpen(false);
              }
            }}
          />
        </PopoverTrigger>
        {open && (suggestions.length > 0 || canCreate) && (
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-1"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  addTag(name);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-primary hover:bg-surface-3"
                )}
              >
                <TagIcon className="h-3.5 w-3.5 text-text-tertiary" />
                {name}
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  addTag(query);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-400 hover:bg-surface-3"
              >
                <TagIcon className="h-3.5 w-3.5" />
                Create &quot;{query.trim()}&quot;
              </button>
            )}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
