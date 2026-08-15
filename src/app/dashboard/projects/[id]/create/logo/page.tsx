import { notFound, redirect } from "next/navigation";
import { backendGetJson } from "@/lib/api/backend-server";
import LogoWizard from "./LogoWizard";

export const dynamic = "force-dynamic";

type ProjectDetail = {
  project: {
    id: string;
    name: string;
    ambiance: { chips?: string[] };
    logo_master: { url: string } | null;
  };
};

export default async function LogoWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await backendGetJson<ProjectDetail>(`/projects/${id}`);
  if (!detail?.project) {
    const me = await backendGetJson<{ id: string }>("/me");
    if (!me) redirect("/login");
    notFound();
  }
  if (detail!.project.logo_master?.url) {
    // Le logo ne se régénère pas — retour au projet
    redirect(`/dashboard/projects/${id}`);
  }

  return (
    <LogoWizard
      projectId={detail!.project.id}
      projectName={detail!.project.name}
      ambianceChips={detail!.project.ambiance?.chips ?? []}
    />
  );
}
