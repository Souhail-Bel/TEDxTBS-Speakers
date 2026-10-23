import { requireProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { ProfileProvider } from "@/components/auth/ProfileProvider";
import { Navbar } from "@/components/layout/Navbar";
import { EventBanner } from "@/components/layout/EventBanner";

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
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <EventBanner eventDate={eventSettings?.event_date ?? null} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
      </div>
    </ProfileProvider>
  );
}
