import { BrandMark } from "@/components/prisme/Brand";
import { Spinner } from "@/components/ui/spinner";

/*
 * Next affiche ce fallback automatiquement pendant qu'une page de
 * /dashboard/** compile ou charge ses données — la sidebar (déjà
 * montée par le layout) ne bouge pas, seule cette zone respire.
 * Même registre que login/maintenance : verre, mono, spectre violet.
 */
export default function DashboardLoading() {
  return (
    <div className="pv-fade-up flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <BrandMark size={22} tone="white" className="opacity-70" />
      <Spinner />
      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
        Chargement de l’atelier…
      </p>
    </div>
  );
}
