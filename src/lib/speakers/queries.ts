import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_STATUSES,
  type Speaker,
  type SpeakerLink,
  type SpeakerStatusOption,
  type SpeakerTracker,
  type SpeakerWithRelations,
  type Tag,
  type Profile,
  type RuleOrWarningItem,
} from "@/lib/types";

export const SPEAKER_SELECT = `
  *,
  speaker_links(*),
  speaker_tags(tags(*)),
  speaker_trackers(profile_id, source, added_at, profile:profiles(id, full_name, avatar_url)),
  added_by_profile:profiles!speakers_added_by_fkey(id, full_name, avatar_url),
  deleted_by_profile:profiles!speakers_deleted_by_fkey(id, full_name, avatar_url),
  comments(count)
`;

/** Shape of one row returned by a `.select(SPEAKER_SELECT)` query. */
interface RawSpeakerRow extends Speaker {
  speaker_links?: SpeakerLink[] | null;
  speaker_tags?: { tags: Tag | null }[] | null;
  speaker_trackers?: (SpeakerTracker & { profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null })[] | null;
  added_by_profile?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  deleted_by_profile?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
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

export async function fetchAllStatuses(supabase: SupabaseClient): Promise<SpeakerStatusOption[]> {
  const { data, error } = await supabase
    .from("speaker_statuses")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_STATUSES;
  }
  return data as SpeakerStatusOption[];
}

export const DEFAULT_RULES_AND_WARNINGS: RuleOrWarningItem[] = [
  {
    id: "w1",
    type: "warning",
    text: "Never contact a speaker who is already being tracked by another team member without coordinating with them first.",
  },
  {
    id: "w2",
    type: "warning",
    text: "Do not send official confirmations or promise speaking slots without approval from the Speaker Coordinator.",
  },
  {
    id: "r1",
    type: "rule",
    text: "Always check the speaker list before adding a new speaker to avoid duplicates.",
  },
  {
    id: "r2",
    type: "rule",
    text: "Log every outreach attempt (email, LinkedIn, Instagram, phone call) in the speaker's Progress & comments section.",
  },
  {
    id: "r3",
    type: "rule",
    text: "Keep the speaker's status and custom outreach message up to date as conversations progress.",
  },
];

export async function fetchRulesAndWarnings(supabase: SupabaseClient): Promise<RuleOrWarningItem[]> {
  const { data, error } = await supabase
    .from("event_settings")
    .select("rules_and_warnings")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data || !Array.isArray(data.rules_and_warnings)) {
    return DEFAULT_RULES_AND_WARNINGS;
  }
  return data.rules_and_warnings as RuleOrWarningItem[];
}
