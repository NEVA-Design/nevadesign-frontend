/* Portfolio Neva Design — garde d'auth admin, chargement trié et repli
   sur le portfolio par défaut si la table Supabase est absente. Tout le
   visuel vit dans le client. */
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/admin";
import {
  DEFAULT_NEVA_DESIGN_PORTFOLIO,
  type NevaDesignPortfolioItem,
} from "@/lib/neva-design-portfolio";
import { createServiceClient } from "@/lib/supabase/server";
import { AdminNevaDesignClient } from "./AdminNevaDesignClient";

export default async function AdminNevaDesignPage() {
  const admin = await verifyAdmin();
  if (!admin) redirect("/dashboard");

  let items = DEFAULT_NEVA_DESIGN_PORTFOLIO;
  let tableMissing = false;

  try {
    const service = await createServiceClient();
    const { data, error } = await service
      .from("neva_design_portfolio")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin/neva-design] portfolio load error:", error);
      tableMissing = true;
    } else {
      items = (data ?? []) as NevaDesignPortfolioItem[];
    }
  } catch (error) {
    console.error("[admin/neva-design] portfolio fallback:", error);
    tableMissing = true;
  }

  return <AdminNevaDesignClient initialItems={items} tableMissing={tableMissing} />;
}
