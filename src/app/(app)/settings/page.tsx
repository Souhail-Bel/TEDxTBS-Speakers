import { Settings } from "lucide-react";
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
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-3xl">
              Platform <span className="text-[#E31B2B]">Settings</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A6A0A0]">
              Manage your coordinator profile, account credentials, and TEDxTBS event schedule.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProfileSettings profile={profile} />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <PasswordSettings />
          {profile.role === "admin" && (
            <EventDateSettings initialDate={eventSettings?.event_date ?? null} />
          )}
        </div>
      </div>
    </div>
  );
}
