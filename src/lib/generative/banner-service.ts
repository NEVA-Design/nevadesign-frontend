// Stub du flux de génération des bannières Discord IA (formule 3B).
// AUCUN appel réseau ici : la fonction n'est appelée nulle part tant que le
// backend de génération n'est pas branché. Elle fixe seulement le contrat.

export interface BannerRequest {
  modelId: string;
  // Toujours actif : le nom saisi par l'utilisateur, rendu dans la bannière.
  name: string;
  // Optionnels selon les capacités du modèle (voir src/data/models.json).
  theme?: string;
  color?: string;
  extraTexts?: string[];
}

export interface BannerResult {
  url: string;
  width: 680;
  height: 240;
}

// À brancher plus tard sur le backend (nevadesign-backend). Ne pas appeler.
export async function generateBanner(_request: BannerRequest): Promise<BannerResult> {
  throw new Error("Neva Generative — flux de génération non branché (COMING_SOON).");
}
