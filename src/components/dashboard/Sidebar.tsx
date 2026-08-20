"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CreditCard,
  Layers,
  LogOut,
  MessageSquare,
  Palette,
  ScanSearch,
  Settings,
  ShieldCheck,
  UserRound,
  Wand2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";
import { COMING_SOON } from "@/lib/feature-flags";
import { Gauge } from "@/components/ui/gauge";
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
  isAdmin?: boolean;
}

/*
 * Sidebar Givre noir — un panneau de verre dépoli qui flotte sur
 * la scène. Arête haute allumée, filets intérieurs très doux.
 * L'item actif porte le tick aurore (barre 2 px lilas → pêche) sur
 * un verre blanc 5 % radius 10 — plus jamais de pilule pleine.
 * Les crédits vivent dans une pilule de verre au liseré spectral.
 */
/* Pivot 20/08 — les outils de création passent « À venir »
   (COMING_SOON) : entrées visibles mais inertes. */
const navGroups: {
  label: string;
  items: { href: string; icon: typeof Layers; label: string; comingSoon?: boolean }[];
}[] = [
  {
    label: "Atelier",
    items: [{ href: "/dashboard", icon: Layers, label: "Projets" }],
  },
  {
    label: "Création",
    items: [
      { href: "/dashboard/design", icon: Palette, label: "Design Studio", comingSoon: true },
      { href: "/dashboard/chat", icon: MessageSquare, label: "Creative Director", comingSoon: true },
      { href: "/dashboard/enhance", icon: Wand2, label: "Enhance", comingSoon: true },
      { href: "/dashboard/character", icon: UserRound, label: "Character", comingSoon: true },
      { href: "/dashboard/audit", icon: ScanSearch, label: "Audit", comingSoon: true },
    ],
  },
  {
    label: "Bibliothèque",
    items: [{ href: "/dashboard/downloads", icon: BookOpen, label: "Ressources" }],
  },
  {
    label: "Compte",
    items: [
      { href: "/dashboard/billing", icon: CreditCard, label: "Abonnement" },
      { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
    ],
  },
];

export default function Sidebar({ user, onClose }: { user: UserProfile; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const groups = user.isAdmin
    ? navGroups.map((group) =>
        group.label === "Compte"
          ? { ...group, items: [...group.items, { href: "/admin", icon: ShieldCheck, label: "Admin" }] }
          : group
      )
    : navGroups;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  function handleLogout() {
    clearSession();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="pv-glass pv-edge flex h-full w-[264px] flex-col overflow-hidden rounded-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_2px_6px_rgba(0,0,0,0.40),0_24px_56px_rgba(0,0,0,0.50)]">
      {/* Marque — le monogramme noir signe le panneau */}
      <div className="flex h-[68px] items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5">
        <Link
          href="/dashboard"
          onClick={onClose}
          aria-label="Neva Design — vue d'ensemble"
          className="flex items-center gap-3"
        >
          <Image
            src="/nevanoir.jpg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
          />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-medium tracking-[-0.02em] text-ink">
              Neva Design
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
              Studio créatif
            </span>
          </span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate transition-colors duration-[var(--dur-base)] hover:bg-ink/5 hover:text-ink lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        ) : null}
      </div>

      {/* Créations — la pilule de verre au liseré spectral */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
            Créations
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--num-color)]">
            {user.plan}
          </span>
        </div>
        <motion.p
          key={user.credits}
          initial={{ opacity: 0.4, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pv-credit-pill px-4 py-2"
        >
          <span className="pv-display text-[26px] leading-none text-ink">
            {user.credits.toLocaleString("fr-FR")}
          </span>
          <span className="font-mono text-[11px] tracking-[0.08em] text-mist">
            / {user.maxCredits.toLocaleString("fr-FR")}
          </span>
        </motion.p>
        <Gauge value={user.credits} max={user.maxCredits} className="mt-4" />
      </div>

      {/* Navigation — scrollbar fine et transparente : rien ne raye le verre */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-color:rgba(255,255,255,0.14)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-0 [&::-webkit-scrollbar-thumb]:bg-[rgba(255,255,255,0.14)] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[5px]">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="mb-2 px-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                {group.label}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                /* Outil « À venir » : visible mais inerte — opacité
                   55 %, cursor default, badge, tooltip. Clic : rien. */
                if (COMING_SOON && item.comingSoon) {
                  return (
                    <span
                      key={item.href}
                      title="Disponible prochainement"
                      aria-disabled
                      className="relative flex h-9 cursor-default items-center gap-3 rounded-[10px] px-4 text-[13px] text-mist opacity-55"
                    >
                      <item.icon size={16} strokeWidth={1.5} className="shrink-0 text-mist" />
                      <span className="truncate">{item.label}</span>
                      <span className="nv-badge-soon ml-auto">À venir</span>
                    </span>
                  );
                }
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex h-9 items-center gap-3 rounded-[10px] px-4 text-[13px] transition-colors duration-[var(--dur-base)]",
                      active
                        ? "font-medium text-ink"
                        : "text-mist hover:bg-white/[0.04] hover:text-slate"
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-[10px] bg-[rgba(255,255,255,0.05)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      >
                        {/* Le tick aurore — la seule lumière vive de la nav */}
                        <span aria-hidden className="nv-tick" />
                      </motion.span>
                    ) : null}
                    <item.icon
                      size={16}
                      strokeWidth={1.5}
                      className={cn(
                        "relative shrink-0 transition-colors duration-[var(--dur-base)]",
                        active ? "text-ink" : "text-mist group-hover:text-slate"
                      )}
                    />
                    <span className="relative truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Utilisateur */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-3">
        <div className="flex items-center gap-3 rounded-[20px] border border-[color:var(--hairline-glass)] bg-white/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_8px_20px_rgba(0,0,0,0.40)]">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-ink">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-[11px] font-semibold text-[#060606]">
                {user.initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-ink">{user.name}</div>
            <div className="truncate font-mono text-[10px] text-mist">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-lg p-2 text-mist transition-colors duration-[var(--dur-base)] hover:bg-ink/5 hover:text-err"
            aria-label="Se déconnecter"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
