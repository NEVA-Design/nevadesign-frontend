"use client";

export type ApiErrorPayload = {
  success?: false;
  error?: string | { code?: string; message?: string };
  code?: string;
  message?: string;
  remaining?: number;
};

function messageFor(code: string | undefined, status: number, rawText: string) {
  const normalized = `${code ?? ""} ${rawText}`.toLowerCase();

  if (status === 413 || normalized.includes("request entity too large") || normalized.includes("too_large")) {
    return "Votre image est trop lourde. Compressez-la ou utilisez un fichier plus léger.";
  }
  if (normalized.includes("unsupported_type") || normalized.includes("format")) {
    return "Format non pris en charge. Utilisez PNG, JPG ou WEBP.";
  }
  if (normalized.includes("insufficient_credits")) {
    return "Créations disponibles insuffisantes. Rechargez depuis l'espace Abonnement.";
  }
  if (status === 429 || normalized.includes("rate_limited")) {
    return "Trop de demandes en même temps. Patientez quelques secondes puis réessayez.";
  }
  if (status >= 500) {
    return "La génération a échoué. Aucune création n'a été décomptée.";
  }

  return "Une erreur est survenue. Réessayez avec un fichier plus léger ou un brief plus simple.";
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let parsed: ApiErrorPayload | T | null = null;

  if (text.trim()) {
    try {
      parsed = JSON.parse(text) as ApiErrorPayload | T;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const payload = parsed as ApiErrorPayload | null;
    const error = payload?.error;
    const code = typeof error === "object" ? error?.code : payload?.code;
    const message =
      typeof error === "string"
        ? error
        : error?.message ?? payload?.message;

    throw new Error(message ?? messageFor(code, response.status, text));
  }

  if (!parsed) {
    throw new Error("Réponse serveur invalide. Réessayez dans un instant.");
  }

  const payload = parsed as { success?: boolean; data?: T; error?: ApiErrorPayload["error"] };
  if (payload.success === false) {
    const error = payload.error;
    const message = typeof error === "string" ? error : error?.message;
    const code = typeof error === "object" ? error?.code : undefined;
    throw new Error(message ?? messageFor(code, response.status, text));
  }

  return (payload.success === true && "data" in payload ? payload.data : parsed) as T;
}
