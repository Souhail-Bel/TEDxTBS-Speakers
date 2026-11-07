// Hand-written mirror of the Supabase schema (supabase/migrations/).

export type UserRole = "admin" | "member";
export type BuiltinSpeakerStatus = "no_reply" | "accepted" | "refused" | "unclear";
export type SpeakerStatus = BuiltinSpeakerStatus | (string & {});
export type LinkPlatform = "linkedin" | "facebook" | "x" | "instagram" | "website" | "other";
export type SpeakerTier = "s" | "a" | "b" | "c" | "f";

export interface SpeakerStatusOption {
  slug: string;
  label: string;
  color: string | null;
  position: number;
  is_builtin: boolean;
  created_at?: string;
}

export interface RuleOrWarningItem {
  id: string;
  type: "rule" | "warning";
  text: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  facebook_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  contacted_count: number | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Speaker {
  id: string;
  name: string;
  photo_url: string | null;
  origin: string;
  age: number | null;
  email: string | null;
  phone: string | null;
  idea_text: string | null;
  experience_text: string | null;
  custom_message: string | null;
  status: SpeakerStatus;
  importance: SpeakerTier | null;
  bio: string | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface SpeakerLink {
  id: string;
  speaker_id: string;
  platform: LinkPlatform;
  url: string;
  label: string | null;
  position: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface SpeakerTag {
  speaker_id: string;
  tag_id: string;
  created_at: string;
}

export interface SpeakerTracker {
  speaker_id: string;
  profile_id: string;
  source: "manual" | "comment";
  added_at: string;
}

export interface Comment {
  id: string;
  speaker_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EventSettings {
  id: 1;
  event_date: string | null;
  rules_and_warnings: RuleOrWarningItem[];
  updated_by: string | null;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Composite / hydrated shapes used by the UI (joined data from queries)
// ---------------------------------------------------------------------------

export interface SpeakerWithRelations extends Speaker {
  speaker_links: SpeakerLink[];
  tags: Tag[];
  trackers: (SpeakerTracker & { profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null })[];
  added_by_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  deleted_by_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  comment_count: number;
}

export interface CommentWithAuthor extends Comment {
  author: Pick<Profile, "id" | "full_name" | "role" | "avatar_url"> | null;
}

export const STATUS_LABELS: Record<string, string> = {
  no_reply: "No reply yet",
  accepted: "Accepted",
  refused: "Refused",
  unclear: "Unclear",
};

export const DEFAULT_STATUSES: SpeakerStatusOption[] = [
  { slug: "no_reply", label: "No reply yet", color: null, position: 0, is_builtin: true },
  { slug: "unclear", label: "Unclear", color: null, position: 1, is_builtin: true },
  { slug: "accepted", label: "Accepted", color: null, position: 2, is_builtin: true },
  { slug: "refused", label: "Refused", color: null, position: 3, is_builtin: true },
];

export function getStatusLabel(status: string, statuses?: SpeakerStatusOption[]): string {
  if (statuses) {
    const found = statuses.find((s) => s.slug === status);
    if (found) return found.label;
  }
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const PLATFORM_LABELS: Record<LinkPlatform, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
  instagram: "Instagram",
  website: "Website",
  other: "Other",
};

// Best first — the order every tier dropdown/sort/column uses.
export const TIER_ORDER: SpeakerTier[] = ["s", "a", "b", "c", "f"];

export const TIER_LABELS: Record<SpeakerTier, string> = {
  s: "S — Must have",
  a: "A — Strong",
  b: "B — Good",
  c: "C — Maybe",
  f: "F — Unlikely",
};
