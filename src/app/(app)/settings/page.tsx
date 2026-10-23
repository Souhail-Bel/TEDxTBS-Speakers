import { requireProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { EventDateSettings } from "@/components/settings/EventDateSettings";

export default async function SettingsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: eventSettings } = await supabase
    .from("event_settings")
    .select("event_date")
    .eq("id", 1)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        <p className="text-sm text-text-tertiary">Manage your account and, if you&apos;re an admin, the event.</p>
      </div>

      <ProfileSettings profile={profile} />
      <PasswordSettings />
      {profile.role === "admin" && <EventDateSettings initialDate={eventSettings?.event_date ?? null} />}
    </div>
  );
}
