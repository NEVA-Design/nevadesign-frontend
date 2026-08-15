import { notFound, redirect } from "next/navigation";
import { backendGetJson } from "@/lib/api/backend-server";
import type { Layer } from "@/lib/projects-shared";
import AssetEditor from "./AssetEditor";

export const dynamic = "force-dynamic";

type AssetDetail = {
  asset: {
    id: string;
    project_id: string;
    category: string;
    title: string | null;
    status: string;
    width: number;
    height: number;
    layers: Layer[];
    retouches_used: number;
    exports: Array<{ url: string; resolution: string; at: string }>;
  };
};

type ProjectDetail = {
  project: {
    id: string;
    name: string;
    logo_master: { url: string; whiteUrl: string | null; blackUrl: string | null } | null;
  };
};

export default async function AssetEditorPage({
  params,
}: {
  params: Promise<{ id: string; assetId: string }>;
}) {
  const { id, assetId } = await params;
  const [detail, assetDetail] = await Promise.all([
    backendGetJson<ProjectDetail>(`/projects/${id}`),
    backendGetJson<AssetDetail>(`/projects/${id}/assets/${assetId}`),
  ]);

  if (!detail?.project || !assetDetail?.asset) {
    const me = await backendGetJson<{ id: string }>("/me");
    if (!me) redirect("/login");
    notFound();
  }

  return (
    <AssetEditor
      project={detail!.project}
      initialAsset={assetDetail!.asset}
    />
  );
}
