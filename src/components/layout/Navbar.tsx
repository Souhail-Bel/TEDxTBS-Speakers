"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Trash2,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  Mic2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useIsAdmin, useProfile } from "@/components/auth/ProfileProvider";
import { InitialsAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/", label: "Speakers", icon: Mic2, adminOnly: false },
  { href: "/team", label: "Team", icon: Users, adminOnly: false },
  { href: "/trash", label: "Trash", icon: Trash2, adminOnly: true },
  { href: "/audit-log", label: "Audit log", icon: ScrollText, adminOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const isAdmin = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1 text-lg font-black tracking-tight">
            <span className="text-text-primary">TEDx</span>
            <span className="text-red-500">TBS</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                    active
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-surface-2"
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-80">
              <InitialsAvatar name={profile.full_name} src={profile.avatar_url} size="sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-medium text-text-primary">{profile.full_name}</p>
                <p className="truncate text-xs text-text-tertiary">{profile.email}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                  {profile.role === "admin" ? "Admin" : "Team member"}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleSignOut}
                className="flex items-center gap-2 text-red-400 focus:text-red-300"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-2 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {items.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-red-500/15 text-red-300"
                        : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
