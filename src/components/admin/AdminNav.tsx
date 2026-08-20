"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KeyRound,
  Images,
  LayoutDashboard,
  Mail,
  Megaphone,
  Power,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Navigation de la console — détection de la route active côté client.
 * Registre le plus calme du site : l'item actif se pose en verre
 * blanc radius 12 à l'ombre mauve, texte encre — pas de pilule
 * encre ni de spectral ici, la hiérarchie reste sous le dashboard.
 */

export type AdminNavItem = { href: string; label: string };

const ICONS: Record<string, LucideIcon> = {
  "/admin/overview": LayoutDashboard,
  "/admin/users": Users,
  "/admin/security-alerts": ShieldAlert,
  "/admin/neva-design": Images,
  "/admin/announcements": Megaphone,
  "/admin/newsletter": Mail,
  "/admin/maintenance": Power,
  "/admin/admins": KeyRound,
};

function useActive(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item }: { item: AdminNavItem }) {
  const active = useActive(item.href);
  const Icon = ICONS[item.href];
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-[12px] px-3.5 text-[13px] transition-colors duration-[var(--dur-base)]",
        active
          ? "bg-[rgba(255,255,255,0.05)] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_1px_2px_rgba(0,0,0,0.38),0_10px_24px_rgba(0,0,0,0.44)]"
          : "text-slate hover:bg-[rgba(255,255,255,0.05)] hover:text-ink"
      )}
    >
      {Icon ? (
        <Icon
          size={16}
          strokeWidth={1.8}
          aria-hidden
          className={cn(
            "shrink-0 transition-colors duration-[var(--dur-base)]",
            active ? "text-ink" : "text-mist group-hover:text-slate"
          )}
        />
      ) : null}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function AdminSidebarNav({ items }: { items: AdminNavItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.href}>
          <SidebarLink item={item} />
        </li>
      ))}
    </ul>
  );
}

function RailLink({ item }: { item: AdminNavItem }) {
  const active = useActive(item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 shrink-0 items-center rounded-[12px] border px-4 text-xs transition-colors duration-[var(--dur-base)]",
        active
          ? "border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_20px_rgba(0,0,0,0.44)]"
          : "border-[rgba(255,255,255,0.10)] text-slate hover:bg-[rgba(255,255,255,0.05)] hover:text-ink"
      )}
    >
      {item.label}
    </Link>
  );
}

/* Rail mobile — rendu en fragment pour vivre dans le fil défilant du layout. */
export function AdminRailNav({ items }: { items: AdminNavItem[] }) {
  return (
    <>
      {items.map((item) => (
        <RailLink key={item.href} item={item} />
      ))}
    </>
  );
}
