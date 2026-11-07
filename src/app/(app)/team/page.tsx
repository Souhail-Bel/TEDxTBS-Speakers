import { requireProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { fetchAllProfiles } from "@/lib/speakers/queries";
import { fetchLatestCommentByAuthor, fetchTeamSpeakerStats } from "@/lib/team/queries";
import { TeamListClient } from "@/components/team/TeamListClient";

export default async function TeamPage() {
  await requireProfile();
  const supabase = await createClient();

  const [members, latestComments, speakerStats] = await Promise.all([
    fetchAllProfiles(supabase),
    fetchLatestCommentByAuthor(supabase),
    fetchTeamSpeakerStats(supabase),
  ]);

  return (
    <TeamListClient
      members={members}
      latestComments={latestComments}
      speakerStats={speakerStats}
    />
  );
}
