import { Suspense } from "react";
import { redirect } from "next/navigation";
import { backendGetJson } from "@/lib/api/backend-server";
import DownloadsClient from "./DownloadsClient";

type OwnedPack = {
  id: string
  name: string
  tagline: string
  downloadUrl: string
  purchasedAt: string | null
}

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const data = await backendGetJson<{ ownedPacks: OwnedPack[] }>("/dashboard/downloads");
  if (!data) redirect("/login");

  const params = await searchParams;

  return (
    <Suspense>
      <DownloadsClient
        ownedPacks={data.ownedPacks}
        successPack={params.success ?? null}
      />
    </Suspense>
  );
}
