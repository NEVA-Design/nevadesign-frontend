import OpenAI, { toFile } from "openai";
import { getModuleContract } from "@/lib/ai/orchestrator";
import {
  checkRateLimit,
  hasPromptInjectionRisk,
  jsonError,
  sanitizeText,
  securityLog,
  validateUploadedImage,
} from "@/lib/api/security";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits";
import { buildNevaBrainContext } from "@/lib/neva-brain";
import { applyWatermarkToImage, userNeedsWatermark } from "@/lib/image-postprocess";

export const maxDuration = 60;

type SourceImage = { data: string; mimeType: string };
type CharacterAssetType =
  | "rp_identity_card"
  | "passport"
  | "driver_license"
  | "criminal_record"
  | "police_file"
  | "employee_file"
  | "business_profile"
  | "character_poster"
  | "studio_portrait";

const CHARACTER_COST = 2;

const ASSET_LABELS: Record<CharacterAssetType, string> = {
  rp_identity_card: "FiveM RP identity card",
  passport: "fictional FiveM RP passport prop",
  driver_license: "fictional FiveM RP driver license prop",
  criminal_record: "FiveM RP criminal record file",
  police_file: "FiveM RP police case file",
  employee_file: "FiveM RP employee file",
  business_profile: "FiveM RP business profile",
  character_poster: "FiveM character poster",
  studio_portrait: "FiveM studio portrait",
};

const ASSET_TYPES = Object.keys(ASSET_LABELS) as CharacterAssetType[];

let _openai: OpenAI | null = null;
function openai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

function isAssetType(value: unknown): value is CharacterAssetType {
  return typeof value === "string" && ASSET_TYPES.includes(value as CharacterAssetType);
}

function aspectForAsset(assetType: CharacterAssetType): "1024x1024" | "1536x1024" | "1024x1536" {
  if (assetType === "character_poster" || assetType === "studio_portrait") return "1024x1536";
  if (assetType === "business_profile" || assetType === "police_file" || assetType === "employee_file") return "1536x1024";
  return "1536x1024";
}

async function imageToUpload(sourceImage: SourceImage) {
  const ext = sourceImage.mimeType.includes("png")
    ? "png"
    : sourceImage.mimeType.includes("webp")
    ? "webp"
    : "jpg";

  return toFile(
    Buffer.from(sourceImage.data, "base64"),
    `neva-character-reference.${ext}`,
    { type: sourceImage.mimeType }
  );
}

function buildPrompt(input: {
  assetType: CharacterAssetType;
  characterName?: string;
  role?: string;
  organization?: string;
  city?: string;
  notes?: string;
}) {
  const brainContext = buildNevaBrainContext("character");
  const label = ASSET_LABELS[input.assetType];
  const details = [
    input.characterName ? `Character name: ${input.characterName}` : null,
    input.role ? `Role/job: ${input.role}` : null,
    input.organization ? `Organization/business/faction: ${input.organization}` : null,
    input.city ? `City/server: ${input.city}` : null,
    input.notes ? `Extra notes: ${input.notes}` : null,
  ].filter(Boolean).join(". ");

  return `Use my uploaded character as the hero subject. Preserve the exact face, facial structure, skin tone, hairstyle, facial hair, tattoos, jewelry, body proportions, outfit silhouette, and recognizable accessories. Do not redesign, beautify, age, swap, or change the character identity.

Create a premium ${label} for a fictional FiveM roleplay universe. This is an in-universe RP creative asset, not a real official document. Avoid real government seals, real official logos, scannable barcodes, QR codes, or anything that could be mistaken for a real identity document.

Neva Brain:
${brainContext}

Production direction: premium FiveM / GTA RP design, senior Photoshop designer finish, strong visual hierarchy, clean typography zones, believable Los Santos roleplay tone, polished lighting, subtle depth, controlled color grading, marketing-quality composition.

Premium restraint rules: keep the layout clean and expensive-looking. Do not overload with glow, particles, smoke, lens flares, neon, cyberpunk colors, plastic HDR, fake official seals, or decorative clutter. Use effects only as quiet accents. The character must remain the most readable and recognizable element.

Design quality checklist: one clear focal point, readable face, clean document/poster hierarchy, 2-3 color palette, generous spacing, premium contrast, FiveM-authentic GTA RP atmosphere, no generic stock-photo realism.

User details: ${details || "No extra details provided. Make it professional and FiveM-authentic."}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("unauthorized", 401, "Connecte-toi pour générer un dossier RP.");
    const contract = getModuleContract("character");
    const rate = checkRateLimit(`character:${user.id}`, contract.rateLimitPerMinute);
    if (!rate.ok) {
      securityLog("rate_limited", { userId: user.id, module: "character" });
      return jsonError("rate_limited", 429);
    }

    const body = await request.json() as {
      sourceImage?: SourceImage | null;
      assetType?: string;
      characterName?: string;
      role?: string;
      organization?: string;
      city?: string;
      notes?: string;
    };

    const validatedSource = validateUploadedImage(body.sourceImage, "character_image");
    if (!validatedSource.ok) return jsonError(validatedSource.error, 400);

    const assetType = isAssetType(body.assetType) ? body.assetType : "character_poster";
    const safeFields = {
      characterName: sanitizeText(body.characterName, 80),
      role: sanitizeText(body.role, 120),
      organization: sanitizeText(body.organization, 120),
      city: sanitizeText(body.city, 120),
      notes: sanitizeText(body.notes, contract.maxInputChars),
    };
    if (Object.values(safeFields).some(hasPromptInjectionRisk)) {
      securityLog("prompt_injection_signal", { userId: user.id, module: "character" });
    }
    const prompt = buildPrompt({
      assetType,
      ...safeFields,
    });

    const response = await openai().images.edit({
      model: "gpt-image-1",
      image: await imageToUpload(validatedSource.image),
      prompt,
      size: aspectForAsset(assetType),
      quality: "high",
      input_fidelity: "high",
      n: 1,
      output_format: "webp",
      output_compression: 90,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No character asset returned");

    const deduction = await deductCredits(
      user.id,
      CHARACTER_COST,
      "character_asset",
      `Neva Character - ${ASSET_LABELS[assetType]}`
    );

    if (!deduction.success) {
      return Response.json({
        success: false,
        error: { code: "insufficient_credits", message: "Créations disponibles insuffisantes. Recharge dans Billing." },
        remaining: deduction.remaining,
      }, { status: 402 });
    }

    const cleanImage = `data:image/webp;base64,${b64}`;
    const watermarkEnabled = await userNeedsWatermark(supabase, user.id);
    const finalImage = watermarkEnabled ? await applyWatermarkToImage(cleanImage) : cleanImage;

    return Response.json({
      success: true,
      data: {
        image: finalImage,
        assetType,
        prompt,
        creditsUsed: CHARACTER_COST,
        watermarkEnabled,
      },
      image: finalImage,
      assetType,
      prompt,
      creditsUsed: CHARACTER_COST,
      watermarkEnabled,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("[character-assets]", e);
    return jsonError("generation_failed", 500, "La génération a échoué. Aucune création n’a été utilisée.");
  }
}
