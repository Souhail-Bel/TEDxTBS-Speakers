import type { SupabaseClient } from "@supabase/supabase-js";

export interface LatestCommentByAuthor {
  body: string;
  created_at: string;
  speaker_id: string;
  speaker_name: string;
}

export interface TeamMemberStats {
  trackingCount: number;
  addedCount: number;
  commentedSpeakersCount: number;
  computedContactedCount: number;
}

/**
 * One latest comment per author, across all active speakers. Used on the
 * Team page so everyone can see each member's most recent activity without
 * digging through every speaker's thread.
 */
export async function fetchLatestCommentByAuthor(
  supabase: SupabaseClient
): Promise<Record<string, LatestCommentByAuthor>> {
  const { data, error } = await supabase
    .from("comments")
    .select("author_id, body, created_at, speaker:speakers(id, name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  const result: Record<string, LatestCommentByAuthor> = {};
  for (const row of data ?? []) {
    const authorId = row.author_id as string | null;
    if (!authorId || result[authorId]) continue;
    const speaker = row.speaker as unknown as { id: string; name: string } | null;
    result[authorId] = {
      body: row.body,
      created_at: row.created_at,
      speaker_id: speaker?.id ?? "",
      speaker_name: speaker?.name ?? "Unknown speaker",
    };
  }
  return result;
}

/**
 * Computes per-member speaker stats (how many speakers they are tracking,
 * how many they added, and distinct speakers they've interacted with).
 */
export async function fetchTeamSpeakerStats(
  supabase: SupabaseClient
): Promise<Record<string, TeamMemberStats>> {
  const [{ data: trackers }, { data: speakers }, { data: comments }] = await Promise.all([
    supabase.from("speaker_trackers").select("profile_id, speaker_id"),
    supabase.from("speakers").select("id, added_by").is("deleted_at", null),
    supabase.from("comments").select("author_id, speaker_id"),
  ]);

  const activeSpeakerIds = new Set((speakers ?? []).map((s) => s.id as string));
  const trackingByMember = new Map<string, Set<string>>();
  const addedByMember = new Map<string, Set<string>>();
  const commentedByMember = new Map<string, Set<string>>();

  for (const s of speakers ?? []) {
    const addedBy = s.added_by as string | null;
    if (!addedBy) continue;
    if (!addedByMember.has(addedBy)) addedByMember.set(addedBy, new Set());
    addedByMember.get(addedBy)!.add(s.id as string);
  }

  for (const t of trackers ?? []) {
    const pid = t.profile_id as string | null;
    const sid = t.speaker_id as string | null;
    if (!pid || !sid || !activeSpeakerIds.has(sid)) continue;
    if (!trackingByMember.has(pid)) trackingByMember.set(pid, new Set());
    trackingByMember.get(pid)!.add(sid);
  }

  for (const c of comments ?? []) {
    const aid = c.author_id as string | null;
    const sid = c.speaker_id as string | null;
    if (!aid || !sid || !activeSpeakerIds.has(sid)) continue;
    if (!commentedByMember.has(aid)) commentedByMember.set(aid, new Set());
    commentedByMember.get(aid)!.add(sid);
  }

  const allProfileIds = new Set<string>([
    ...trackingByMember.keys(),
    ...addedByMember.keys(),
    ...commentedByMember.keys(),
  ]);

  const stats: Record<string, TeamMemberStats> = {};
  for (const pid of allProfileIds) {
    const tSet = trackingByMember.get(pid) ?? new Set<string>();
    const aSet = addedByMember.get(pid) ?? new Set<string>();
    const cSet = commentedByMember.get(pid) ?? new Set<string>();
    const union = new Set<string>([...tSet, ...cSet]);
    stats[pid] = {
      trackingCount: tSet.size,
      addedCount: aSet.size,
      commentedSpeakersCount: cSet.size,
      computedContactedCount: union.size,
    };
  }

  return stats;
}
