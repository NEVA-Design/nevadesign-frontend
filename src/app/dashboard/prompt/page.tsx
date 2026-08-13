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
        accent="#7C6AFF"
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
                      ? "border-[rgba(109,91,232,0.5)] bg-[rgba(124,106,255,0.08)] text-[color:var(--num-color)]"
                      : "border-[color:var(--hairline)] text-steel"
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
                      ? "border-[rgba(109,91,232,0.5)] bg-[rgba(124,106,255,0.08)] text-[color:var(--num-color)]"
                      : "border-[color:var(--hairline)] text-steel"
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

        {/* Sortie */}
        <div className="pv-glass pv-edge rounded-2xl flex min-h-[420px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[color:var(--hairline)] bg-abyss px-5 py-3">
            <span className="pv-label">Prompt généré</span>
            <button
              type="button"
              disabled
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-dusk disabled:cursor-not-allowed"
            >
              <Copy size={11} />
              Copier
            </button>
          </div>

          <div className="relative flex-1 bg-abyss p-5 font-mono text-[13px] leading-relaxed sm:p-6">
            <div aria-hidden className="pv-halo--violet pv-halo right-8 top-10 h-40 w-40 opacity-60" />
            <p className="text-dusk">Votre prompt s&apos;affichera ici après la génération…</p>
            <div className="mt-8 flex flex-col gap-2.5" aria-hidden>
              <div className="pv-skeleton h-3 w-full" />
              <div className="pv-skeleton h-3 w-5/6" />
              <div className="pv-skeleton h-3 w-2/3" />
              <div className="pv-skeleton h-3 w-1/2" />
            </div>
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
