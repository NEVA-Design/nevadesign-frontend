import { ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { backendGetJson } from "@/lib/api/backend-server";
import {
  CATEGORY_LABELS,
  CATEGORY_SPECS,
  type AssetCategory,
} from "@/lib/projects-shared";

export const dynamic = "force-dynamic";

// Les catégories proposées dans le hub (l'ordre est éditorial : les
// formats les plus demandés d'abord). « libre » reste hors hub.
const HUB_CATEGORIES: AssetCategory[] = [
  "logo",
  "banniere_discord",
  "banniere_fivem",
  "affiche",
  "wallpaper",
  "loading_screen",
  "banniere_f5",
  "icon",
];

type ProjectDetail = {
  project: {
    id: string;
    name: string;
    logo_master: { url: string } | null;
  };
};

// La forme du format, dessinée à l'échelle réelle dans une boîte fixe :
// l'utilisateur voit la proportion, pas un « 16:9 » abstrait.
function FormatShape({ category }: { category: AssetCategory }) {
  const spec = CATEGORY_SPECS[category];
  const ratio = spec.width / spec.height;
  // Boîte 120×72 : on inscrit le rectangle dedans
  const boxW = 120;
  const boxH = 72;
  let w = boxW;
  let h = boxW / ratio;
  if (h > boxH) {
    h = boxH;
    w = boxH * ratio;
  }
  return (
    <span className="flex h-[72px] w-[120px] items-center justify-center" aria-hidden>
      <span
        className="rounded-[4px] border border-[rgba(164,139,232,0.55)] bg-[linear-gradient(135deg,rgba(164,139,232,0.16),rgba(124,107,212,0.06))] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
        style={{ width: `${w}px`, height: `${Math.max(h, 8)}px` }}
      />
    </span>
  );
}

export default async function CreateHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await backendGetJson<ProjectDetail>(`/projects/${id}`);
  if (!detail?.project) {
    const me = await backendGetJson<{ id: string }>("/me");
    if (!me) redirect("/login");
    notFound();
  }

  const project = detail!.project;
  const hasLogo = Boolean(project.logo_master?.url);

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[13px] text-steel transition-colors hover:bg-ink/[0.04] hover:text-ink"
      >
        <ArrowLeft size={14} />
        {project.name}
      </Link>

      <div className="mt-6">
        <p className="pv-label text-[color:var(--num-color)]">Nouvelle création</p>
        <h1 className="pv-display mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] leading-tight text-ink">
          Que crée-t-on aujourd&apos;hui&nbsp;?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
          {hasLogo
            ? "Chaque format hérite du logo master, de la palette et de l'ambiance du projet."
            : "Le logo d'abord : c'est lui qui signe tous les autres formats."}
        </p>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        {HUB_CATEGORIES.map((category) => {
          const spec = CATEGORY_SPECS[category];
          const isLogo = category === "logo";
          const logoDone = isLogo && hasLogo;
          const locked = !isLogo && !hasLogo;

          const card = (
            <div
              className={
                locked || logoDone
                  ? "flex items-center gap-5 rounded-2xl border border-[color:var(--hairline)] bg-white/40 p-5"
                  : "pv-glass pv-edge pv-ignite group flex items-center gap-5 rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(164,139,232,0.5)]"
              }
            >
              <FormatShape category={category} />
              <div className="min-w-0 flex-1">
                <span className={`block text-[15px] font-medium ${locked ? "text-mist" : "text-ink"}`}>
                  {CATEGORY_LABELS[category]}
                </span>
                <span className={`mt-1 block text-xs leading-relaxed ${locked ? "text-mist" : "text-steel"}`}>
                  {spec.usage}
                </span>
                <span className={`mt-2 block font-mono text-[10px] tracking-[0.1em] ${locked ? "text-mist" : "text-dusk"}`}>
                  {spec.width} × {spec.height} px
                </span>
              </div>
              {logoDone ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(61,122,88,0.4)] text-[#3D7A58]">
                  <Check size={14} />
                </span>
              ) : locked ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] text-mist">
                  <Lock size={13} />
                </span>
              ) : null}
            </div>
          );

          if (logoDone) {
            return (
              <div key={category} title="Le logo master est en place — il se compose, il ne se régénère pas.">
                {card}
              </div>
            );
          }
          if (locked) {
            return (
              <div key={category} title="Créez d'abord le logo du projet.">
                {card}
              </div>
            );
          }
          return (
            <Link key={category} href={`/dashboard/projects/${project.id}/create/${category}`}>
              {card}
            </Link>
          );
        })}
      </div>

      {!hasLogo ? (
        <p className="mt-6 font-mono text-[11px] tracking-[0.08em] text-dusk">
          Les autres formats se déverrouillent dès que le logo master est créé.
        </p>
      ) : null}
    </div>
  );
}
