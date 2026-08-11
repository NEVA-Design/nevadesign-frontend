const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 30;
const MAX_TEXT_LENGTH = 8_000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

const buckets = new Map<string, { count: number; resetAt: number }>();

export type UploadedImageInput = {
  data?: unknown;
  mimeType?: unknown;
};

export function sanitizeText(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\u0000/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLength);
}

export function validateUploadedImage(
  image: UploadedImageInput | null | undefined,
  label = "image"
): { ok: true; image: { data: string; mimeType: string }; bytes: number } | { ok: false; error: string } {
  if (!image || typeof image.data !== "string" || typeof image.mimeType !== "string") {
    return { ok: false, error: `${label}_required` };
  }

  if (!ALLOWED_IMAGE_MIME.has(image.mimeType)) {
    return { ok: false, error: `${label}_unsupported_type` };
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)) {
    return { ok: false, error: `${label}_invalid_data` };
  }

  const bytes = Math.floor((image.data.length * 3) / 4);
  if (bytes <= 0 || bytes > MAX_IMAGE_BYTES) {
    return { ok: false, error: `${label}_too_large` };
  }

  return { ok: true, image: { data: image.data, mimeType: image.mimeType }, bytes };
}

export function validateUploadedImages(
  images: UploadedImageInput[],
  maxCount: number
): { ok: true; images: Array<{ data: string; mimeType: string }> } | { ok: false; error: string } {
  if (images.length > maxCount) return { ok: false, error: "too_many_images" };

  const safeImages: Array<{ data: string; mimeType: string }> = [];
  for (const [index, image] of images.entries()) {
    const validated = validateUploadedImage(image, `image_${index + 1}`);
    if (!validated.ok) return validated;
    safeImages.push(validated.image);
  }

  return { ok: true, images: safeImages };
}

export function checkRateLimit(key: string, limit = DEFAULT_LIMIT) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: limit - 1, resetAt: now + WINDOW_MS };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { ok: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function hasPromptInjectionRisk(text: string) {
  const normalized = text.toLowerCase();
  return [
    "ignore previous instructions",
    "ignore all previous",
    "system prompt",
    "developer message",
    "reveal your instructions",
    "bypass",
    "jailbreak",
    "prompt injection",
  ].some((needle) => normalized.includes(needle));
}

export function securityLog(event: string, details: Record<string, string | number | boolean | undefined>) {
  console.warn("[security]", event, {
    ...details,
    at: new Date().toISOString(),
  });
}

function userMessageForError(code: string, status: number) {
  if (status === 413 || code.includes("too_large")) {
    return "Ton image est trop lourde. Compresse-la ou utilise une image plus légère.";
  }
  if (code.includes("unsupported_type")) {
    return "Format non supporté. Utilise PNG, JPG ou WEBP.";
  }
  if (code === "insufficient_credits") {
    return "Créations disponibles insuffisantes. Recharge dans Billing.";
  }
  if (code === "rate_limited") {
    return "Trop de demandes en même temps. Attends quelques secondes puis réessaie.";
  }
  if (status >= 500) {
    return "La génération a échoué. Aucune création n’a été utilisée.";
  }
  return "Requête invalide. Vérifie les informations envoyées puis réessaie.";
}

export function jsonError(error: string, status: number, message = userMessageForError(error, status)) {
  return Response.json(
    {
      success: false,
      error: { code: error, message },
      code: error,
      message,
    },
    { status }
  );
}
