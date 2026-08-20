import { ArrowUpRight, Copy, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

/*
 * Neva Prompt — maquette sans logique. Le futur atelier de prompts :
 * intention, moteur et style à gauche, prompt généré à droite.
 * Actions désactivées tant que le module est en préparation.
 */

const nevaEngines = ["Neva Core", "Neva Vision", "Neva Studio"];

/* Noms de styles transmis tels quels aux moteurs — ne pas traduire */
const stylePresets = [
  "Cinematic Dark",
  "Miami Sunset",
  "Golden Hour",
  "Urban Gritty",
  "Luxury Editorial",
  "Neon Noir",
];

export default function PromptPage() {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Profondeur — jamais d'aplat noir nu */}
      <div aria-hidden className="pv-halo--violet pv-halo -top-24 left-[18%] h-72 w-72" />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge variant="subtle">En préparation</Badge>
        <span className="font-mono text-[10px] tracking-[0.1em] text-dusk">
          Ce module ouvrira prochainement dans l&apos;atelier
        </span>
      </div>

      <ModuleHeader
        icon={Wand2}
        eyebrow="Neva Prompt"
        title="Des prompts d'une précision chirurgicale"
        description="Décrivez votre intention : Neva Prompt la traduira en prompt taillé pour l'esthétique GTA RP et FiveM, prêt pour vos moteurs de génération."
        accent="#B8A1E8"
        meta="1 création / prompt"
        activeStep={0}
        steps={[
          { label: "Décrire", detail: "Votre intention visuelle" },
          { label: "Affiner", detail: "Moteur et style" },
          { label: "Copier", detail: "Prompt prêt à l'emploi" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Configuration */}
        <div className="flex flex-col gap-6">
          <div className="pv-glass pv-edge rounded-2xl p-5 sm:p-6">
            <Label htmlFor="prompt-intent">Que voulez-vous générer&nbsp;?</Label>
            <Textarea
              id="prompt-intent"
              rows={5}
              placeholder="Ex. : une affiche de recrutement cinématographique pour un serveur FiveM haut de gamme, photographie urbaine, ligne d'horizon de Los Santos…"
            />
          </div>

          <div className="pv-glass pv-edge rounded-2xl p-5 sm:p-6">
            <p className="pv-label mb-4">Moteur Neva</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {nevaEngines.map((engine, index) => (
                <button
                  key={engine}
                  type="button"
                  disabled
                  className={`h-10 rounded-lg border px-3 text-[13px] transition-colors duration-300 disabled:cursor-not-allowed ${
                    index === 0
                      ? "border-[color:var(--color-ink)] bg-[rgba(184,161,232,0.12)] text-ink"
                      : "border-carte-brd bg-carte text-slate"
                  }`}
                >
                  {engine}
                </button>
              ))}
            </div>
          </div>

          <div className="pv-glass pv-edge rounded-2xl p-5 sm:p-6">
            <p className="pv-label mb-4">Styles prédéfinis</p>
            <div className="flex flex-wrap gap-2">
              {stylePresets.map((preset, index) => (
                <button
                  key={preset}
                  type="button"
                  disabled
                  className={`h-10 rounded-lg border px-3.5 font-mono text-[11px] tracking-[0.06em] transition-colors duration-300 disabled:cursor-not-allowed ${
                    index === 0
                      ? "border-[color:var(--color-ink)] bg-[rgba(184,161,232,0.12)] text-ink"
                      : "border-carte-brd bg-carte text-slate"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Button variant="primary" size="md" disabled className="w-full">
              Générer le prompt
              <ArrowUpRight size={14} />
            </Button>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.08em] text-dusk">
              L&apos;action sera activée à l&apos;ouverture du module.
            </p>
          </div>
        </div>

        {/* Sortie — panneau encre structuré (D22) */}
        <div className="pv-glass pv-edge rounded-2xl flex min-h-[420px] flex-col overflow-hidden">
          <div className="pv-encre-panel flex items-center justify-between border-b border-[rgba(246,243,238,0.1)] px-5 py-3">
            <span className="pv-label relative">Prompt généré</span>
            <button
              type="button"
              disabled
              className="relative inline-flex h-10 items-center gap-1.5 rounded-lg px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(246,243,238,0.45)] disabled:cursor-not-allowed"
            >
              <Copy size={11} />
              Copier
            </button>
          </div>

          <div className="pv-encre-panel relative flex-1 p-5 font-mono text-[13px] leading-relaxed sm:p-6">
            <div aria-hidden className="pv-halo--violet pv-halo right-8 top-10 h-40 w-40 opacity-40" />
            <p className="relative text-[rgba(246,243,238,0.82)]">
              Choisissez un moteur et une ambiance — le prompt complet se
              compose ici, prêt à copier.
            </p>
            <p className="relative mt-6 text-[rgba(246,243,238,0.4)]">Exemple de sortie :</p>
            <p className="relative mt-2 text-[12px] leading-[1.8] text-[rgba(246,243,238,0.58)]">
              cinematic portrait of a masked street racer, neon rain,
              midnight rooftop, volumetric light, 85mm, hyperdetailed,
              --ar 16:9 --style raw
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-[color:var(--hairline)] p-4 sm:flex-row">
            <Button variant="secondary" size="md" disabled className="flex-1">
              Régénérer
            </Button>
            <Button variant="secondary" size="md" disabled className="flex-1">
              Enregistrer le prompt
            </Button>
            <Button variant="primary" size="md" disabled className="flex-1">
              Utiliser
              <ArrowUpRight size={13} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
