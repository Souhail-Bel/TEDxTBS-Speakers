"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/speakers/StatusBadge";
import { ConfirmDialog } from "@/components/speakers/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { restoreSpeaker } from "@/lib/speakers/mutations";
import { writeAuditLog } from "@/lib/audit/log";
import { useProfile } from "@/components/auth/ProfileProvider";
import type { SpeakerWithRelations } from "@/lib/types";

export function TrashListClient({ speakers: initialSpeakers }: { speakers: SpeakerWithRelations[] }) {
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

  if (speakers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <Trash2 className="mb-2 h-6 w-6 text-text-tertiary" />
        <p className="text-sm text-text-secondary">Trash is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Trash</h1>
        <p className="text-sm text-text-tertiary">
          Speakers moved here by the team are kept until you confirm permanent deletion.
        </p>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {speakers.map((speaker) => (
            <motion.div
              key={speaker.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {speaker.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photo_url}
                      alt={speaker.name}
                      className="h-10 w-10 rounded-full border border-border object-cover opacity-70"
                    />
                  ) : (
                    <InitialsAvatar name={speaker.name} />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{speaker.name}</p>
                      <StatusBadge status={speaker.status} />
                    </div>
                    <p className="text-xs text-text-tertiary">
                      Moved to trash by{" "}
                      <span className="text-text-secondary">{speaker.deleted_by_profile?.full_name ?? "someone"}</span>{" "}
                      {speaker.deleted_at &&
                        formatDistanceToNow(new Date(speaker.deleted_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
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
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
