import { requireAdmin } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { fetchAuditLog } from "@/lib/audit/queries";
import { AuditLogClient } from "@/components/audit/AuditLogClient";

export default async function AuditLogPage() {
  await requireAdmin();
  const supabase = await createClient();
  const entries = await fetchAuditLog(supabase);

  return <AuditLogClient entries={entries} />;
}
