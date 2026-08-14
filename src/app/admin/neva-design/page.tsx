/* Portfolio Neva Design — garde d'auth admin, chargement trié et repli
   sur le portfolio par défaut si la table Supabase est absente. Tout le
   visuel vit dans le client. */
import { redirect } from "next/navigation";
import { backendFetchServer } from "@/lib/api/backend-server";
import {
  DEFAULT_NEVA_DESIGN_PORTFOLIO,
  type NevaDesignPortfolioItem,
} from "@/lib/neva-design-portfolio";
import { AdminNevaDesignClient } from "./AdminNevaDesignClient";

export default async function AdminNevaDesignPage() {
  const res = await backendFetchServer("/admin/neva-design/portfolio");
  if (res.status === 403) redirect("/dashboard");

  let items = DEFAULT_NEVA_DESIGN_PORTFOLIO;
  let tableMissing = false;

  if (res.ok) {
    const data = (await res.json()) as { items: NevaDesignPortfolioItem[] };
    items = data.items;
  } else {
    tableMissing = true;
  }

  return <AdminNevaDesignClient initialItems={items} tableMissing={tableMissing} />;
}
