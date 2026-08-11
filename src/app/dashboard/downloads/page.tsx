import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RESOURCE_PACKS } from "@/lib/resources";
import DownloadsClient from "./DownloadsClient";

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: purchases } = await supabase
    .from("resource_purchases")
    .select("resource_id, created_at")
    .eq("user_id", user.id);

  const ownedIds = new Set((purchases ?? []).map((p) => p.resource_id));

  // Build owned packs with download URLs (server-side only)
  const ownedPacks = Object.values(RESOURCE_PACKS)
    .filter((p) => ownedIds.has(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      downloadUrl: p.downloadUrl,
      purchasedAt: purchases?.find((pu) => pu.resource_id === p.id)?.created_at ?? null,
    }));

  const params = await searchParams;

  return (
    <Suspense>
      <DownloadsClient
        ownedPacks={ownedPacks}
        successPack={params.success ?? null}
      />
    </Suspense>
  );
}
