import {
  ArrowRight,
  ImageIcon,
  MessageSquare,
  Plus,
  ScanSearch,
  UserRound,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ACCENT_STYLES, KIND_LABELS, type SiteAnnouncement } from "@/lib/announcements";
import { COMING_SOON } from "@/lib/feature-flags";
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

type ProjectRow = {
  id: string
  name: string
  sector: string
  palette: string[]
  logo_master: { url: string } | null
  assetCount: number
  lastActivity: string
  updated_at: string
}

/*
 * Vue Projets — l'accueil de l'atelier (run 5). Chaque projet porte la
 * DA complète d'un serveur : logo master, palette, ambiance. Les tuiles
 * de verre donnent l'état du compte, la grille donne les projets, le
 * registre d'activité ferme le plan de travail.
 */

const SECTOR_LABELS: Record<string, string> = {
  fivem: "FiveM",
  youtube: "YouTube",
  marques: "Marques",
  evenementiel: "Événementiel",
};

const TYPE_LABELS: Record<string, string> = {
  chat: "Creative Director",
  image_generation: "Design Studio",
  image_enhancement: "Enhance",
  image_audit: "Audit",
  image_audit_improved: "Audit",
  character_asset: "Character",
  project_creation: "Projet",
  project_export: "Export projet",
  project_retouch: "Retouche projet",
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
  const [me, overview, projectsRes] = await Promise.all([
    backendGetJson<MeResponse>("/me"),
    backendGetJson<OverviewResponse>("/dashboard/overview"),
    backendGetJson<{ projects: ProjectRow[] }>("/projects"),
  ]);

  if (!me) redirect("/login");

  const meta = me.user_metadata ?? {};
  const firstName = (meta.display_name ?? meta.full_name ?? meta.name ?? me.email.split("@")[0] ?? "Créateur")
    .split(" ")[0];

  const credits = me.credits;
  const plan = (me.plan ?? "free") as keyof typeof PLANS;
  const planInfo = PLANS[plan] ?? PLANS.free;
  const maxCredits = planInfo.credits;

  const usageTypes = ["chat", "image_generation", "image_enhancement", "image_audit", "image_audit_improved", "character_asset", "project_creation", "project_export", "project_retouch"];

  const todayCount = overview?.todayCount ?? 0;
  const monthCount = overview?.monthCount ?? 0;
  const announcements = overview?.announcements ?? [];
  const recentActivity = (overview?.recentActivity ?? []).filter((t) => usageTypes.includes(t.type));
  const projects = projectsRes?.projects ?? [];
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
          <p className="pv-label text-[color:var(--num-color)]">Projets</p>
          <h1 className="pv-display mt-4 text-[clamp(2.2rem,4.5vw,3.4rem)] text-ink">
            {greeting()}, <span className="pv-beam-underline font-medium text-ink">{firstName}.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
            Chaque projet porte l&apos;identité complète d&apos;un serveur — logo master, palette,
            ambiance. Toutes ses créations en héritent.
          </p>
        </div>
        {COMING_SOON ? (
          <span
            title="Disponible prochainement"
            aria-disabled
            className="inline-flex h-11 shrink-0 cursor-default items-center justify-center gap-2.5 rounded-[14px] border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-ink opacity-55 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
          >
            <Plus size={15} strokeWidth={1.5} />
            Nouveau projet
            <span className="nv-badge-soon">À venir</span>
          </span>
        ) : (
          <Link href="/dashboard/projects/new" className="pv-btn shrink-0">
            <Plus size={15} strokeWidth={1.5} />
            Nouveau projet
          </Link>
        )}
      </div>

      {/* Tuiles de statistiques — une carte majeure (l'anneau des
          créations restantes), deux cartes secondaires plus basses */}
      <section className="mt-10 grid gap-4 md:grid-cols-3 md:items-start">
        <div className="nv-card p-6">
          <LiveCreditMeter userId={me.id} initialCredits={credits} maxCredits={maxCredits} />
        </div>
        <div className="nv-card px-6 py-4">
          <p className="pv-label">Plan actuel</p>
          <p className="pv-display mt-2 text-[26px] leading-none text-ink">{planInfo.name}</p>
          <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-mist">{conversionHint}</p>
        </div>
        <div className="nv-card px-6 py-4">
          <p className="pv-label">Usage du mois</p>
          <p className="pv-display mt-2 text-[26px] leading-none text-ink">
            {monthCount ?? 0}
            <span className="ml-2 font-mono text-xs tracking-[0.08em] text-mist">générations</span>
          </p>
          <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-[color:var(--num-color)]">
            {todayCount ?? 0} aujourd’hui
          </p>
        </div>
      </section>

      {/* Projets */}
      <section className="mt-12">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">
            {projects.length > 0 ? `${projects.length} projet${projects.length > 1 ? "s" : ""}` : "Votre atelier"}
          </h2>
          <span className="pv-label--dim pv-label">Une DA par serveur</span>
        </div>

        {projects.length === 0 ? (
          /* État vide composé — le texte à gauche, la preuve visuelle à droite */
          <div className="nv-card relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/3 h-64 w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(164,139,232,0.16),transparent_70%)]"
            />
            <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <p className="pv-label text-[color:var(--num-color)]">Premier projet</p>
                <h3 className="pv-display mt-4 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight text-ink">
                  Créez votre premier projet.
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-steel">
                  Un questionnaire illustré, un logo master généré puis détouré,
                  et chaque bannière, affiche ou wallpaper qui suit garde exactement
                  la même direction artistique.
                </p>
                {COMING_SOON ? (
                  <span
                    title="Disponible prochainement"
                    aria-disabled
                    className="mt-7 inline-flex h-11 cursor-default items-center justify-center gap-2.5 rounded-[14px] border border-white/[0.12] bg-white/[0.04] px-6 text-sm font-medium text-ink opacity-55 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
                  >
                    Créer un projet
                    <span className="nv-badge-soon">À venir</span>
                  </span>
                ) : (
                  <Link href="/dashboard/projects/new" className="pv-btn mt-7">
                    Créer un projet
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </Link>
                )}
                <p className="mt-4 font-mono text-[10px] tracking-[0.1em] text-dusk">
                  3 questions · logo d’abord · zéro prompt à écrire
                </p>
              </div>
              {/* Éventail de créations — ce que le moteur produit */}
              <div className="relative mx-auto hidden h-[260px] w-full max-w-[420px] lg:block" aria-hidden>
                <div className="absolute left-0 top-8 h-[210px] w-[150px] -rotate-6 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)] shadow-[0_18px_44px_rgba(0,0,0,0.52)]">
                  <Image src="/affiche1.webp" alt="" fill sizes="150px" className="object-cover" />
                </div>
                <div className="absolute left-1/2 top-0 z-10 h-[240px] w-[170px] -translate-x-1/2 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)] shadow-[0_24px_56px_rgba(0,0,0,0.6)]">
                  <Image src="/postergrandfivem.webp" alt="" fill sizes="170px" className="object-cover" />
                </div>
                <div className="absolute right-0 top-10 h-[200px] w-[145px] rotate-6 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)] shadow-[0_18px_44px_rgba(0,0,0,0.52)]">
                  <Image src="/vice.webp" alt="" fill sizes="145px" className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="nv-card nv-card--lift group flex flex-col p-5"
              >
                <div className="flex items-center gap-4">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-white/[0.04] p-[10px]">
                    {project.logo_master?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.logo_master.url}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="pv-display text-lg text-ink">
                        {project.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium text-ink">{project.name}</span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--num-color)]">
                      {SECTOR_LABELS[project.sector] ?? project.sector}
                    </span>
                  </span>
                </div>
                {/* Pied de carte : la palette en pastilles superposées
                    au coin bas-gauche, la méta en mono */}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[color:var(--hairline)] pt-4">
                  {project.palette.length > 0 ? (
                    <span className="nv-swatches shrink-0" aria-hidden>
                      {project.palette.slice(0, 5).map((color, i) => (
                        <span key={`${color}-${i}`} style={{ background: color }} />
                      ))}
                    </span>
                  ) : (
                    <span aria-hidden />
                  )}
                  <span className="truncate font-mono text-[10.5px] tracking-[0.04em] text-mist">
                    {project.assetCount} création{project.assetCount > 1 ? "s" : ""} · {timeAgo(project.lastActivity)}
                  </span>
                </div>
              </Link>
            ))}

            {/* Carte d'ajout — verre vide, un + centré, jamais de
                pointillés */}
            {COMING_SOON ? (
              <span
                title="Disponible prochainement"
                aria-disabled
                className="nv-card relative flex min-h-[150px] cursor-default flex-col items-center justify-center gap-3 text-mist opacity-55"
              >
                <span className="nv-badge-soon absolute right-3 top-3">À venir</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)]">
                  <Plus size={16} strokeWidth={1.5} />
                </span>
                <span className="text-[13px] font-medium">Nouveau projet</span>
              </span>
            ) : (
              <Link
                href="/dashboard/projects/new"
                className="nv-card nv-card--lift group flex min-h-[150px] flex-col items-center justify-center gap-3 text-mist hover:text-ink"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] transition-colors duration-200 group-hover:border-[rgba(184,161,232,0.5)]">
                  <Plus size={16} strokeWidth={1.5} />
                </span>
                <span className="text-[13px] font-medium">Nouveau projet</span>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Activité */}
      <section className="mt-14">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">Activité récente</h2>
          <span className="pv-label--dim pv-label">Synchronisée en direct</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="nv-card relative overflow-hidden px-6 py-12 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(184,161,232,0.12),transparent_70%)]"
            />
            <p className="text-lg font-semibold text-ink/85">Le registre est encore vierge.</p>
            <p className="mt-3 font-mono text-xs tracking-[0.06em] text-mist">
              Créez un projet et lancez votre première génération.
            </p>
          </div>
        ) : (
          <ul className="nv-card px-2">
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
  );
}
