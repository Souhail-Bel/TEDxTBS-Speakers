"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mic,
  Users,
  Trash2,
  History,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useIsAdmin } from "@/components/auth/ProfileProvider";

const PRIMARY_NAV = [
  { href: "/", label: "Speakers", icon: Mic, adminOnly: false },
  { href: "/team", label: "Team", icon: Users, adminOnly: false },
  { href: "/trash", label: "Trash", icon: Trash2, adminOnly: true },
  { href: "/audit-log", label: "Audit log", icon: History, adminOnly: true },
];

const SECONDARY_NAV = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function TedxLogo({ className }: { className?: string }) {
  return (
    <div className={cn("select-none", className)}>
      <div className="flex items-baseline leading-none tracking-tight">
        <span className="text-[25px] font-black tracking-[-0.04em] text-[#E31B2B]">
          TED
        </span>
        <span className="relative -top-[7px] ml-[1px] mr-[3px] text-[15px] font-black text-[#E31B2B]">
          x
        </span>
        <span className="text-[24px] font-medium tracking-[-0.02em] text-[#F5F5F5]">
          TBS
        </span>
      </div>
      <p className="mt-1.5 text-[8.5px] font-medium tracking-[0.01em] text-[#A6A0A0]">
        <span className="font-bold text-[#E31B2B]">x</span> = independently organized TED event
      </p>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  const primaryItems = PRIMARY_NAV.filter((item) => !item.adminOnly || isAdmin);

  function isRouteActive(href: string) {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/speakers");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0B0808] text-[#F5F5F5]">
      {/* Top Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" onClick={onNavigate} className="inline-block outline-none">
          <TedxLogo />
        </Link>
      </div>

      <div className="mx-4 border-t border-[#221515]" />

      {/* Primary Nav */}
      <nav className="mt-4 flex flex-col gap-1 px-3" aria-label="Main navigation">
        {primaryItems.map((item) => {
          const active = isRouteActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150",
                active
                  ? "tedx-nav-active font-semibold text-white"
                  : "font-medium text-[#A6A0A0] hover:bg-[#181011] hover:text-[#F5F5F5]"
              )}
            >
              <item.icon
                className={cn(
                  "h-[17px] w-[17px] shrink-0 transition-colors",
                  active
                    ? "text-white"
                    : "text-[#A6A0A0] group-hover:text-[#F5F5F5]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 my-4 border-t border-[#221515]" />

      {/* Secondary Nav */}
      <nav className="flex flex-col gap-1 px-3" aria-label="Secondary navigation">
        {SECONDARY_NAV.map((item) => {
          const active = isRouteActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-150",
                active
                  ? "tedx-nav-active font-semibold text-white"
                  : "font-medium text-[#A6A0A0] hover:bg-[#181011] hover:text-[#F5F5F5]"
              )}
            >
              <item.icon
                className={cn(
                  "h-[17px] w-[17px] shrink-0 transition-colors",
                  active
                    ? "text-white"
                    : "text-[#A6A0A0] group-hover:text-[#F5F5F5]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Stylized TEDx Branding + Particle Wave */}
      <div className="pointer-events-none relative mt-auto select-none overflow-hidden pt-10 pb-6">
        {/* Ambient crimson bottom glow */}
        <div
          className="absolute -bottom-8 -left-8 h-36 w-44 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(227,27,43,0.22) 0%, transparent 70%)" }}
        />

        {/* Oversized Stylized Red X */}
        <div className="relative px-5">
          <svg
            viewBox="0 0 110 110"
            className="-ml-6 mb-[-14px] h-[94px] w-[94px]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tedx-sidebar-x" x1="0%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#EB1E2E" />
                <stop offset="55%" stopColor="#B0111E" />
                <stop offset="100%" stopColor="#3B060B" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <path
              d="M14 10 H38 L55 37 L72 10 H96 L67 53 L98 100 H74 L55 70 L36 100 H12 L43 53 Z"
              fill="url(#tedx-sidebar-x)"
            />
          </svg>

          <div className="relative z-10 pl-0.5 text-[13px] font-semibold leading-[1.35] tracking-tight text-[#F5F5F5]">
            <p>Ideas that</p>
            <p>
              <span className="text-[#E31B2B]">inspire</span> change.
            </p>
          </div>
        </div>

        {/* Flowing Red Particle-Wave Mesh at Very Bottom */}
        <svg
          viewBox="0 0 220 56"
          fill="none"
          className="mt-2 h-12 w-full opacity-90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="tedx-wave-1" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E31B2B" stopOpacity="0.15" />
              <stop offset="45%" stopColor="#FF1428" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#E31B2B" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="tedx-wave-2" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7A0B14" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#E31B2B" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FF3B4E" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path d="M-10 46 C 45 16, 115 58, 230 14" stroke="url(#tedx-wave-1)" strokeWidth="1.3" />
          <path d="M-10 50 C 55 22, 125 56, 230 20" stroke="url(#tedx-wave-1)" strokeWidth="1" opacity="0.75" />
          <path d="M-10 54 C 65 28, 135 54, 230 26" stroke="url(#tedx-wave-2)" strokeWidth="0.9" opacity="0.65" />
          <path d="M-10 38 C 40 24, 105 48, 230 8" stroke="url(#tedx-wave-2)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
          {/* Subtle glowing particles */}
          <circle cx="34" cy="34" r="1.3" fill="#FF1428" opacity="0.8" />
          <circle cx="68" cy="31" r="1" fill="#FF7583" opacity="0.7" />
          <circle cx="118" cy="39" r="1.4" fill="#FF1428" opacity="0.85" />
          <circle cx="156" cy="32" r="1.1" fill="#FF3B4E" opacity="0.75" />
          <circle cx="188" cy="21" r="1.5" fill="#FF1428" opacity="0.9" />
          <circle cx="204" cy="16" r="1" fill="#FFD6DA" opacity="0.75" />
        </svg>
      </div>
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[215px] border-r border-[#241717] bg-[#0B0808] lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs animate-fade-in"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[235px] border-r border-[#332323] bg-[#0B0808] shadow-2xl">
            <button
              type="button"
              onClick={onCloseMobile}
              className="absolute top-5 right-3 z-20 rounded-lg p-1.5 text-[#A6A0A0] hover:bg-[#1F1616] hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
