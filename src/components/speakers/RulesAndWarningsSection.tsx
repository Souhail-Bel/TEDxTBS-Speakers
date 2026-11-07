"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { updateRulesAndWarnings } from "@/lib/speakers/mutations";
import { useProfile } from "@/components/auth/ProfileProvider";
import type { RuleOrWarningItem } from "@/lib/types";

export function RulesAndWarningsSection({
  items: initialItems,
  onSaved,
}: {
  items: RuleOrWarningItem[];
  onSaved?: () => void;
}) {
  const profile = useProfile();
  const [draftItems, setDraftItems] = useState<RuleOrWarningItem[]>(initialItems);
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newType, setNewType] = useState<"warning" | "rule">("rule");
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);

  const items = editing ? draftItems : initialItems;
  const warnings = items.filter((i) => i.type === "warning");
  const rules = items.filter((i) => i.type === "rule");

  async function persistItems(nextItems: RuleOrWarningItem[]) {
    setSaving(true);
    try {
      const supabase = createClient();
      await updateRulesAndWarnings(supabase, profile.id, nextItems);
      setDraftItems(nextItems);
      onSaved?.();
      toast.success("Rules & warnings saved");
    } catch {
      toast.error("Couldn't save rules & warnings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed || saving) return;

    const next: RuleOrWarningItem[] = [
      ...items,
      { id: `${newType}_${Date.now()}`, type: newType, text: trimmed },
    ];
    setNewText("");
    await persistItems(next);
  }

  async function handleDeleteItem(id: string) {
    const next = items.filter((i) => i.id !== id);
    await persistItems(next);
  }

  function handleUpdateLocalText(id: string, text: string) {
    setDraftItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  }

  return (
    <div className="tedx-surface rounded-2xl p-4 sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E31B2B]/30 bg-[#E31B2B]/14 text-[#FF3B4E]">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs font-semibold tracking-wide uppercase text-[#F5F5F5]">
                General Rules &amp; Warnings
              </h2>
              <span className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/12 px-2 py-0.5 text-[10px] font-semibold text-[#FCD34D]">
                {warnings.length} {warnings.length === 1 ? "warning" : "warnings"}
              </span>
              <span className="rounded-full border border-[#382626] bg-[#211617] px-2 py-0.5 text-[10px] font-medium text-[#A6A0A0]">
                {rules.length} {rules.length === 1 ? "rule" : "rules"}
              </span>
            </div>
            <p className="text-[11.5px] text-[#777070]">
              Team coordination guidelines — review before contacting or updating speakers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (editing) {
                persistItems(draftItems).then(() => setEditing(false));
              } else {
                setDraftItems(initialItems);
                setCollapsed(false);
                setEditing(true);
              }
            }}
            loading={saving}
            className="h-7 gap-1.5 px-2.5 text-xs"
          >
            {editing ? (
              <>
                <Check className="h-3.5 w-3.5" /> Done
              </>
            ) : (
              <>
                <Pencil className="h-3 w-3" /> Customize
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-lg p-1.5 text-[#777070] transition-colors hover:bg-[#221717] hover:text-[#F5F5F5]"
            aria-label={collapsed ? "Expand rules and warnings" : "Collapse rules and warnings"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-3.5 space-y-3.5 border-t border-[#261919] pt-3.5">
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            {/* Warnings column */}
            <div className="space-y-2 rounded-xl border border-[#F59E0B]/22 bg-[#F59E0B]/[0.04] p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#F59E0B]">
                <AlertTriangle className="h-3.5 w-3.5" /> Warnings
              </p>
              {warnings.length === 0 ? (
                <p className="text-xs text-[#777070]">No warnings added.</p>
              ) : (
                <ul className="space-y-1.5">
                  {warnings.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-xs text-[#E8E2E2]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                      {editing ? (
                        <div className="flex flex-1 items-center gap-1.5">
                          <Input
                            value={item.text}
                            onChange={(e) => handleUpdateLocalText(item.id, e.target.value)}
                            className="h-7 flex-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="rounded p-1 text-[#777070] hover:bg-[#2A1D1D] hover:text-[#EF4444]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="leading-relaxed">{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* General Rules column */}
            <div className="space-y-2 rounded-xl border border-[#2D1E1F] bg-[#120C0D]/75 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#FF5C6C]">
                <BookOpenCheck className="h-3.5 w-3.5" /> General Rules
              </p>
              {rules.length === 0 ? (
                <p className="text-xs text-[#777070]">No rules added.</p>
              ) : (
                <ul className="space-y-1.5">
                  {rules.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-xs text-[#D8D0D0]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E31B2B]" />
                      {editing ? (
                        <div className="flex flex-1 items-center gap-1.5">
                          <Input
                            value={item.text}
                            onChange={(e) => handleUpdateLocalText(item.id, e.target.value)}
                            className="h-7 flex-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="rounded p-1 text-[#777070] hover:bg-[#2A1D1D] hover:text-[#EF4444]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="leading-relaxed">{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {editing && (
            <form onSubmit={handleAddItem} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as "warning" | "rule")}
              >
                <SelectTrigger className="h-9 w-full sm:w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rule">General Rule</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Write a new rule or warning for the team…"
                className="h-9 flex-1 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                loading={saving}
                disabled={!newText.trim()}
                className="h-9 gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add item
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
