"use client";

import {
  Search,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Tag as TagIcon,
  ArrowDownUp,
  ChevronDown,
} from "lucide-react";
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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Left: Wide Search Input */}
      <div className="relative w-full lg:max-w-[460px] lg:flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888080]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search speakers..."
          className="h-10 rounded-xl border-[#332323] bg-[#120C0D] pl-10 text-sm placeholder:text-[#777070]"
        />
      </div>

      {/* Right: Tags, Sort, View Switcher, Add Speaker */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#332323] bg-[#140D0E] px-3.5 text-xs font-medium text-[#E5E0E0] transition-colors hover:border-[#4A2E30] hover:bg-[#1C1314]"
            >
              <TagIcon className="h-3.5 w-3.5 text-[#A6A0A0]" />
              <span>Tags</span>
              {selectedTagIds.size > 0 && (
                <span className="rounded-full bg-[#E31B2B] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {selectedTagIds.size}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-[#777070]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-h-64 w-56 overflow-y-auto p-2" align="end">
            {allTags.length === 0 ? (
              <p className="px-2 py-2 text-xs text-[#777070]">No tags yet.</p>
            ) : (
              <div className="space-y-0.5">
                {allTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] hover:bg-[#241819]"
                  >
                    <Checkbox
                      checked={selectedTagIds.has(tag.id)}
                      onCheckedChange={() => onToggleTag(tag.id)}
                    />
                    <span className="truncate">{tag.name}</span>
                  </label>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
          <SelectTrigger className="h-10 w-[166px] rounded-xl border-[#332323] bg-[#140D0E] text-xs font-medium text-[#E5E0E0]">
            <span className="flex items-center gap-2 truncate">
              <ArrowDownUp className="h-3.5 w-3.5 shrink-0 text-[#A6A0A0]" />
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

        {/* Segmented Table / Board Switch */}
        <div className="flex h-10 items-center rounded-xl border border-[#332323] bg-[#120C0D] p-1">
          <button
            type="button"
            onClick={() => onViewChange("table")}
            className={cn(
              "flex h-full items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-150",
              view === "table"
                ? "bg-[#E31B2B] text-white shadow-[0_0_14px_rgba(227,27,43,0.45)]"
                : "text-[#A6A0A0] hover:text-[#F5F5F5]"
            )}
          >
            <ListIcon className="h-3.5 w-3.5" /> Table
          </button>
          <button
            type="button"
            onClick={() => onViewChange("board")}
            className={cn(
              "flex h-full items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-150",
              view === "board"
                ? "bg-[#E31B2B] text-white shadow-[0_0_14px_rgba(227,27,43,0.45)]"
                : "text-[#A6A0A0] hover:text-[#F5F5F5]"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Board
          </button>
        </div>

        {/* Prominent Add Speaker Button */}
        <Button
          onClick={onAddSpeaker}
          className="h-10 gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-[0_0_22px_rgba(227,27,43,0.4)]"
        >
          <Plus className="h-4 w-4 stroke-[2.4]" /> Add speaker
        </Button>
      </div>
    </div>
  );
}
