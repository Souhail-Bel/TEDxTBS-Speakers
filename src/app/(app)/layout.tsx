import { requireProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { ProfileProvider } from "@/components/auth/ProfileProvider";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: eventSettings } = await supabase
    .from("event_settings")
    .select("event_date")
    .eq("id", 1)
    .single();

  return (
    <ProfileProvider profile={profile}>
      <AppShell eventDate={eventSettings?.event_date ?? null}>
        {children}
      </AppShell>
    </ProfileProvider>
  );
}
