import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

const BUCKET = "neva-design-portfolio";
const MAX_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

async function ensureBucket() {
  const service = await createServiceClient();
  const { data: buckets, error: listError } = await service.storage.listBuckets();

  if (listError) {
    console.error("[admin/neva-design/upload] bucket list error:", listError.message);
    return { service, error: "Erreur storage" };
  }

  if (!buckets?.some((bucket) => bucket.id === BUCKET)) {
    const { error } = await service.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });

    if (error) {
      console.error("[admin/neva-design/upload] bucket create error:", error.message);
      return { service, error: "Bucket portfolio manquant" };
    }
  }

  return { service, error: null };
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Image requise" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image trop lourde - max 12 Mo" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format invalide - JPG, PNG ou WebP" }, { status: 400 });
  }

  const { service, error: bucketError } = await ensureBucket();
  if (bucketError) return NextResponse.json({ error: bucketError }, { status: 500 });

  const ext = extensionFor(file.type);
  const storagePath = `portfolio/${Date.now()}-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await service.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    console.error("[admin/neva-design/upload] upload error:", uploadError.message);
    return NextResponse.json({ error: `Upload echoue: ${uploadError.message}` }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = service.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({ image_path: `${publicUrl}?t=${Date.now()}` });
}
