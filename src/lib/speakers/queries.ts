import type { SupabaseClient } from "@supabase/supabase-js";
import type { Speaker, SpeakerLink, SpeakerTracker, SpeakerWithRelations, Tag, Profile } from "@/lib/types";

export const SPEAKER_SELECT = `
  *,
  speaker_links(*),
  speaker_tags(tags(*)),
  speaker_trackers(profile_id, source, added_at, profile:profiles(id, full_name)),
  added_by_profile:profiles!speakers_added_by_fkey(id, full_name),
  deleted_by_profile:profiles!speakers_deleted_by_fkey(id, full_name),
  comments(count)
`;

/** Shape of one row returned by a `.select(SPEAKER_SELECT)` query. */
interface RawSpeakerRow extends Speaker {
  speaker_links?: SpeakerLink[] | null;
  speaker_tags?: { tags: Tag | null }[] | null;
  speaker_trackers?: (SpeakerTracker & { profile: Pick<Profile, "id" | "full_name"> | null })[] | null;
  added_by_profile?: Pick<Profile, "id" | "full_name"> | null;
  deleted_by_profile?: Pick<Profile, "id" | "full_name"> | null;
  comments?: { count: number }[] | null;
}

export function transformSpeakerRow(row: RawSpeakerRow): SpeakerWithRelations {
  return {
    ...row,
    tags: (row.speaker_tags ?? []).map((st) => st.tags).filter((t): t is Tag => Boolean(t)),
    trackers: row.speaker_trackers ?? [],
    speaker_links: row.speaker_links ?? [],
    added_by_profile: row.added_by_profile ?? null,
    deleted_by_profile: row.deleted_by_profile ?? null,
    comment_count: row.comments?.[0]?.count ?? 0,
  };
}

/** Active (non-deleted) speakers, newest first by default. */
export async function fetchSpeakers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("speakers")
    .select(SPEAKER_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformSpeakerRow);
}

/** Pending-deletion speakers — admin only (RLS also enforces this). */
export async function fetchDeletedSpeakers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("speakers")
    .select(SPEAKER_SELECT)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformSpeakerRow);
}

export async function fetchSpeakerById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("speakers")
    .select(SPEAKER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? transformSpeakerRow(data) : null;
}

export async function fetchAllTags(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data ?? [];
}
