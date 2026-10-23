import { createClient } from "@/lib/supabase/server";
import { fetchAllTags, fetchSpeakers } from "@/lib/speakers/queries";
import { SpeakerListClient } from "@/components/speakers/SpeakerListClient";

export default async function SpeakersPage() {
  const supabase = await createClient();
  const [speakers, tags] = await Promise.all([fetchSpeakers(supabase), fetchAllTags(supabase)]);

  return <SpeakerListClient initialSpeakers={speakers} initialTags={tags} />;
}
