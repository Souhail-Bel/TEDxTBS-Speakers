import { requireAdmin } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { fetchDeletedSpeakers } from "@/lib/speakers/queries";
import { TrashListClient } from "@/components/speakers/TrashListClient";

export default async function TrashPage() {
  await requireAdmin();
  const supabase = await createClient();
  const speakers = await fetchDeletedSpeakers(supabase);

  return <TrashListClient speakers={speakers} />;
}
