"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InitialsAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { addComment, deleteComment } from "@/lib/speakers/mutations";
import { useIsAdmin, useProfile } from "@/components/auth/ProfileProvider";
import type { CommentWithAuthor } from "@/lib/types";

export function CommentThread({
  speakerId,
  comments,
  onPosted,
}: {
  speakerId: string;
  comments: CommentWithAuthor[];
  onPosted?: () => void;
}) {
  const profile = useProfile();
  const isAdmin = useIsAdmin();
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handlePost() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosting(true);
    try {
      const supabase = createClient();
      await addComment(supabase, speakerId, profile.id, trimmed);
      setBody("");
      onPosted?.();
    } catch {
      toast.error("Couldn't post your comment. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const supabase = createClient();
      await deleteComment(supabase, id);
      onPosted?.();
    } catch {
      toast.error("Couldn't delete that comment.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {comments.map((comment) => {
            const canDelete = comment.author_id === profile.id || isAdmin;
            return (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="group flex gap-3"
              >
                <InitialsAvatar name={comment.author?.full_name ?? "Deleted user"} size="sm" />
                <div className="flex-1 rounded-xl border border-border bg-surface-1 px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {comment.author?.full_name ?? "Deleted user"}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 text-text-tertiary"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{comment.body}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="py-6 text-center text-sm text-text-tertiary">
            No updates yet. Be the first to log progress on this speaker.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Log progress — e.g. “Sent an email, waiting for a reply”"
          className="min-h-16"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handlePost();
            }
          }}
        />
        <Button onClick={handlePost} loading={posting} disabled={!body.trim()} className="self-end gap-1.5">
          <Send className="h-3.5 w-3.5" /> Post
        </Button>
      </div>
    </div>
  );
}
