import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAllProfiles, fetchAllTags, fetchSpeakerById } from "@/lib/speakers/queries";
import { SpeakerDetailClient } from "@/components/speakers/SpeakerDetailClient";
import type { CommentWithAuthor } from "@/lib/types";

export default async function SpeakerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [speaker, allTags, allProfiles, { data: comments }] = await Promise.all([
    fetchSpeakerById(supabase, id),
    fetchAllTags(supabase),
    fetchAllProfiles(supabase),
    supabase
      .from("comments")
      .select("*, author:profiles(id, full_name, role)")
      .eq("speaker_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!speaker) notFound();

  return (
    <SpeakerDetailClient
      speaker={speaker}
      comments={(comments as CommentWithAuthor[]) ?? []}
      allTags={allTags}
      allProfiles={allProfiles}
    />
  );
}
