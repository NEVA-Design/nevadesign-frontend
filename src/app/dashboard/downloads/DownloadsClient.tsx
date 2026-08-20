"use client";
import { ArrowRight, Check, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/*
 * Ressources — bandeau d'achat confirmé en sage, packs possédés en
 * rangées éditoriales : nom serif, badge Acheté, date, téléchargement.
 */

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
    <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div aria-hidden className="pv-halo--violet pv-halo right-[-15%] top-[-100px] h-[380px] w-[460px] opacity-70" />

      {/* En-tête */}
      <div className="relative mb-10">
        <p className="pv-label text-[color:var(--num-color)]">Ressources</p>
        <h1 className="pv-display mt-4 text-[clamp(1.9rem,3.4vw,2.6rem)] text-ink">
          Vos <span className="pv-beam-underline font-medium text-ink">ressources.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
          Vos packs achetés, disponibles en téléchargement.
        </p>
      </div>

      {/* Bandeau d'achat confirmé */}
      {successPack_ && (
        <div className="relative mb-8 flex items-center gap-4 rounded-lg border border-ok/30 bg-ok/10 px-4 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ok/30 bg-ok/15 text-ok">
            <Check size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ok">Achat confirmé.</p>
            <p className="truncate text-xs text-steel">
              {successPack_.name} est maintenant disponible ci-dessous.
            </p>
          </div>
        </div>
      )}

      {ownedPacks.length === 0 ? (
        /* État vide */
        <EmptyState
          title="Aucun pack pour l'instant."
          hint="Découvrez nos pinceaux et modèles premium pour des visuels FiveM professionnels."
          action={
            <Link href="/#resources">
              <Button variant="gradient" size="sm">
                Voir les packs
                <ArrowRight size={13} />
              </Button>
            </Link>
          }
        />
      ) : (
        /* Packs possédés — rangées éditoriales */
        <ul className="relative">
          {ownedPacks.map((pack, index) => {
            const hasDownload = !!pack.downloadUrl;
            return (
              <li key={pack.id} className="pv-row">
                <div className="flex flex-col gap-4 px-2 py-6 sm:flex-row sm:items-center sm:gap-6">
                  <span className="pv-num hidden w-9 shrink-0 sm:block">0{index + 1}</span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                      <span className="pv-display text-lg text-ink">{pack.name}</span>
                      <span className="inline-flex rounded-full border border-ok/35 bg-ok/10 px-2 py-[3px] font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-ok">
                        Acheté
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-steel">{pack.tagline}</p>
                    {pack.purchasedAt && (
                      <p className="pv-meta mt-1.5">
                        {new Date(pack.purchasedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {hasDownload ? (
                    <a
                      href={pack.downloadUrl}
                      download
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[color:var(--hairline-strong)] px-5 text-sm font-medium text-ink transition-colors duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] hover:border-[rgba(184,161,232,0.5)] hover:text-[color:var(--num-color)]"
                    >
                      <Download size={14} />
                      Télécharger
                    </a>
                  ) : (
                    <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--hairline)] px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-dusk">
                      Disponible bientôt
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {ownedPacks.length > 0 && (
        <p className="pv-meta mt-8 text-center">
          Un problème de téléchargement ? Contactez le support sur Discord.
        </p>
      )}
    </div>
  );
}
