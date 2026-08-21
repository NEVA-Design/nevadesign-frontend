import { notFound, redirect } from "next/navigation";
import { backendGetJson } from "@/lib/api/backend-server";
import { BANNIERES_IA_SOON } from "@/lib/feature-flags";
import { CATEGORY_SPECS, type AssetCategory } from "@/lib/projects-shared";
import SceneWizard from "./SceneWizard";

export const dynamic = "force-dynamic";

const SCENE_CATEGORIES: AssetCategory[] = [
  "banniere_discord",
  "banniere_fivem",
  "banniere_f5",
  "affiche",
  "wallpaper",
  "loading_screen",
  "icon",
  "libre",
];

type ProjectDetail = {
  project: {
    id: string;
    name: string;
    logo_master: { url: string } | null;
  };
};

export default async function SceneWizardPage({
  params,
}: {
  params: Promise<{ id: string; category: string }>;
}) {
  const { id, category } = await params;
  if (!SCENE_CATEGORIES.includes(category as AssetCategory) || !(category in CATEGORY_SPECS)) {
    notFound();
  }
  // Décision 21/08 : formats scène « Très prochainement » — les URL
  // directes retombent sur le hub du projet.
  if (BANNIERES_IA_SOON) {
    redirect(`/dashboard/projects/${id}/create`);
  }

  const detail = await backendGetJson<ProjectDetail>(`/projects/${id}`);
  if (!detail?.project) {
    const me = await backendGetJson<{ id: string }>("/me");
    if (!me) redirect("/login");
    notFound();
  }
  if (!detail!.project.logo_master?.url) {
    // Le logo d'abord — c'est la base de tout
    redirect(`/dashboard/projects/${id}/create/logo`);
  }

  return (
    <SceneWizard
      projectId={detail!.project.id}
      projectName={detail!.project.name}
      category={category as AssetCategory}
    />
  );
}
