import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Cache Components / Partial Prefetching are left off on purpose: every
   * route here is an authenticated, per-user view over live Supabase data
   * (RLS-gated speaker records, realtime subscriptions), so there's no
   * meaningful static shell to prerender. Standard per-request SSR is the
   * right default for this app.
   */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
