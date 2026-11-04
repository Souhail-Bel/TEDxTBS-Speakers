"use client";

import { Search, Plus, LayoutGrid, List as ListIcon, Tag as TagIcon, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import type { Tag } from "@/lib/types";

export type SortKey = "created_desc" | "created_asc" | "name_asc" | "name_desc" | "importance_desc";
export type ViewMode = "table" | "board";

interface SpeakerFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  allTags: Tag[];
  selectedTagIds: Set<string>;
  onToggleTag: (id: string) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onAddSpeaker: () => void;
}

export function SpeakerFilters({
  search,
  onSearchChange,
  allTags,
  selectedTagIds,
  onToggleTag,
  sort,
  onSortChange,
  view,
  onViewChange,
  onAddSpeaker,
}: SpeakerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search speakers…"
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="md" className="gap-1.5">
              <TagIcon className="h-4 w-4" />
              Tags
              {selectedTagIds.size > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {selectedTagIds.size}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 max-h-64 overflow-y-auto">
            {allTags.length === 0 ? (
              <p className="px-1 py-2 text-sm text-text-tertiary">No tags yet.</p>
            ) : (
              <div className="space-y-0.5">
                {allTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-3"
                  >
                    <Checkbox
                      checked={selectedTagIds.has(tag.id)}
                      onCheckedChange={() => onToggleTag(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
          <SelectTrigger className="w-44">
            <span className="flex items-center gap-1.5">
              <ArrowDownUp className="h-3.5 w-3.5 text-text-tertiary" />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Newest first</SelectItem>
            <SelectItem value="created_asc">Oldest first</SelectItem>
            <SelectItem value="name_asc">Name (A–Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z–A)</SelectItem>
            <SelectItem value="importance_desc">Importance (S first)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border bg-surface-1 p-0.5">
          <button
            onClick={() => onViewChange("table")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "table" ? "bg-surface-3 text-text-primary" : "text-text-tertiary hover:text-text-primary"
            )}
          >
            <ListIcon className="h-3.5 w-3.5" /> Table
          </button>
          <button
            onClick={() => onViewChange("board")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "board" ? "bg-surface-3 text-text-primary" : "text-text-tertiary hover:text-text-primary"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Board
          </button>
        </div>

        <Button onClick={onAddSpeaker} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add speaker
        </Button>
      </div>
    </div>
  );
}
