import { BrandMark } from "@/components/prisme/Brand";
import { Spinner } from "@/components/ui/spinner";

/*
 * Fallback automatique pendant qu'une page de /admin/** compile ou
 * charge ses données — même registre que dashboard/loading.tsx.
 */
export default function AdminLoading() {
  return (
    <div className="pv-fade-up flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <BrandMark size={22} tone="white" className="opacity-70" />
      <Spinner />
      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
        Chargement de la console…
      </p>
    </div>
  );
}
