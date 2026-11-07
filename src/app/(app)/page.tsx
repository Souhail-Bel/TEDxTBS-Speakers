import { createClient } from "@/lib/supabase/server";
import {
  fetchAllStatuses,
  fetchAllTags,
  fetchRulesAndWarnings,
  fetchSpeakers,
} from "@/lib/speakers/queries";
import { SpeakerListClient } from "@/components/speakers/SpeakerListClient";

export default async function SpeakersPage() {
  const supabase = await createClient();
  const [speakers, tags, statuses, rulesAndWarnings] = await Promise.all([
    fetchSpeakers(supabase),
    fetchAllTags(supabase),
    fetchAllStatuses(supabase),
    fetchRulesAndWarnings(supabase),
  ]);

  return (
    <SpeakerListClient
      initialSpeakers={speakers}
      initialTags={tags}
      initialStatuses={statuses}
      initialRulesAndWarnings={rulesAndWarnings}
    />
  );
}
