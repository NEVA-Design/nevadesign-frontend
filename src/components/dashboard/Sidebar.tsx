"use client";

import { motion } from "framer-motion";
import { BookOpen, CreditCard, Home, LogOut, MessageSquare, Palette, Settings, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  credits: number;
  maxCredits: number;
  plan: string;
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: Home, label: "Dashboard", accent: "#55D18A" },
    ],
  },
  {
    label: "Studio",
    items: [
      { href: "/dashboard/design", icon: Palette, label: "Neva Design", accent: "#FF7B4B" },
    ],
  },
  {
    label: "Direction",
    items: [
      { href: "/dashboard/chat", icon: MessageSquare, label: "Creative Director", accent: "#FFB5C8" },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/dashboard/downloads", icon: BookOpen, label: "Ressources", accent: "#9BD7FF" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/billing", icon: CreditCard, label: "Billing", accent: "#FFD166" },
      { href: "/dashboard/settings", icon: Settings, label: "Parametres", accent: "#BBA7FF" },
    ],
  },
];

export default function Sidebar({ user, onClose }: { user: UserProfile; onClose?: () => void }) {
  const pathname = usePathname();
  const creditPct = Math.min(100, Math.round((user.credits / Math.max(user.maxCredits, 1)) * 100));

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex h-screen w-[252px] flex-col border-r border-white/[0.07] bg-[#050505]/96 shadow-[18px_0_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4">
        <Link href="/dashboard" onClick={onClose} className="group flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03]">
            <Image src="/nevalogooo.png" alt="Neva AI" fill sizes="36px" className="object-contain p-1.5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight text-[#F5F0E8]">Neva AI</div>
            <div className="truncate text-[11px] text-[#777]">Creative OS for FiveM</div>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#666] transition-colors hover:bg-white/[0.06] hover:text-[#F5F0E8] lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="px-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#A9A39B]">Credits</span>
            <span className="text-[11px] font-semibold text-[#FFD166]">{creditPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/35">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#FF6B7D,#FF7B4B,#FFD166)]"
              initial={{ width: 0 }}
              animate={{ width: `${creditPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 flex items-end justify-between">
            <motion.div
              key={user.credits}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold tracking-tight text-[#F5F0E8]"
            >
              {user.credits.toLocaleString()}
            </motion.div>
            <div className="pb-0.5 text-[10px] uppercase tracking-[0.16em] text-[#777]">{user.plan}</div>
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4B4B4B]">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition-all duration-[250ms]",
                      active
                        ? "bg-white/[0.08] text-[#F5F0E8] shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
                        : "text-[#85817B] hover:bg-white/[0.045] hover:text-[#F5F0E8]"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-y-2 left-0 w-1 rounded-r-full"
                        style={{ background: item.accent }}
                      />
                    )}
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-xl border transition-all"
                      style={{
                        color: active ? item.accent : undefined,
                        borderColor: active ? `${item.accent}42` : "rgba(255,255,255,0.06)",
                        background: active ? `${item.accent}16` : "rgba(255,255,255,0.025)",
                      }}
                    >
                      <item.icon size={15} />
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-2">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#FF6B7D,#FFD166)]">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name} width={36} height={36} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                {user.initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-[#F5F0E8]">{user.name}</div>
            <div className="truncate text-[10px] text-[#666]">{user.email}</div>
          </div>
          <form action={logout}>
            <button type="submit" className="rounded-xl p-2 text-[#555] transition-colors hover:bg-white/[0.06] hover:text-[#FF6B7D]" aria-label="Se deconnecter">
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
