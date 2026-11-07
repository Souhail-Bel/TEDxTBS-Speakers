"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, MessageSquarePlus } from "lucide-react";
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
    <div className="space-y-5">
      {/* Composer */}
      <div className="rounded-xl border border-[#2F1F20] bg-[#120C0D] p-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Log coordination update — e.g. “Sent personalized LinkedIn invite, follow up on Friday”"
          className="min-h-20 border-0 bg-transparent px-1 py-1 text-xs focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handlePost();
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between border-t border-[#231617] pt-2">
          <span className="text-[11px] text-[#6E6666]">Ctrl + Enter to post</span>
          <Button
            onClick={handlePost}
            loading={posting}
            disabled={!body.trim()}
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Send className="h-3.5 w-3.5" /> Post update
          </Button>
        </div>
      </div>

      {/* Vertical Activity Timeline */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2C1D1E] py-10 text-center">
          <MessageSquarePlus className="mb-2 h-5 w-5 text-[#6E6666]" />
          <p className="text-xs font-medium text-[#A6A0A0]">No coordination logs yet</p>
          <p className="mt-0.5 text-[11px] text-[#777070]">
            Log outreach attempts, replies, or call notes above.
          </p>
        </div>
      ) : (
        <div className="relative space-y-3.5 pl-4 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-px before:bg-gradient-to-b before:from-[#E31B2B]/55 before:via-[#382325] before:to-transparent">
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
                  className="group relative flex items-start gap-3"
                >
                  <div className="relative z-10 -ml-4 shrink-0 rounded-full ring-3 ring-[#150E0F]">
                    <InitialsAvatar
                      name={comment.author?.full_name ?? "Deleted user"}
                      src={comment.author?.avatar_url}
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-[#2C1E1F] bg-[#120C0D]/90 px-3.5 py-2.5 transition-colors group-hover:border-[#3D2729]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-baseline gap-2 min-w-0">
                        <span className="truncate text-xs font-semibold text-[#F5F5F5]">
                          {comment.author?.full_name ?? "Deleted user"}
                        </span>
                        <span className="text-[11px] text-[#777070]">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          }).replace(/^about\s+/i, "")}
                        </span>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          className="rounded p-1 text-[#777070] opacity-0 transition-opacity hover:bg-[#261819] hover:text-[#EF4444] group-hover:opacity-100"
                          title="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-[#D8D0D0]">
                      {comment.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
