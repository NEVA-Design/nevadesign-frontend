"use client";

import { backendFetch } from "@/lib/api/backend-client";
import type { ProjectAsset } from "@/lib/api/projects";

// Helpers du moteur de génération (run 5.2 → 5.4) — miroir des routes /engine.

// v4 (run 5.4) : la question « fond » a DISPARU de l'étape logo — l'étape A
// livre le logo seul (PNG alpha), le fond arrive à l'étape B (écran dédié).
export type LogoCouleursChoix =
  | { mode: "palette" }
  | { mode: "unie"; couleur: string }
  | { mode: "degrade"; couleurs: string[]; angle: number };

export type LogoWizardAnswers = {
  type: "lettre" | "nom" | "embleme";
  sujet: string;
  ambiance: "ete" | "sombre" | "luxe" | "neon" | "retro" | "propre" | null;
  couleurs: LogoCouleursChoix;
  interdits: string;
};

export type LogoConcept = {
  nom: string;
  justification: string;
  // traçabilité (run 5.4, LOT 5) : « "réponse du brief" → effet »
  citations: string[];
  rendu: "relief" | "plat";
  prompt: string;
};

export type LogoScores = { relief: number; glow: number };

export type LogoProposition = {
  url: string;
  concept: LogoConcept;
  ocrRejects: number;
  conceptOk: boolean;
  // contrôle ADN (run 5.4, LOT 3)
  adnOk: boolean;
  serveurLogo: boolean;
  lisible64: boolean;
  scores: LogoScores;
  defauts: string[];
  regenere: boolean;
};

// ── État de l'entraînement (run 5.4, LOT 0) — le badge du wizard ─────────────
export type TrainingStatus = {
  installed: boolean;
  adnActif: boolean;
  version: number | null;
  exemplarsLogo: number;
  referencesJointes: number;
  fondsBibliotheque: number;
  imagesAnalysees: number;
  imagesTotales: number;
  manques: string[];
};

export async function fetchTrainingStatus(): Promise<{ training: TrainingStatus; message: string }> {
  const res = await backendFetch("/engine/training-status");
  return parseOrThrow(res);
}

// ── Étape B (run 5.4, LOT 4) : les fonds du logo ─────────────────────────────
export type LogoFondChoix = "signature" | "atmospherique" | "scene";

export type LogoFondProposition = {
  fondUrl: string;
  previewUrl: string;
  choix: LogoFondChoix;
};

export type LogoScene = {
  fondUrl: string;
  carreUrl: string;
  banniereUrl: string;
  alphaUrl: string;
};

export async function generateLogoFonds(input: {
  projectId: string;
  assetId: string;
  choix: LogoFondChoix;
  ambianceScene?: string;
  count?: number;
}): Promise<{ fonds: LogoFondProposition[]; retouchesUsed: number; includedRetouches: number; creditCharged: number }> {
  const res = await backendFetch("/engine/logo/fond/proposals", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function applyLogoFond(input: {
  projectId: string;
  assetId: string;
  fondUrl: string;
}): Promise<{ logoScene: LogoScene }> {
  const res = await backendFetch("/engine/logo/fond/apply", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

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
