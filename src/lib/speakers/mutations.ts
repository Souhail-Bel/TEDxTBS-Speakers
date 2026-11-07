import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  LinkPlatform,
  RuleOrWarningItem,
  SpeakerStatus,
  SpeakerStatusOption,
  SpeakerTier,
  Tag,
} from "@/lib/types";
import { writeAuditLog } from "@/lib/audit/log";

type DB = SupabaseClient;

export interface SpeakerFormInput {
  name: string;
  photo_url: string | null;
  origin: string;
  age: number | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  idea_text: string | null;
  experience_text: string | null;
  custom_message?: string | null;
  status: SpeakerStatus;
  importance: SpeakerTier | null;
  links: { platform: LinkPlatform; url: string; label: string | null }[];
  tagNames: string[];
}

export async function createSpeaker(supabase: DB, actorId: string, input: SpeakerFormInput) {
  const { links, tagNames, ...speakerFields } = input;

  const { data: speaker, error } = await supabase
    .from("speakers")
    .insert({ ...speakerFields, added_by: actorId })
    .select()
    .single();
  if (error) throw error;

  // Ensure the creator is always set as the default tracker for the speaker.
  await supabase.from("speaker_trackers").upsert(
    { speaker_id: speaker.id, profile_id: actorId, source: "manual" },
    { onConflict: "speaker_id,profile_id", ignoreDuplicates: true }
  );

  if (links.length > 0) {
    const { error: linksError } = await supabase
      .from("speaker_links")
      .insert(links.map((l, i) => ({ ...l, speaker_id: speaker.id, position: i })));
    if (linksError) throw linksError;
  }

  if (tagNames.length > 0) {
    await attachTags(supabase, speaker.id, tagNames);
  }

  await writeAuditLog(supabase, {
    actorId,
    action: "speaker.created",
    entityType: "speaker",
    entityId: speaker.id,
    metadata: { name: speaker.name },
  });

  return speaker;
}

export async function updateSpeaker(
  supabase: DB,
  actorId: string,
  speakerId: string,
  input: SpeakerFormInput,
  previousStatus?: SpeakerStatus
) {
  const { links, tagNames, ...speakerFields } = input;

  const { error } = await supabase.from("speakers").update(speakerFields).eq("id", speakerId);
  if (error) throw error;

  // Replace links wholesale — simplest consistent approach for a small list per speaker.
  await supabase.from("speaker_links").delete().eq("speaker_id", speakerId);
  if (links.length > 0) {
    const { error: linksError } = await supabase
      .from("speaker_links")
      .insert(links.map((l, i) => ({ ...l, speaker_id: speakerId, position: i })));
    if (linksError) throw linksError;
  }

  // Replace tags wholesale too.
  await supabase.from("speaker_tags").delete().eq("speaker_id", speakerId);
  if (tagNames.length > 0) {
    await attachTags(supabase, speakerId, tagNames);
  }

  await writeAuditLog(supabase, {
    actorId,
    action: "speaker.updated",
    entityType: "speaker",
    entityId: speakerId,
    metadata: { name: speakerFields.name },
  });

  if (previousStatus && previousStatus !== speakerFields.status) {
    await writeAuditLog(supabase, {
      actorId,
      action: "speaker.status_changed",
      entityType: "speaker",
      entityId: speakerId,
      metadata: { from: previousStatus, to: speakerFields.status },
    });
  }
}

export async function updateSpeakerCustomMessage(
  supabase: DB,
  actorId: string,
  speakerId: string,
  customMessage: string | null
) {
  const { error } = await supabase
    .from("speakers")
    .update({ custom_message: customMessage })
    .eq("id", speakerId);
  if (error) throw error;

  await writeAuditLog(supabase, {
    actorId,
    action: "speaker.updated",
    entityType: "speaker",
    entityId: speakerId,
    metadata: { field: "custom_message" },
  });
}

export async function updateSpeakerStatus(
  supabase: DB,
  actorId: string,
  speakerId: string,
  from: SpeakerStatus,
  to: SpeakerStatus
) {
  const { error } = await supabase.from("speakers").update({ status: to }).eq("id", speakerId);
  if (error) throw error;

  await writeAuditLog(supabase, {
    actorId,
    action: "speaker.status_changed",
    entityType: "speaker",
    entityId: speakerId,
    metadata: { from, to },
  });
}

export async function createStatusOption(
  supabase: DB,
  label: string,
  color?: string | null
): Promise<SpeakerStatusOption> {
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Status name cannot be empty.");

  const baseSlug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const slug = baseSlug || `status_${Date.now()}`;

  const { data: existing } = await supabase
    .from("speaker_statuses")
    .select("*")
    .order("position", { ascending: false })
    .limit(1);

  const nextPos = existing && existing.length > 0 ? (existing[0].position ?? 0) + 1 : 4;

  const { data, error } = await supabase
    .from("speaker_statuses")
    .upsert(
      {
        slug,
        label: trimmed,
        color: color ?? null,
        position: nextPos,
        is_builtin: false,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as SpeakerStatusOption;
}

export async function deleteStatusOption(supabase: DB, slug: string) {
  // Move any speakers currently in this custom status back to 'no_reply'
  const { error: reassignError } = await supabase
    .from("speakers")
    .update({ status: "no_reply" })
    .eq("status", slug);
  if (reassignError) throw reassignError;

  const { error } = await supabase
    .from("speaker_statuses")
    .delete()
    .eq("slug", slug)
    .eq("is_builtin", false);
  if (error) throw error;
}

export async function updateRulesAndWarnings(supabase: DB, actorId: string, items: RuleOrWarningItem[]) {
  const { error } = await supabase
    .from("event_settings")
    .update({
      rules_and_warnings: items,
      updated_by: actorId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;
}

/** Finds existing tags by (case-insensitive) name, creates the rest, links them all to the speaker. */
async function attachTags(supabase: DB, speakerId: string, tagNames: string[]) {
  const uniqueNames = Array.from(new Set(tagNames.map((n) => n.trim()).filter(Boolean)));
  if (uniqueNames.length === 0) return;

  const { data: existing } = await supabase
    .from("tags")
    .select("*")
    .in(
      "name",
      uniqueNames // best-effort exact match first
    );

  const existingByLower = new Map((existing ?? []).map((t: Tag) => [t.name.toLowerCase(), t]));
  const toCreate = uniqueNames.filter((n) => !existingByLower.has(n.toLowerCase()));

  let created: Tag[] = [];
  if (toCreate.length > 0) {
    const { data, error } = await supabase
      .from("tags")
      .insert(toCreate.map((name) => ({ name })))
      .select();
    // Unique constraint races are fine to ignore — another client created it first.
    if (!error && data) created = data;
  }

  const allTags = [...(existing ?? []), ...created];
  const idsByLower = new Map(allTags.map((t: Tag) => [t.name.toLowerCase(), t.id]));

  // Re-resolve any names that lost the race against another client.
  const missing = uniqueNames.filter((n) => !idsByLower.has(n.toLowerCase()));
  if (missing.length > 0) {
    const { data: refetched } = await supabase.from("tags").select("*").in("name", missing);
    for (const t of refetched ?? []) idsByLower.set(t.name.toLowerCase(), t.id);
  }

  const tagIds = uniqueNames.map((n) => idsByLower.get(n.toLowerCase())).filter(Boolean) as string[];
  if (tagIds.length === 0) return;

  await supabase
    .from("speaker_tags")
    .upsert(tagIds.map((tag_id) => ({ speaker_id: speakerId, tag_id })), {
      onConflict: "speaker_id,tag_id",
      ignoreDuplicates: true,
    });
}

export async function requestDeleteSpeaker(supabase: DB, actorId: string, speakerId: string) {
  const { error } = await supabase
    .from("speakers")
    .update({ deleted_at: new Date().toISOString(), deleted_by: actorId })
    .eq("id", speakerId);
  if (error) throw error;

  await writeAuditLog(supabase, {
    actorId,
    action: "speaker.delete_requested",
    entityType: "speaker",
    entityId: speakerId,
  });
}

export async function restoreSpeaker(supabase: DB, actorId: string, speakerId: string) {
  const { error } = await supabase
    .from("speakers")
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", speakerId);
  if (error) throw error;

  await writeAuditLog(supabase, {
    actorId,
    action: "speaker.restored",
    entityType: "speaker",
    entityId: speakerId,
  });
}

export async function toggleTracker(
  supabase: DB,
  speakerId: string,
  profileId: string,
  isCurrentlyTracking: boolean
) {
  if (isCurrentlyTracking) {
    await supabase
      .from("speaker_trackers")
      .delete()
      .eq("speaker_id", speakerId)
      .eq("profile_id", profileId);
  } else {
    await supabase
      .from("speaker_trackers")
      .upsert(
        { speaker_id: speakerId, profile_id: profileId, source: "manual" },
        { onConflict: "speaker_id,profile_id", ignoreDuplicates: true }
      );
  }
}

export async function addComment(supabase: DB, speakerId: string, authorId: string, body: string) {
  const { error } = await supabase
    .from("comments")
    .insert({ speaker_id: speakerId, author_id: authorId, body });
  if (error) throw error;
}

export async function deleteComment(supabase: DB, commentId: string) {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}
