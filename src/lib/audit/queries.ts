import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditLogEntry, Profile } from "@/lib/types";

export interface AuditLogEntryWithActor extends AuditLogEntry {
  actor: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
}

export async function fetchAuditLog(
  supabase: SupabaseClient,
  limit = 200
): Promise<AuditLogEntryWithActor[]> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*, actor:profiles(id, full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AuditLogEntryWithActor[];
}
