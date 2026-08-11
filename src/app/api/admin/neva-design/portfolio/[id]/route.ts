import { verifyAdmin } from "@/lib/admin";
import {
  isPortfolioCategory,
  isPortfolioLayout,
  type NevaDesignPortfolioInput,
} from "@/lib/neva-design-portfolio";
import { createServiceClient } from "@/lib/supabase/server";

interface PortfolioPayload {
  title?: unknown;
  category?: unknown;
  tag?: unknown;
  image_path?: unknown;
  description?: unknown;
  is_featured?: unknown;
  is_active?: unknown;
  priority?: unknown;
  layout?: unknown;
}

function optionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function validatePayload(body: PortfolioPayload) {
  const title = optionalText(body.title);
  const tag = optionalText(body.tag);
  const category = isPortfolioCategory(body.category) ? body.category : null;
  const layout = isPortfolioLayout(body.layout) ? body.layout : "normal";
  const priority = Number(body.priority ?? 0);

  if (!title) return { error: "Titre requis" };
  if (!category) return { error: "Categorie invalide" };
  if (!tag) return { error: "Tag requis" };
  if (!Number.isInteger(priority) || priority < 0) return { error: "Priorite invalide" };

  return {
    payload: {
      title,
      category,
      tag,
      image_path: optionalText(body.image_path),
      description: optionalText(body.description),
      is_featured: typeof body.is_featured === "boolean" ? body.is_featured : false,
      is_active: typeof body.is_active === "boolean" ? body.is_active : true,
      priority,
      layout,
      updated_at: new Date().toISOString(),
    } satisfies NevaDesignPortfolioInput & { updated_at: string },
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json()) as PortfolioPayload;
  const validated = validatePayload(body);

  if ("error" in validated) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("neva_design_portfolio")
    .update(validated.payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[admin/neva-design/portfolio] update error:", error);
    return Response.json({ error: "Erreur mise a jour" }, { status: 500 });
  }

  return Response.json({ item: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const service = await createServiceClient();
  const { error } = await service.from("neva_design_portfolio").delete().eq("id", id);

  if (error) {
    console.error("[admin/neva-design/portfolio] delete error:", error);
    return Response.json({ error: "Erreur suppression" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
