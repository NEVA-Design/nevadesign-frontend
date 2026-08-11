import OpenAI, { toFile } from "openai";
import { getModuleContract } from "@/lib/ai/orchestrator";
import {
  checkRateLimit,
  jsonError,
  securityLog,
  validateUploadedImage,
} from "@/lib/api/security";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits";
import { buildNevaBrainContext } from "@/lib/neva-brain";
import { applyWatermarkToImage, userNeedsWatermark } from "@/lib/image-postprocess";

export const maxDuration = 60;

type SourceImage = { data: string; mimeType: string };
type AssetType = "poster" | "banner" | "logo" | "landing_page" | "social_media";
type ReportLanguage = "fr" | "en" | "es" | "de" | "it" | "pt" | "ar";

const AUDIT_COST = 1;
const IMPROVED_VERSION_COST = 2;
const ASSET_TYPES: AssetType[] = ["poster", "banner", "logo", "landing_page", "social_media"];
const REPORT_LANGUAGES: Record<ReportLanguage, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ar: "Arabic",
};

let _openai: OpenAI | null = null;
function openai() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

function isAssetType(value: unknown): value is AssetType {
  return typeof value === "string" && ASSET_TYPES.includes(value as AssetType);
}

function getReportLanguage(value: unknown): ReportLanguage {
  return typeof value === "string" && value in REPORT_LANGUAGES ? value as ReportLanguage : "fr";
}

async function imageToUpload(sourceImage: SourceImage) {
  const ext = sourceImage.mimeType.includes("png")
    ? "png"
    : sourceImage.mimeType.includes("webp")
    ? "webp"
    : "jpg";

  return toFile(
    Buffer.from(sourceImage.data, "base64"),
    `neva-audit-source.${ext}`,
    { type: sourceImage.mimeType }
  );
}

function parseAudit(content: string | null) {
  try {
    const parsed = JSON.parse(content ?? "{}") as unknown;
    if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid audit");
    return parsed;
  } catch {
    return {
      overallScore: 0,
      categories: [],
      strengths: [],
      weaknesses: ["The audit response could not be parsed."],
      suggestions: ["Try again with a clearer image."],
    };
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const contract = getModuleContract("audit");
    const rate = checkRateLimit(`audit:${user.id}`, contract.rateLimitPerMinute);
    if (!rate.ok) {
      securityLog("rate_limited", { userId: user.id, module: "audit" });
      return jsonError("rate_limited", 429);
    }

    const body = await request.json() as {
      sourceImage?: SourceImage | null;
      assetType?: string;
      generateImprovedVersion?: boolean;
      reportLanguage?: string;
    };

    const validatedSource = validateUploadedImage(body.sourceImage, "source_image");
    if (!validatedSource.ok) return jsonError(validatedSource.error, 400);

    const assetType = isAssetType(body.assetType) ? body.assetType : "poster";
    const reportLanguage = getReportLanguage(body.reportLanguage);
    const generateImprovedVersion = body.generateImprovedVersion === true;
    const brainContext = buildNevaBrainContext("audit");

    const auditRes = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Neva Audit, a senior FiveM creative director. Analyze uploaded visuals for FiveM creators, server owners, marketing teams, and designers.

Use these Neva Brain rules:
${brainContext}

Audit standard:
- Be comprehensive, practical, and specific. Do not write generic design advice.
- Judge premium quality by restraint: clear hierarchy, readable focal point, controlled contrast, good spacing, coherent branding, and useful depth.
- Penalize excessive glow, random neon, heavy blur, overloaded particles, unreadable text zones, plastic HDR, and effects that do not support the message.
- Suggestions must be written like a senior Photoshop designer briefing a junior designer: exact visual change, reason, and expected improvement.
- Write the entire audit report in ${REPORT_LANGUAGES[reportLanguage]}. JSON keys must stay in English, but every human-readable value must be in ${REPORT_LANGUAGES[reportLanguage]}.

Return ONLY valid JSON with this shape:
{
  "overallScore": 0-100,
  "summary": "2-3 sentences with the main diagnosis and the biggest improvement priority",
  "categories": [
    { "name": "Composition", "score": 0-100, "notes": "2 concrete sentences: what works/does not work and how to improve" },
    { "name": "Visual Hierarchy", "score": 0-100, "notes": "2 concrete sentences" },
    { "name": "Readability", "score": 0-100, "notes": "2 concrete sentences" },
    { "name": "Branding", "score": 0-100, "notes": "2 concrete sentences" },
    { "name": "Color Usage", "score": 0-100, "notes": "2 concrete sentences" },
    { "name": "Marketing Impact", "score": 0-100, "notes": "2 concrete sentences" },
    { "name": "Storytelling", "score": 0-100, "notes": "2 concrete sentences" },
    { "name": "Depth", "score": 0-100, "notes": "2 concrete sentences" }
  ],
  "strengths": ["4-6 specific strengths"],
  "weaknesses": ["4-6 specific weaknesses"],
  "suggestions": ["6-8 concrete Photoshop-level improvement suggestions with values when useful"],
  "priorityActions": ["3 ordered fixes that would improve the visual fastest"],
  "improvedVersionPrompt": "one paragraph prompt to improve this exact visual while preserving its concept, layout intent, brand identity and subject identity"
}`,
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${validatedSource.image.mimeType};base64,${validatedSource.image.data}`, detail: "high" } },
            { type: "text", text: `Audit this ${assetType} for premium FiveM marketing quality. Write the report in ${REPORT_LANGUAGES[reportLanguage]}. Be comprehensive, direct, and focused on what would make it sell better without adding unnecessary effects.` },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 1800,
    });

    const audit = parseAudit(auditRes.choices[0].message.content);
    let improvedImage: string | null = null;

    if (generateImprovedVersion) {
      const improvedPrompt =
        typeof audit === "object" && audit !== null && "improvedVersionPrompt" in audit && typeof audit.improvedVersionPrompt === "string"
          ? audit.improvedVersionPrompt
          : "Improve this FiveM promotional visual while preserving the same concept, subject, brand identity, composition intent, colors, logos, and all important details. Make it look professionally edited in Photoshop with stronger hierarchy, cleaner lighting, controlled contrast, subtle depth, better readability, and premium restrained marketing polish.";

      const edit = await openai().images.edit({
        model: "gpt-image-1",
        image: await imageToUpload(validatedSource.image),
        prompt: `${improvedPrompt} Preserve the uploaded visual identity, layout intent, logos, character identity, face, tattoos, accessories, and recognizable elements. Do not redesign from scratch. FiveM / GTA RP promotional artwork, senior designer Photoshop finish. Keep effects subtle and purposeful: no random neon, no excessive glow, no overloaded particles, no plastic HDR, no fake stock-photo realism.`,
        size: "1536x1024",
        quality: "high",
        input_fidelity: "high",
        n: 1,
        output_format: "webp",
        output_compression: 90,
      });

      const b64 = edit.data?.[0]?.b64_json;
      if (!b64) throw new Error("No improved image returned");
      improvedImage = `data:image/webp;base64,${b64}`;
    }

    const totalCost = AUDIT_COST + (generateImprovedVersion ? IMPROVED_VERSION_COST : 0);
    const deduction = await deductCredits(
      user.id,
      totalCost,
      generateImprovedVersion ? "image_audit_improved" : "image_audit",
      generateImprovedVersion ? "Neva Audit + improved version" : "Neva Audit"
    );

    if (!deduction.success) {
      return Response.json({
        success: false,
        error: { code: "insufficient_credits", message: "Créations disponibles insuffisantes. Recharge dans Billing." },
        remaining: deduction.remaining,
      }, { status: 402 });
    }

    const watermarkEnabled = await userNeedsWatermark(supabase, user.id);
    const finalImprovedImage = improvedImage && watermarkEnabled
      ? await applyWatermarkToImage(improvedImage)
      : improvedImage;

    return Response.json({
      success: true,
      data: {
        audit,
        improvedImage: finalImprovedImage,
        assetType,
        reportLanguage,
        creditsUsed: totalCost,
        watermarkEnabled,
      },
      audit,
      improvedImage: finalImprovedImage,
      assetType,
      reportLanguage,
      creditsUsed: totalCost,
      watermarkEnabled,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("[audit-image]", e?.message);
    return jsonError("audit_failed", 500, "L’audit a échoué. Aucune création n’a été utilisée.");
  }
}
