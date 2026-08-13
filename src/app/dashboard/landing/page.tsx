import { ArrowUpRight, Check, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

/*
 * Neva Landing — maquette sans logique. Le futur générateur de pages
 * d'atterrissage : brief et sections à gauche, aperçu filaire à
 * droite. Actions désactivées tant que le module est en préparation.
 */

const detailFields = [
  { id: "landing-name", label: "Nom du serveur", placeholder: "Ex. : Los Santos Chronicles" },
  { id: "landing-framework", label: "Framework", placeholder: "ESX / QBCore / Personnalisé" },
  { id: "landing-audience", label: "Public visé", placeholder: "Ex. : joueurs RP sérieux, 18 ans et plus" },
];

const sections = [
  "Accroche + appel à l'action",
  "Chiffres et preuves sociales",
  "Grille des fonctionnalités",
  "Grille tarifaire",
  "Questions fréquentes",
  "Pied de page",
];

export default function LandingPage() {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Profondeur — jamais d'aplat noir nu */}
      <div aria-hidden className="pv-halo--violet pv-halo -top-24 right-[14%] h-72 w-72" />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge variant="subtle">En préparation</Badge>
        <span className="font-mono text-[10px] tracking-[0.1em] text-dusk">
          Ce module ouvrira prochainement dans l&apos;atelier
        </span>
      </div>

      <ModuleHeader
        icon={FileCode}
        eyebrow="Neva Landing"
        title="La page de présentation qui recrute pour vous"
        description="Renseignez votre serveur : Neva Landing composera la structure et les textes d'une page d'atterrissage complète, prête à convaincre."
        accent="#A48BE8"
        meta="3 créations / page"
        activeStep={0}
        steps={[
          { label: "Renseigner", detail: "Serveur, public, atouts" },
          { label: "Composer", detail: "Structure et textes" },
          { label: "Publier", detail: "Page prête à mettre en ligne" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Brief */}
        <div className="flex flex-col gap-8">
          <div className="pv-glass pv-edge rounded-2xl p-5 sm:p-6">
            <p className="pv-label mb-5">Détails du serveur</p>
            <div className="flex flex-col gap-4">
              {detailFields.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input id={field.id} placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <Label htmlFor="landing-features">Atouts principaux</Label>
                <Textarea
                  id="landing-features"
                  rows={3}
                  placeholder="Listez ce qui rend votre serveur unique…"
                />
              </div>
            </div>
          </div>

          {/* Sections — liste éditoriale en filets */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="pv-display text-lg text-ink">Sections à composer</h2>
              <span className="pv-label">3 sélectionnées</span>
            </div>
            <ul>
              {sections.map((section, index) => {
                const selected = index < 3;
                return (
                  <li
                    key={section}
                    className="pv-row grid grid-cols-[24px_1fr] items-center gap-3 px-2 py-3.5"
                  >
                    <span
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[rgba(164,139,232,0.5)] bg-violet/15 text-[color:var(--num-color)]"
                          : "border-[color:var(--hairline-strong)] text-transparent"
                      }`}
                      aria-hidden
                    >
                      {selected ? <Check size={11} /> : null}
                    </span>
                    <span className={`text-[14px] ${selected ? "text-ink/85" : "text-steel"}`}>
                      {section}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div>
            <Button variant="primary" size="md" disabled className="w-full">
              Générer la page
              <ArrowUpRight size={14} />
            </Button>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.08em] text-dusk">
              L&apos;action sera activée à l&apos;ouverture du module.
            </p>
          </div>
        </div>

        {/* Aperçu filaire */}
        <div className="pv-glass pv-edge rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[color:var(--hairline)] bg-abyss px-5 py-3">
            <span className="pv-label">Aperçu</span>
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-ink/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/10" />
            </div>
          </div>

          {/* Maquette filaire de la future page */}
          <div className="relative flex-1 bg-abyss p-5 sm:p-7">
            <div aria-hidden className="pv-halo--violet pv-halo left-1/2 top-6 h-44 w-44 -translate-x-1/2" />
            <div className="relative mx-auto flex max-w-sm flex-col gap-3" aria-hidden>
              {/* Barre de navigation */}
              <div className="flex items-center justify-between rounded-lg border border-[color:var(--hairline)] px-3 py-2">
                <span className="h-2 w-10 rounded-full bg-violet/40" />
                <span className="flex gap-2">
                  <span className="h-2 w-6 rounded-full bg-ink/10" />
                  <span className="h-2 w-6 rounded-full bg-ink/10" />
                  <span className="h-2 w-6 rounded-full bg-ink/10" />
                </span>
              </div>
              {/* Accroche */}
              <div className="flex flex-col items-center gap-2.5 rounded-lg border border-[color:var(--hairline)] px-4 py-8">
                <span className="h-3 w-3/4 rounded-full bg-white/15" />
                <span className="h-3 w-1/2 rounded-full bg-ink/10" />
                <span className="mt-2 h-6 w-24 rounded-[4px] bg-violet/30" />
              </div>
              {/* Chiffres */}
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-[color:var(--hairline)] py-4"
                  >
                    <span className="h-3 w-8 rounded-full bg-violet/25" />
                    <span className="h-2 w-10 rounded-full bg-ink/10" />
                  </div>
                ))}
              </div>
              {/* Fonctionnalités */}
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-lg border border-[color:var(--hairline)] p-3"
                  >
                    <span className="h-2 w-1/2 rounded-full bg-white/15" />
                    <span className="h-2 w-full rounded-full bg-white/8" />
                    <span className="h-2 w-2/3 rounded-full bg-white/8" />
                  </div>
                ))}
              </div>
            </div>
            <p className="relative mt-6 text-center font-mono text-[10px] tracking-[0.08em] text-dusk">
              Votre page s&apos;affichera ici, section par section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
