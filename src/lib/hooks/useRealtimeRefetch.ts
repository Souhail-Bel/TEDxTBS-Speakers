"use client";

import { useEffect, useEffectEvent } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Postgres changes on the given tables and calls `onChange`
 * (debounced) whenever something changes. Used for the "full realtime sync"
 * behavior: rather than hand-merging every possible insert/update/delete
 * shape across several joined tables, we just refetch — the datasets here
 * are small (a few hundred speakers at most), so this stays fast while being
 * much less error-prone than manual cache surgery.
 *
 * `onChange` is wrapped with useEffectEvent so the effect only re-subscribes
 * when the table list or debounce actually change, not on every render where
 * the caller passes a fresh callback identity.
 */
export function useRealtimeRefetch(tables: string[], onChange: () => void, debounceMs = 250) {
  const notifyChange = useEffectEvent(() => onChange());

  useEffect(() => {
    const supabase = createClient();
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase.channel(`realtime:${tables.join(",")}`);

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => notifyChange(), debounceMs);
        }
      );
    }

    channel.subscribe();

    return () => {
      if (timeout) clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(","), debounceMs]);
}
