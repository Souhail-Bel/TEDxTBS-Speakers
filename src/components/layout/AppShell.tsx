"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, HelpCircle, LogOut, Menu, Settings } from "lucide-react";
import { Sidebar, TedxLogo } from "@/components/layout/Sidebar";
import { EventBanner } from "@/components/layout/EventBanner";
import { useProfile } from "@/components/auth/ProfileProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

function UserAccountDropdown() {
  const profile = useProfile();
  const router = useRouter();

  const initials = profile.full_name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center gap-1.5 rounded-full bg-black/45 p-1 pr-2 backdrop-blur-md ring-1 ring-white/10 transition-all hover:bg-black/65 hover:ring-[#E31B2B]/45 outline-none"
        aria-label="Account menu"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-[#E31B2B]/50"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#C81927] to-[#7D0D16] text-xs font-bold tracking-wide text-white shadow-[0_0_14px_rgba(227,27,43,0.35)] ring-1 ring-[#FF3B4E]/35">
            {initials || "TX"}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-[#A6A0A0] transition-transform duration-150 group-hover:text-white group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <div className="px-2.5 py-2">
          <p className="truncate text-sm font-semibold text-[#F5F5F5]">
            {profile.full_name}
          </p>
          <p className="truncate text-xs text-[#777070]">{profile.email}</p>
          <span className="mt-1.5 inline-flex items-center rounded-md border border-[#E31B2B]/30 bg-[#E31B2B]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FF7583]">
            {profile.role === "admin" ? "Admin" : "Team member"}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4 text-[#A6A0A0]" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center gap-2 cursor-pointer">
            <HelpCircle className="h-4 w-4 text-[#A6A0A0]" />
            <span>Help & Guide</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-[#FF3B4E] focus:bg-[#E31B2B]/15 focus:text-[#FF7583]"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  children,
  eventDate,
}: {
  children: React.ReactNode;
  eventDate: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSpeakersHome = pathname === "/";

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5]">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Mobile Sticky Top Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#241717] bg-[#0B0808]/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-[#A6A0A0] hover:bg-[#1F1616] hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="scale-75 origin-left">
            <TedxLogo />
          </Link>
        </div>
        <UserAccountDropdown />
      </header>

      {/* Desktop Top-Right User Avatar Dropdown */}
      <div className="fixed top-4 right-6 z-30 hidden lg:block">
        <UserAccountDropdown />
      </div>

      {/* Main Content Area Offset by Fixed Left Sidebar */}
      <div className="flex min-h-screen flex-col lg:pl-[215px]">
        <EventBanner eventDate={eventDate} />
        <main
          className={cn(
            "flex-1 w-full",
            isSpeakersHome
              ? ""
              : "mx-auto max-w-[1360px] px-5 pt-6 pb-12 sm:px-8 lg:pt-14"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
