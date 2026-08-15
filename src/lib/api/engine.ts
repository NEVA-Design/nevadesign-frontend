"use client";

import { backendFetch } from "@/lib/api/backend-client";
import type { ProjectAsset } from "@/lib/api/projects";

// Helpers du moteur de génération (run 5.2 → 5.3) — miroir des routes /engine.

// v3 (run 5.3) : le wizard pose ENFIN les bonnes questions — le sujet/thème,
// les couleurs libres (picker + dégradé), l'ambiance du logo, le fond, les
// interdits. Le brief part TEL QUEL au directeur artistique (étage 1).
export type LogoCouleursChoix =
  | { mode: "palette" }
  | { mode: "unie"; couleur: string }
  | { mode: "degrade"; couleurs: string[]; angle: number };

export type LogoWizardAnswers = {
  type: "lettre" | "nom" | "embleme";
  sujet: string;
  ambiance: "ete" | "sombre" | "luxe" | "neon" | "retro" | "propre" | null;
  couleurs: LogoCouleursChoix;
  fond: "transparent" | "plein" | "degrade_motifs";
  interdits: string;
};

export type LogoConcept = {
  nom: string;
  justification: string;
  prompt: string;
};

export type LogoProposition = {
  url: string;
  concept: LogoConcept;
  ocrRejects: number;
  conceptOk: boolean;
  defauts: string[];
  regenere: boolean;
};

export type SceneWizardAnswers = {
  templateId?: string;
  lieu?: string;
  personnages?: string;
  moment?: string;
  props?: string;
  // slogan optionnel généré sous le titre, épelé + OCR comme lui
  baseline?: string;
  // option pré-câblée : logo master intégré à la génération
  logoInScene?: boolean;
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
}): Promise<{
  assetId: string;
  propositions: LogoProposition[];
  proposals: string[];
  concepts: LogoConcept[];
  retouchesUsed: number;
  includedRetouches: number;
  creditCharged: number;
}> {
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

// Retouche par instruction courte (run 5.2) : « passe le titre en chrome »,
// « scène de nuit »… = 1 retouche du compteur.
export async function instructLayer(input: {
  projectId: string;
  assetId: string;
  instruction: string;
}): Promise<{ asset: ProjectAsset; retouchesUsed: number; includedRetouches: number; creditCharged: number; retried: boolean }> {
  const res = await backendFetch("/engine/layer/instruct", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

// Masque de gomme non destructive — stocké côté serveur, aucun débit.
export async function saveLayerMask(input: {
  projectId: string;
  assetId: string;
  layerId: string;
  mask: string;
}): Promise<{ maskUrl: string }> {
  const res = await backendFetch("/engine/mask", {
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
