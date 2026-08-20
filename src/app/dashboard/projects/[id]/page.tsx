import { ArrowLeft, ArrowRight, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { backendGetJson } from "@/lib/api/backend-server";
import { COMING_SOON } from "@/lib/feature-flags";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type AssetCategory,
} from "@/lib/projects-shared";

// Force le rendu à la requête : dépend du cookie de session.
export const dynamic = "force-dynamic";

type ProjectDetail = {
  project: {
    id: string;
    name: string;
    sector: string;
    ambiance: { universe?: string; chips?: string[]; references?: string[] };
    palette: string[];
    logo_master: { url: string; whiteUrl: string | null; blackUrl: string | null } | null;
    created_at: string;
  };
  assets: Array<{
    id: string;
    category: AssetCategory;
    title: string | null;
    status: "draft" | "ready" | "exported";
    width: number;
    height: number;
    preview_url: string | null;
    retouches_used: number;
    updated_at: string;
  }>;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "text-steel border-[color:var(--hairline-strong)]" },
  ready: { label: "Prête", className: "text-[#6FBF9F] border-[rgba(111,191,159,0.40)]" },
  exported: { label: "Exportée", className: "text-[color:var(--num-color)] border-[rgba(184,161,232,0.4)]" },
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

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await backendGetJson<ProjectDetail>(`/projects/${id}`);
  if (!detail?.project) {
    const me = await backendGetJson<{ id: string }>("/me");
    if (!me) redirect("/login");
    notFound();
  }

  const { project, assets } = detail;
  const hasLogo = Boolean(project.logo_master?.url);
  const chips = project.ambiance?.chips ?? [];
  const universe = project.ambiance?.universe ?? "";

  const byCategory = new Map<AssetCategory, ProjectDetail["assets"]>();
  for (const asset of assets) {
    const list = byCategory.get(asset.category) ?? [];
    list.push(asset);
    byCategory.set(asset.category, list);
  }
  const categoriesWithAssets = CATEGORY_ORDER.filter((c) => byCategory.has(c));

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[13px] text-steel transition-colors hover:bg-ink/[0.04] hover:text-ink"
      >
        <ArrowLeft size={14} />
        Projets
      </Link>

      {/* En-tête projet — la DA du serveur en un regard */}
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-5">
          {/* Le logo exporté, présenté comme une pièce : un radial
              aurore discret derrière, une ombre portée douce */}
          <span className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_24px_48px_rgba(0,0,0,0.5)]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 45%, rgba(184,161,232,0.06), transparent 70%)",
              }}
            />
            {project.logo_master?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.logo_master.url}
                alt=""
                className="relative h-full w-full object-contain p-2.5"
              />
            ) : (
              <span className="pv-display relative text-2xl text-ink">{project.name.slice(0, 2).toUpperCase()}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="pv-label text-[color:var(--num-color)]">Projet FiveM</p>
            <h1 className="pv-display mt-2 text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight text-ink">
              {project.name}
            </h1>
            {universe ? (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-steel">{universe}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[color:var(--hairline-strong)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-steel"
                >
                  {chip}
                </span>
              ))}
              {project.palette.length > 0 ? (
                <span className="nv-swatches ml-1" aria-hidden>
                  {project.palette.slice(0, 5).map((color, i) => (
                    <span key={`${color}-${i}`} style={{ background: color }} />
                  ))}
                </span>
              ) : null}
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-mist">
              {assets.length} création{assets.length > 1 ? "s" : ""} · projet créé {timeAgo(project.created_at)}
            </p>
          </div>
        </div>

        {hasLogo ? (
          COMING_SOON ? (
            <span
              title="Disponible prochainement"
              aria-disabled
              className="inline-flex h-11 shrink-0 cursor-default items-center justify-center gap-2.5 rounded-[14px] border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-ink opacity-55 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
            >
              <Plus size={15} strokeWidth={1.5} />
              Nouvelle création
              <span className="nv-badge-soon">À venir</span>
            </span>
          ) : (
            <Link href={`/dashboard/projects/${project.id}/create`} className="pv-btn shrink-0">
              <Plus size={15} strokeWidth={1.5} />
              Nouvelle création
            </Link>
          )
        ) : null}
      </div>

      {/* Étape 1 obligatoire — le logo */}
      {!hasLogo ? (
        <section className="nv-card relative mt-10 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-10 h-56 w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(184,161,232,0.16),transparent_70%)]"
          />
          <div className="relative flex flex-col gap-6 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="pv-label text-[color:var(--num-color)]">Étape 1 — la base de tout</p>
              <h2 className="pv-display mt-3 text-[clamp(1.4rem,2.4vw,2rem)] leading-tight text-ink">
                Créez le logo de {project.name}.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">
                Trois questions, trois propositions, un master 4K détouré. Ensuite, chaque
                bannière et chaque affiche du projet l&apos;intègre automatiquement — il n&apos;est
                jamais régénéré, toujours composé.
              </p>
            </div>
            {COMING_SOON ? (
              <span
                title="Disponible prochainement"
                aria-disabled
                className="inline-flex h-12 shrink-0 cursor-default items-center justify-center gap-2.5 rounded-[14px] border border-white/[0.12] bg-white/[0.04] px-6 text-sm font-medium text-ink opacity-55 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
              >
                <Sparkles size={15} strokeWidth={1.5} />
                Créer le logo
                <span className="nv-badge-soon">À venir</span>
              </span>
            ) : (
              <Link href={`/dashboard/projects/${project.id}/create/logo`} className="pv-btn shrink-0">
                <Sparkles size={15} strokeWidth={1.5} />
                Créer le logo
              </Link>
            )}
          </div>
        </section>
      ) : null}

      {/* Créations par catégorie */}
      {categoriesWithAssets.length === 0 ? (
        hasLogo ? (
          <div className="nv-card relative mt-12 overflow-hidden px-6 py-14 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(184,161,232,0.12),transparent_70%)]"
            />
            <p className="text-lg font-semibold text-ink/85">Le logo est en place — à vous de jouer.</p>
            <p className="mt-3 font-mono text-xs tracking-[0.06em] text-mist">
              Lancez votre première bannière depuis « Nouvelle création ».
            </p>
          </div>
        ) : null
      ) : (
        <div className="mt-12 flex flex-col gap-10">
          {categoriesWithAssets.map((category) => {
            const list = byCategory.get(category)!;
            return (
              <section key={category}>
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <span className="font-mono text-[10px] tracking-[0.12em] text-dusk">
                    {list.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((asset) => {
                    const status = STATUS_LABELS[asset.status] ?? STATUS_LABELS.draft;
                    return (
                      <Link
                        key={asset.id}
                        href={`/dashboard/projects/${project.id}/assets/${asset.id}`}
                        className="group"
                      >
                        <div
                          className="relative overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss transition-colors duration-500 group-hover:border-[rgba(184,161,232,0.45)]"
                          style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
                        >
                          {asset.preview_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.preview_url}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                            />
                          ) : (
                            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                              <span aria-hidden className="pv-display text-lg text-mist">—</span>
                              <span className="nv-badge-soon">Bientôt</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-2.5 flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-[13px] text-ink/85">
                            {asset.title ?? CATEGORY_LABELS[asset.category]}
                          </span>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-dusk">{timeAgo(asset.updated_at)}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
