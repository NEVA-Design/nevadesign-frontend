"use client";
import { Check, Download, ExternalLink, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OwnedPack {
  id: string;
  name: string;
  tagline: string;
  downloadUrl: string;
  purchasedAt: string | null;
}

interface Props {
  ownedPacks: OwnedPack[];
  successPack: string | null;
}

export default function DownloadsClient({ ownedPacks, successPack }: Props) {
  const successPack_ = successPack
    ? (ownedPacks.find((p) => p.id === successPack) ?? null)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-[#FF7B4B]" />
            <h1 className="text-2xl font-bold text-[#F5F0E8]">Mes Ressources</h1>
          </div>
          <p className="text-sm text-[#666]">Tes packs achetés, disponibles en téléchargement.</p>
        </div>
      </div>

      {/* Success banner */}
      {successPack_ && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3.5 bg-green-500/8 border border-green-500/20 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <Check size={14} className="text-green-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-green-400">Achat confirmé !</div>
            <div className="text-xs text-[#555]">
              {successPack_.name} est maintenant disponible ci-dessous.
            </div>
          </div>
        </div>
      )}

      {ownedPacks.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-12 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <ShoppingBag size={24} className="text-[#333]" />
          </div>
          <div>
            <div className="text-base font-semibold text-[#F5F0E8] mb-1.5">Aucun pack acheté</div>
            <p className="text-sm text-[#444] leading-relaxed max-w-xs">
              Découvre nos brushes et templates premium pour créer des visuels FiveM professionnels.
            </p>
          </div>
          <Link href="/#resources">
            <Button variant="gradient" size="sm">
              Voir les packs <ExternalLink size={12} />
            </Button>
          </Link>
        </div>
      ) : (
        /* Owned packs */
        <div className="space-y-3">
          {ownedPacks.map((pack) => {
            const hasDownload = !!pack.downloadUrl;
            return (
              <div
                key={pack.id}
                className="glass-card rounded-2xl border border-white/[0.08] p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF7B4B]/20 to-[#FFD166]/20 border border-[#FF7B4B]/25 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-[#FF7B4B]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#F5F0E8]">{pack.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 border border-green-500/20 font-medium">
                      ACHETÉ
                    </span>
                  </div>
                  <div className="text-xs text-[#555]">{pack.tagline}</div>
                  {pack.purchasedAt && (
                    <div className="text-[10px] text-[#333] mt-0.5">
                      {new Date(pack.purchasedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>

                {hasDownload ? (
                  <a
                    href={pack.downloadUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7B4B]/10 border border-[#FF7B4B]/25 text-[#FF7B4B] text-xs font-semibold hover:bg-[#FF7B4B]/20 transition-all flex-shrink-0"
                  >
                    <Download size={13} />
                    Télécharger
                  </a>
                ) : (
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-xs text-[#444] px-3 py-2 rounded-xl border border-white/[0.05]">
                      Disponible bientôt
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {ownedPacks.length > 0 && (
        <p className="text-xs text-[#2e2e2e] text-center mt-6">
          Problème de téléchargement ? Contacte le support Discord.
        </p>
      )}
    </div>
  );
}
