import { ArrowUpRight, Code2, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

/*
 * Neva Code — maquette sans logique. Le futur générateur de scripts
 * FiveM : brief à gauche, éditeur de sortie à droite. Toutes les
 * actions restent désactivées tant que le module est en préparation.
 */

const frameworks = ["ESX", "QBCore", "Standalone"];

const templates = [
  { name: "Script de métier (ESX)", lang: "Lua" },
  { name: "Interface d'inventaire personnalisée", lang: "React/HTML" },
  { name: "Système d'apparition de véhicules", lang: "Lua" },
  { name: "Système de liste blanche", lang: "Lua" },
  { name: "Commandes du panneau d'administration", lang: "Lua" },
  { name: "Composant d'ATH", lang: "HTML/CSS" },
];

export default function CodePage() {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Profondeur — jamais d'aplat noir nu */}
      <div aria-hidden className="pv-halo--violet pv-halo -top-24 right-[8%] h-72 w-72" />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge variant="subtle">En préparation</Badge>
        <span className="font-mono text-[10px] tracking-[0.1em] text-dusk">
          Ce module ouvrira prochainement dans l&apos;atelier
        </span>
      </div>

      <ModuleHeader
        icon={Code2}
        eyebrow="Neva Code"
        title="Du code prêt à intégrer sur votre serveur"
        description="Décrivez la ressource dont vous avez besoin : Neva Code écrira des scripts Lua propres, structurés et compatibles avec votre framework."
        accent="#A48BE8"
        meta="Inclus selon votre plan"
        activeStep={0}
        steps={[
          { label: "Décrire", detail: "Votre besoin, votre framework" },
          { label: "Générer", detail: "Script structuré et commenté" },
          { label: "Intégrer", detail: "Copie directe dans la ressource" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Brief */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="pv-glass pv-edge rounded-2xl p-5 sm:p-6">
            <p className="pv-label mb-3">Framework cible</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {frameworks.map((framework, index) => (
                <button
                  key={framework}
                  type="button"
                  disabled
                  className={`h-10 flex-1 rounded-lg border px-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-300 disabled:cursor-not-allowed ${
                    index === 0
                      ? "border-[color:var(--color-ink)] bg-[rgba(164,139,232,0.12)] text-ink"
                      : "border-carte-brd bg-carte text-slate"
                  }`}
                >
                  {framework}
                </button>
              ))}
            </div>

            <Label htmlFor="code-brief">Décrivez ce dont vous avez besoin</Label>
            <Textarea
              id="code-brief"
              rows={6}
              placeholder="Ex. : un script de métier mécanicien sous ESX, avec grades, points d'intérêt sur la carte et mécanique de réparation de véhicules…"
            />

            <Button variant="primary" size="md" disabled className="mt-4 w-full">
              Générer le code
              <ArrowUpRight size={14} />
            </Button>
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.08em] text-dusk">
              L&apos;action sera activée à l&apos;ouverture du module.
            </p>
          </div>

          {/* Modèles rapides */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="pv-display text-lg text-ink">Modèles rapides</h2>
              <span className="pv-label">Bientôt</span>
            </div>
            <ul>
              {templates.map((template, index) => (
                <li key={template.name} className="pv-row group">
                  <button
                    type="button"
                    disabled
                    className="grid w-full grid-cols-[32px_1fr_auto] items-baseline gap-3 px-2 py-4 text-left disabled:cursor-not-allowed"
                  >
                    <span className="pv-num">0{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] text-ink/80">
                        {template.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                        {template.lang}
                      </span>
                    </span>
                    <ArrowUpRight size={14} className="translate-y-0.5 text-ink/25" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sortie — le panneau encre du studio (D22) : en-tête
            structuré, grain léger, état vide dessiné (une invite
            et un vrai exemple — plus de faux code fantôme) */}
        <div className="pv-glass pv-edge rounded-2xl flex min-h-[420px] flex-col overflow-hidden lg:col-span-3">
          <div className="pv-encre-panel flex items-center justify-between border-b border-[rgba(246,243,238,0.1)] px-5 py-3">
            <div className="relative flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(246,243,238,0.16)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(246,243,238,0.16)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(246,243,238,0.16)]" />
            </div>
            <span className="relative font-mono text-[11px] tracking-[0.06em] text-[rgba(246,243,238,0.72)]">
              output.lua
            </span>
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
            <div aria-hidden className="pv-halo--violet pv-halo right-6 top-8 h-40 w-40 opacity-40" />
            <p className="relative text-[rgba(246,243,238,0.82)]">
              Décrivez votre script à gauche — le code complet arrive ici,
              prêt à coller dans votre ressource.
            </p>
            <p className="relative mt-6 text-[rgba(246,243,238,0.4)]">-- Exemple de sortie :</p>
            <pre className="relative mt-2 text-[12px] leading-[1.8] text-[rgba(246,243,238,0.58)]">{`RegisterCommand("annonce", function(src, args)
  local message = table.concat(args, " ")
  TriggerClientEvent("chat:addMessage", -1, {
    args = { "[Staff]", message }
  })
end, true)`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
