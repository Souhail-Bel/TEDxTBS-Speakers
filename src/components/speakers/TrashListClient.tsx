"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/speakers/StatusBadge";
import { ConfirmDialog } from "@/components/speakers/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { restoreSpeaker } from "@/lib/speakers/mutations";
import { writeAuditLog } from "@/lib/audit/log";
import { useProfile } from "@/components/auth/ProfileProvider";
import type { SpeakerWithRelations } from "@/lib/types";

export function TrashListClient({
  speakers: initialSpeakers,
}: {
  speakers: SpeakerWithRelations[];
}) {
  const profile = useProfile();
  const [speakers, setSpeakers] = useState(initialSpeakers);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<SpeakerWithRelations | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleRestore(speaker: SpeakerWithRelations) {
    setRestoringId(speaker.id);
    try {
      const supabase = createClient();
      await restoreSpeaker(supabase, profile.id, speaker.id);
      setSpeakers((prev) => prev.filter((s) => s.id !== speaker.id));
      toast.success(`${speaker.name} restored`);
    } catch {
      toast.error("Couldn't restore this speaker. Please try again.");
    } finally {
      setRestoringId(null);
    }
  }

  async function handlePermanentDelete() {
    if (!confirmTarget) return;
    setConfirming(true);
    try {
      const supabase = createClient();
      // Log before deleting — once gone, there's nothing left to join against.
      await writeAuditLog(supabase, {
        actorId: profile.id,
        action: "speaker.delete_confirmed",
        entityType: "speaker",
        entityId: confirmTarget.id,
        metadata: { name: confirmTarget.name },
      });
      const { error } = await supabase.from("speakers").delete().eq("id", confirmTarget.id);
      if (error) throw error;
      setSpeakers((prev) => prev.filter((s) => s.id !== confirmTarget.id));
      toast.success(`${confirmTarget.name} permanently deleted`);
      setConfirmTarget(null);
    } catch {
      toast.error("Couldn't permanently delete this speaker. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#382325] bg-gradient-to-br from-[#201214] via-[#140D0E] to-[#0D0909] p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(227,27,43,0.18) 0%, transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E31B2B]/35 bg-[#E31B2B]/15 text-[#FF3B4E]">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-3xl">
                Deleted <span className="text-[#E31B2B]">Records</span>
              </h1>
              <span className="rounded-full border border-[#382626] bg-[#1E1415] px-2.5 py-0.5 text-xs font-semibold text-[#C8C0C0]">
                {speakers.length} in trash
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#A6A0A0]">
              Speakers moved to Trash remain recoverable with all links and timeline notes until an admin permanently purges them.
            </p>
          </div>
        </div>
      </div>

      {speakers.length === 0 ? (
        <div className="tedx-surface flex flex-col items-center justify-center rounded-2xl py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#332323] bg-[#140D0E] text-[#777070]">
            <Trash2 className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-[#F5F5F5]">Trash is clean</p>
          <p className="mt-1 text-xs text-[#777070]">
            No soft-deleted speaker records are waiting for review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {speakers.map((speaker) => (
              <motion.div
                key={speaker.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="tedx-surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {speaker.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photo_url}
                      alt={speaker.name}
                      className="h-11 w-11 shrink-0 rounded-full object-cover opacity-75 ring-1 ring-white/15"
                    />
                  ) : (
                    <InitialsAvatar name={speaker.name} size="md" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#F5F5F5]">
                        {speaker.name}
                      </p>
                      <StatusBadge status={speaker.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-[#8A8282]">
                      Moved to trash by{" "}
                      <span className="font-medium text-[#C8C0C0]">
                        {speaker.deleted_by_profile?.full_name ?? "a coordinator"}
                      </span>{" "}
                      {speaker.deleted_at &&
                        formatDistanceToNow(new Date(speaker.deleted_at), {
                          addSuffix: true,
                        }).replace(/^about\s+/i, "")}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRestore(speaker)}
                    loading={restoringId === speaker.id}
                    className="gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmTarget(speaker)}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete forever
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
        title={`Permanently delete ${confirmTarget?.name ?? "this speaker"}?`}
        description="This can't be undone. All of their comments, links, and tags will be deleted too."
        confirmLabel="Delete forever"
        loading={confirming}
        onConfirm={handlePermanentDelete}
      />
    </div>
  );
}
