import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "speaker.created"
  | "speaker.updated"
  | "speaker.status_changed"
  | "speaker.tag_added"
  | "speaker.tag_removed"
  | "speaker.delete_requested"
  | "speaker.delete_confirmed"
  | "speaker.restored"
  | "team_member.invited"
  | "team_member.updated"
  | "team_member.removed"
  | "team_member.role_changed";

interface WriteAuditLogParams {
  actorId: string;
  action: AuditAction;
  entityType: "speaker" | "profile";
  entityId: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Appends one row to audit_log. Call this from every mutating action that
 * touches a speaker or a team member — see lib/audit/log.ts call sites.
 * Takes any Supabase client (browser or server) so it can run under the
 * caller's own RLS context; the insert policy enforces actor_id = auth.uid().
 */
export async function writeAuditLog(
  supabase: SupabaseClient,
  { actorId, action, entityType, entityId, metadata = {} }: WriteAuditLogParams
) {
  const { error } = await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });

  if (error) {
    // Never let a logging failure block the user's actual action.
    console.error("Failed to write audit log entry:", error.message);
  }
}
