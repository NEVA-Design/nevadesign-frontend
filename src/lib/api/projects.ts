"use client";

import { backendFetch } from "@/lib/api/backend-client";

// Types et helpers du modèle « Projet » (run 5) — miroir des routes
// /projects du backend. Le projet porte la DA complète d'un serveur ;
// tout asset créé dedans en hérite.

export type ProjectAmbiance = {
  universe: string;
  chips: string[];
  references: string[];
};

export type LogoMaster = {
  url: string;
  whiteUrl: string | null;
  blackUrl: string | null;
  width: number;
  height: number;
} | null;

export type Project = {
  id: string;
  name: string;
  sector: string;
  ambiance: ProjectAmbiance;
  palette: string[];
  logo_master: LogoMaster;
  created_at: string;
  updated_at: string;
  assetCount?: number;
  lastActivity?: string;
};

export type { AssetCategory } from "@/lib/projects-shared";
import type { AssetCategory } from "@/lib/projects-shared";

export type ProjectAsset = {
  id: string;
  project_id: string;
  category: AssetCategory;
  title: string | null;
  status: "draft" | "ready" | "exported";
  width: number;
  height: number;
  layers: unknown[];
  wizard_answers: Record<string, unknown>;
  retouches_used: number;
  preview_url: string | null;
  exports: Array<{ url: string; resolution: string; at: string }>;
  created_at: string;
  updated_at: string;
};

export async function createProject(input: {
  name: string;
  sector: string;
  ambiance: ProjectAmbiance;
  palette: string[];
}): Promise<Project> {
  const res = await backendFetch("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? "La création du projet a échoué.");
  return json.project as Project;
}

export async function createAsset(
  projectId: string,
  input: {
    category: AssetCategory;
    title?: string;
    width: number;
    height: number;
    wizard_answers?: Record<string, unknown>;
  }
): Promise<ProjectAsset> {
  const res = await backendFetch(`/projects/${projectId}/assets`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? "La création a échoué.");
  return json.asset as ProjectAsset;
}

export async function saveAsset(
  projectId: string,
  assetId: string,
  patch: Partial<Pick<ProjectAsset, "title" | "layers" | "status" | "preview_url" | "width" | "height">>
): Promise<ProjectAsset> {
  const res = await backendFetch(`/projects/${projectId}/assets/${assetId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? "La sauvegarde a échoué.");
  return json.asset as ProjectAsset;
}
