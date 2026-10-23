import { requireAdmin } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { fetchAllProfiles } from "@/lib/speakers/queries";
import { fetchLatestCommentByAuthor } from "@/lib/team/queries";
import { TeamListClient } from "@/components/team/TeamListClient";

export default async function TeamPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [members, latestComments] = await Promise.all([
    fetchAllProfiles(supabase),
    fetchLatestCommentByAuthor(supabase),
  ]);

  return <TeamListClient members={members} latestComments={latestComments} />;
}
