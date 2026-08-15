"use client";

import { backendFetch } from "@/lib/api/backend-client";
import type { ProjectAsset } from "@/lib/api/projects";

// Helpers du moteur de génération (run 5) — miroir des routes /engine.

export type LogoWizardAnswers = {
  type: "lettre" | "nom" | "embleme";
  style: "chrome" | "graffiti" | "luxe" | "neon" | "cartoon" | "minimal";
  palette: string[];
};

export type SceneWizardAnswers = {
  templateId?: string;
  lieu?: string;
  personnages?: string;
  moment?: string;
  props?: string;
};

export type SceneTemplateInfo = {
  id: string;
  titre: string;
  scene_type: string;
  personnages: number;
};

async function parseOrThrow<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message ?? json?.error?.message ?? "La génération a échoué.");
  }
  return json as T;
}

export async function fetchSceneTemplates(): Promise<SceneTemplateInfo[]> {
  const res = await backendFetch("/engine/templates");
  const json = await parseOrThrow<{ templates: SceneTemplateInfo[] }>(res);
  return json.templates;
}

export async function generateLogoProposals(input: {
  projectId: string;
  assetId?: string;
  answers: LogoWizardAnswers;
}): Promise<{ assetId: string; proposals: string[]; retouchesUsed: number; includedRetouches: number; creditCharged: number }> {
  const res = await backendFetch("/engine/logo/proposals", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function finalizeLogoMaster(input: {
  projectId: string;
  assetId: string;
  chosenUrl: string;
}): Promise<{ logoMaster: { url: string; whiteUrl: string; blackUrl: string }; remaining: number }> {
  const res = await backendFetch("/engine/logo/master", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function generateScene(input: {
  projectId: string;
  category: string;
  title?: string;
  answers: SceneWizardAnswers;
}): Promise<{ asset: ProjectAsset; retried: boolean }> {
  const res = await backendFetch("/engine/scene", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function regenerateScene(input: {
  projectId: string;
  assetId: string;
  answers?: SceneWizardAnswers;
  keepComposition?: boolean;
}): Promise<{ asset: ProjectAsset; retouchesUsed: number; includedRetouches: number; creditCharged: number; retried: boolean }> {
  const res = await backendFetch("/engine/scene/regenerate", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function exportAsset(input: {
  projectId: string;
  assetId: string;
}): Promise<{ url: string; resolution: string; remaining: number; creditCharged: number }> {
  const res = await backendFetch("/engine/export", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}
