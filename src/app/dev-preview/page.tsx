import { notFound } from "next/navigation";
import DevPreviewClient from "./DevPreviewClient";

/*
 * Aperçu de développement — permet de vérifier visuellement les
 * écrans du produit sans session Supabase réelle. Jamais servi en
 * production ; à supprimer après les captures.
 */
export default async function DevPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { screen } = await searchParams;
  return <DevPreviewClient screen={screen ?? "design"} />;
}
