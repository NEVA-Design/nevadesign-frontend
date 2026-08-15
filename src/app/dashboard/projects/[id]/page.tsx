import { ArrowLeft, ArrowRight, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { backendGetJson } from "@/lib/api/backend-server";
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
  ready: { label: "Prête", className: "text-[#3D7A58] border-[rgba(61,122,88,0.35)]" },
  exported: { label: "Exportée", className: "text-[color:var(--num-color)] border-[rgba(164,139,232,0.4)]" },
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
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-ink shadow-[0_12px_32px_rgba(43,36,80,0.25)]">
            {project.logo_master?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.logo_master.url} alt="" className="h-full w-full object-contain p-2" />
            ) : (
              <span className="pv-display text-2xl text-white">{project.name.slice(0, 2).toUpperCase()}</span>
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
                <span className="ml-1 inline-flex h-5 items-center gap-1">
                  {project.palette.slice(0, 6).map((color, i) => (
                    <span
                      key={`${color}-${i}`}
                      className="h-3.5 w-3.5 rounded-full border border-white/60 shadow-[0_1px_3px_rgba(43,36,80,0.25)]"
                      style={{ background: color }}
                    />
                  ))}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {hasLogo ? (
          <Link href={`/dashboard/projects/${project.id}/create`} className="shrink-0">
            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] transition-colors hover:bg-[#35305E]">
              <Plus size={15} />
              Nouvelle création
            </span>
          </Link>
        ) : null}
      </div>

      {/* Étape 1 obligatoire — le logo */}
      {!hasLogo ? (
        <section className="pv-glass pv-edge relative mt-10 overflow-hidden rounded-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-10 h-56 w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(164,139,232,0.16),transparent_70%)]"
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
            <Link href={`/dashboard/projects/${project.id}/create/logo`} className="shrink-0">
              <span className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] transition-colors hover:bg-[#35305E]">
                <Sparkles size={15} />
                Créer le logo
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {/* Créations par catégorie */}
      {categoriesWithAssets.length === 0 ? (
        hasLogo ? (
          <div className="mt-12 rounded-xl border border-dashed border-[color:var(--hairline-strong)] px-6 py-14 text-center">
            <p className="text-lg font-semibold text-ink/85">Le logo est en place — à vous de jouer.</p>
            <p className="mt-3 font-mono text-xs tracking-[0.06em] text-dusk">
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
                          className="relative overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss transition-colors duration-500 group-hover:border-[rgba(164,139,232,0.45)]"
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
                            <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                              {asset.width} × {asset.height}
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
