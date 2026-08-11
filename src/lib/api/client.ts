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
    return "Ton image est trop lourde. Compresse-la ou utilise une image plus légère.";
  }
  if (normalized.includes("unsupported_type") || normalized.includes("format")) {
    return "Format non supporté. Utilise PNG, JPG ou WEBP.";
  }
  if (normalized.includes("insufficient_credits")) {
    return "Créations disponibles insuffisantes. Recharge dans Billing.";
  }
  if (status === 429 || normalized.includes("rate_limited")) {
    return "Trop de demandes en même temps. Attends quelques secondes puis réessaie.";
  }
  if (status >= 500) {
    return "La génération a échoué. Aucune création n’a été utilisée.";
  }

  return "Une erreur est survenue. Réessaie avec un fichier plus léger ou un prompt plus simple.";
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
    const code =
      typeof error === "string"
        ? error
        : error?.code ?? payload?.code;
    const message =
      typeof error === "object" && error?.message
        ? error.message
        : payload?.message;

    throw new Error(message ?? messageFor(code, response.status, text));
  }

  if (!parsed) {
    throw new Error("Réponse serveur invalide. Réessaie dans un instant.");
  }

  const payload = parsed as { success?: boolean; data?: T; error?: ApiErrorPayload["error"] };
  if (payload.success === false) {
    const error = payload.error;
    throw new Error(
      typeof error === "object" && error?.message
        ? error.message
        : messageFor(typeof error === "string" ? error : error?.code, response.status, text)
    );
  }

  return (payload.success === true && "data" in payload ? payload.data : parsed) as T;
}
