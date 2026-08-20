import { ArrowUpRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

/*
 * Neva Brand — maquette sans logique. Le futur atelier d'identité :
 * brief à gauche, aperçu d'identité à droite. Actions désactivées
 * tant que le module est en préparation.
 */

const briefFields = [
  { id: "brand-name", label: "Nom du serveur", placeholder: "Ex. : Los Santos Chronicles" },
  { id: "brand-personality", label: "Personnalité de marque", placeholder: "Ex. : luxueuse, exclusive, cinématographique" },
  { id: "brand-vibe", label: "Ambiance recherchée", placeholder: "Ex. : luxe de Miami, béton urbain, crépuscule tropical" },
];

const deliverables = [
  "Concept de logo et déclinaisons",
  "Palette de couleurs (6 teintes)",
  "Système typographique",
  "Règles d'utilisation",
  "Gabarits pour réseaux sociaux",
];

/* Palette d'exemple — teintes d'une identité serveur */
const paletteSwatches = ["#B8A1E8", "#F0C5A8", "#B8A1E8", "#F3EFE6", "#161310", "#070605"];

export default function BrandPage() {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Profondeur — jamais d'aplat noir nu */}
      <div aria-hidden className="pv-halo--violet pv-halo -top-24 left-[12%] h-72 w-72" />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge variant="subtle">En préparation</Badge>
        <span className="font-mono text-[10px] tracking-[0.1em] text-dusk">
          Ce module ouvrira prochainement dans l&apos;atelier
        </span>
      </div>

      <ModuleHeader
        icon={Tag}
        eyebrow="Neva Brand"
        title="Une identité de marque complète pour votre serveur"
        description="Confiez votre brief à Neva Brand : logo, palette, typographies et règles d'utilisation, livrés comme un système cohérent."
        accent="#B8A1E8"
        meta="3 créations / identité"
        activeStep={0}
        steps={[
          { label: "Brief", detail: "Nom, personnalité, ambiance" },
          { label: "Générer", detail: "Système d'identité complet" },
          { label: "Décliner", detail: "Gabarits prêts à publier" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Brief */}
        <div className="flex flex-col gap-8">
          <div className="pv-glass pv-edge rounded-2xl p-5 sm:p-6">
            <p className="pv-label mb-5">Brief de marque</p>
            <div className="flex flex-col gap-4">
              {briefFields.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input id={field.id} placeholder={field.placeholder} />
                </div>
              ))}
            </div>
          </div>

          {/* Livrables — liste éditoriale en filets */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="pv-display text-lg text-ink">Livrables</h2>
              <span className="pv-label">Système complet</span>
            </div>
            <ul>
              {deliverables.map((deliverable, index) => (
                <li
                  key={deliverable}
                  className="pv-row grid grid-cols-[32px_1fr] items-baseline gap-3 px-2 py-3.5"
                >
                  <span className="pv-num">0{index + 1}</span>
                  <span className="text-[14px] text-ink/80">{deliverable}</span>
                </li>
              ))}
            </ul>
          </section>

          <div>
            <Button variant="primary" size="md" disabled className="w-full">
              Générer l&apos;identité de marque
              <ArrowUpRight size={14} />
            </Button>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.08em] text-dusk">
              L&apos;action sera activée à l&apos;ouverture du module.
            </p>
          </div>
        </div>

        {/* Aperçu d'identité */}
        <div className="pv-glass pv-edge rounded-2xl flex flex-col gap-6 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="pv-label">Aperçu d&apos;identité</p>
            <span className="font-mono text-[10px] tracking-[0.1em] text-dusk">Exemple</span>
          </div>

          <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss">
            <div aria-hidden className="pv-halo--violet pv-halo h-40 w-40" />
            <div className="pv-display relative flex h-16 w-16 items-center justify-center rounded-xl border border-[rgba(184,161,232,0.3)] bg-[rgba(184,161,232,0.08)] text-3xl text-[color:var(--num-color)]">
              N
            </div>
          </div>

          <div>
            <p className="pv-label mb-3">Palette de couleurs</p>
            <div className="flex flex-wrap gap-2">
              {paletteSwatches.map((swatch) => (
                <div key={swatch} className="flex flex-col items-center gap-1.5">
                  <span
                    className="h-9 w-9 rounded-lg border border-[color:var(--hairline-strong)]"
                    style={{ background: swatch }}
                    title={swatch}
                  />
                  <span className="font-mono text-[8px] uppercase tracking-[0.06em] text-ink/25">
                    {swatch}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[color:var(--hairline)] pt-5">
            <p className="pv-label mb-3">Typographies</p>
            <p className="pv-display text-2xl text-ink">
              Titrage / <span className="font-bold">Chrome Extended</span>
            </p>
            <p className="mt-1.5 text-sm text-steel">Texte courant / Geist</p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.08em] text-steel">
              Précision / JetBrains Mono
            </p>
          </div>

          <p className="mt-auto border-t border-[color:var(--hairline)] pt-4 text-xs leading-relaxed text-steel">
            Le système de marque complet sera généré à partir de votre brief.
          </p>
        </div>
      </div>
    </div>
  );
}
