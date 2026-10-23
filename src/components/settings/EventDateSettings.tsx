"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/components/auth/ProfileProvider";

export function EventDateSettings({ initialDate }: { initialDate: string | null }) {
  const profile = useProfile();
  const [date, setDate] = useState(initialDate ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("event_settings")
        .update({ event_date: date || null, updated_by: profile.id })
        .eq("id", 1);
      if (error) throw error;
      toast.success(date ? "Event date updated" : "Event date cleared");
    } catch {
      toast.error("Couldn't save the event date. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-red-400" />
        <h2 className="text-sm font-semibold text-text-primary">Event date</h2>
      </div>
      <p className="mb-4 text-sm text-text-tertiary">
        Shown as a banner across the platform once set. Leave blank while it&apos;s still unconfirmed.
      </p>
      <form onSubmit={handleSave} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="event-date">Date</Label>
          <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button type="submit" loading={saving}>
          Save
        </Button>
      </form>
    </Card>
  );
}
