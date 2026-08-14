import {
  ArrowRight,
  ArrowUpRight,
  ImageIcon,
  MessageSquare,
  Palette,
  ScanSearch,
  UserRound,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ACCENT_STYLES, KIND_LABELS, type SiteAnnouncement } from "@/lib/announcements";
import { PLANS } from "@/lib/plans";
import { backendGetJson } from "@/lib/api/backend-server";
import LiveCreditMeter from "@/components/dashboard/LiveCreditMeter";

type MeResponse = {
  id: string
  email: string
  user_metadata?: { display_name?: string; full_name?: string; name?: string }
  credits: number
  plan: string
}

type OverviewResponse = {
  todayCount: number
  monthCount: number
  announcements: SiteAnnouncement[]
  recentActivity: Array<{ type: string; description: string; amount: number; created_at: string }>
}

/*
 * Accueil de l'atelier — tuiles de verre pour les statistiques,
 * grille de lancement rapide, registre d'activité en mono et
 * bibliothèque de créations. La lumière spectrale guide l'œil.
 */

const quickActions = [
  {
    label: "Créer un visuel",
    href: "/dashboard/design",
    icon: Palette,
    detail: "Affiche, bannière, logo, campagne RP",
  },
  {
    label: "Améliorer une image",
    href: "/dashboard/enhance",
    icon: Wand2,
    detail: "Upscale et finition d'assets existants",
  },
  {
    label: "Auditer un design",
    href: "/dashboard/audit",
    icon: ScanSearch,
    detail: "Les points faibles avant le lancement",
  },
  {
    label: "Dossier personnage",
    href: "/dashboard/character",
    icon: UserRound,
    detail: "Identité et documents RP",
  },
];

const libraryItems = [
  { title: "Affiche cartel Vice City", type: "Campagne", image: "/vice.webp", metric: "9:16" },
  { title: "Pack serveur Prime", type: "Ressource", image: "/Prime_-_preview_serveur_pack_15.webp", metric: "Pack" },
  { title: "Lancement beach club", type: "Lifestyle", image: "/plage.webp", metric: "4K" },
];

const TYPE_LABELS: Record<string, string> = {
  chat: "Creative Director",
  image_generation: "Design Studio",
  image_enhancement: "Enhance",
  image_audit: "Audit",
  image_audit_improved: "Audit",
  character_asset: "Character",
  signup_bonus: "Créations offertes",
  subscription: "Abonnement",
  topup: "Recharge de créations",
};

const TYPE_ICONS: Record<string, typeof ImageIcon> = {
  chat: MessageSquare,
  character_asset: UserRound,
  image_audit: ScanSearch,
  image_audit_improved: ScanSearch,
  image_enhancement: Wand2,
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${days} j`;
}

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: "Europe/Paris" })
      .format(new Date())
  );
  return hour >= 18 || hour < 6 ? "Bonsoir" : "Bonjour";
}

export default async function DashboardPage() {
  const [me, overview] = await Promise.all([
    backendGetJson<MeResponse>("/me"),
    backendGetJson<OverviewResponse>("/dashboard/overview"),
  ]);

  if (!me) redirect("/login");

  const meta = me.user_metadata ?? {};
  const firstName = (meta.display_name ?? meta.full_name ?? meta.name ?? me.email.split("@")[0] ?? "Créateur")
    .split(" ")[0];

  const credits = me.credits;
  const plan = (me.plan ?? "free") as keyof typeof PLANS;
  const planInfo = PLANS[plan] ?? PLANS.free;
  const maxCredits = planInfo.credits;

  const usageTypes = ["chat", "image_generation", "image_enhancement", "image_audit", "image_audit_improved", "character_asset"];

  const todayCount = overview?.todayCount ?? 0;
  const monthCount = overview?.monthCount ?? 0;
  const announcements = overview?.announcements ?? [];
  const recentActivity = (overview?.recentActivity ?? []).filter((t) => usageTypes.includes(t.type));
  const conversionHint =
    plan === "free" ? "Le plan supérieur retire les limites d'aperçu" : "Espace de production actif";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      {/* Annonces */}
      {announcements.length > 0 ? (
        <div className="mb-8 grid gap-3 lg:grid-cols-2">
          {announcements.map((item) => {
            const style = ACCENT_STYLES[item.accent];
            const content = (
              <div
                className="flex items-center gap-4 rounded-xl border py-3 pl-4 pr-5 backdrop-blur-sm transition-colors hover:bg-ink/[0.03]"
                style={{ borderColor: style.border, background: style.bg }}
              >
                <span
                  className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: style.color }}
                >
                  {item.badge || KIND_LABELS[item.kind]}
                </span>
                <span aria-hidden className="h-4 w-px shrink-0 bg-[color:var(--hairline-strong)]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink">{item.title}</div>
                  <div className="truncate text-xs text-steel">{item.message}</div>
                </div>
                {item.cta_label ? <ArrowRight size={14} className="shrink-0 text-mist" /> : null}
              </div>
            );
            return item.href ? (
              <Link key={item.id} href={item.href}>{content}</Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      ) : null}

      {/* Salutation */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="pv-label text-[color:var(--num-color)]">Atelier</p>
          <h1 className="pv-display mt-4 text-[clamp(2.2rem,4.5vw,3.4rem)] text-ink">
            {greeting()}, <span className="pv-beam-underline font-medium text-ink">{firstName}.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
            Vos créations, vos crédits et votre pipeline visuel, réunis sur un seul plan de travail.
          </p>
        </div>
        <Link href="/dashboard/design" className="shrink-0">
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] transition-colors hover:bg-[#35305E]">
            Création rapide
            <ArrowRight size={15} />
          </span>
        </Link>
      </div>

      {/* Tuiles de statistiques */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="pv-glass pv-edge rounded-2xl p-6">
          <LiveCreditMeter userId={me.id} initialCredits={credits} maxCredits={maxCredits} />
        </div>
        <div className="pv-glass pv-edge rounded-2xl p-6">
          <p className="pv-label">Plan actuel</p>
          <p className="pv-display mt-3 text-[42px] leading-none text-ink">{planInfo.name}</p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.1em] text-dusk">{conversionHint}</p>
        </div>
        <div className="pv-glass pv-edge rounded-2xl p-6">
          <p className="pv-label">Usage du mois</p>
          <p className="pv-display mt-3 text-[42px] leading-none text-ink">
            {monthCount ?? 0}
            <span className="ml-2 font-mono text-xs tracking-[0.08em] text-dusk">générations</span>
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.1em] text-[color:var(--num-color)]">
            {todayCount ?? 0} aujourd’hui
          </p>
        </div>
      </section>

      <div className="mt-12 grid gap-12 xl:grid-cols-12">
        {/* Lancement rapide — grille de cartes */}
        <section className="xl:col-span-5">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">File de production</h2>
            <span className="pv-label--dim pv-label">Partir du résultat</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="pv-glass pv-edge pv-ignite group flex flex-col gap-3 rounded-xl p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--hairline)] bg-linen text-steel transition-colors duration-300 group-hover:border-[rgba(164,139,232,0.35)] group-hover:text-[color:var(--num-color)]">
                  <action.icon size={16} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="flex items-center gap-1.5 text-[14px] font-medium text-ink">
                    {action.label}
                    <ArrowUpRight
                      size={13}
                      className="text-dusk transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                    />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-steel">{action.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Activité */}
        <section className="xl:col-span-7">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">Activité récente</h2>
            <span className="pv-label--dim pv-label">Synchronisée en direct</span>
          </div>
          {recentActivity.length === 0 ? (
            <div className="relative overflow-hidden rounded-xl border border-dashed border-[color:var(--hairline-strong)] px-6 py-12 text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(164,139,232,0.12),transparent_70%)]"
              />
              <p className="text-lg font-semibold text-ink/85">Le registre est encore vierge.</p>
              <p className="mt-3 font-mono text-xs tracking-[0.06em] text-dusk">
                Lancez un design, un audit ou une conversation.
              </p>
            </div>
          ) : (
            <ul className="pv-glass pv-edge rounded-xl px-2">
              {recentActivity.map((item, index) => {
                const Icon = TYPE_ICONS[item.type] ?? ImageIcon;
                return (
                  <li
                    key={`${item.created_at}-${index}`}
                    className="flex items-center gap-4 border-b border-[color:var(--hairline)] px-3 py-3.5 last:border-b-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--hairline)] bg-ink/[0.04] text-steel">
                      <Icon size={14} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] text-ink">{TYPE_LABELS[item.type] ?? item.type}</span>
                      <span className="ml-3 hidden truncate font-mono text-[10px] tracking-[0.04em] text-dusk sm:inline">
                        {item.description}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[color:var(--num-color)]">
                      {Math.abs(item.amount)} cr
                    </span>
                    <span className="w-24 shrink-0 text-right font-mono text-[10px] text-dusk">
                      {timeAgo(item.created_at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Bibliothèque */}
      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">Bibliothèque de création</h2>
          <Link href="/neva-design#portfolio" className="pv-link inline-flex items-center gap-2 text-[13px]">
            Ouvrir la galerie
            <ArrowRight size={13} className="text-mist" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {libraryItems.map((project) => (
            <figure key={project.title} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss transition-colors duration-500 group-hover:border-[#C9C9C0]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <span className="absolute right-3 top-3 z-10 rounded-full border border-[color:var(--hairline-strong)] bg-[rgba(28,23,55,0.6)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink/80 backdrop-blur-sm">
                  {project.metric}
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(43,36,80,0.05)]"
                />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between">
                <span className="text-[13px] text-ink/80">{project.title}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-dusk">
                  {project.type}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
