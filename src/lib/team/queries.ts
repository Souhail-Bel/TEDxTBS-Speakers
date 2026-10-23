import type { SupabaseClient } from "@supabase/supabase-js";

export interface LatestCommentByAuthor {
  body: string;
  created_at: string;
  speaker_id: string;
  speaker_name: string;
}

/**
 * One latest comment per author, across all active speakers. Used on the
 * Team page so an admin can see each member's most recent activity without
 * digging through every speaker's thread.
 */
export async function fetchLatestCommentByAuthor(
  supabase: SupabaseClient
): Promise<Record<string, LatestCommentByAuthor>> {
  const { data, error } = await supabase
    .from("comments")
    .select("author_id, body, created_at, speaker:speakers(id, name)")
    .order("created_at", { ascending: false })
    .limit(500); // recent activity window — plenty to cover "latest per member" for a small team

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
