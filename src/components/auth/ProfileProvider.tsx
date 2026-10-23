"use client";

import { createContext, useContext } from "react";
import type { Profile } from "@/lib/types";

const ProfileContext = createContext<Profile | null>(null);

/**
 * Makes the signed-in user's profile (role, name, etc.) available to client
 * components without each one re-fetching it. Populated server-side once in
 * the (app) layout and passed down.
 */
export function ProfileProvider({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}

export function useProfile(): Profile {
  const profile = useContext(ProfileContext);
  if (!profile) {
    throw new Error("useProfile must be used within a ProfileProvider (inside the (app) layout).");
  }
  return profile;
}

export function useIsAdmin(): boolean {
  return useProfile().role === "admin";
}
