import type { LucideIcon } from "lucide-react";

type ModuleStep = {
  label: string;
  detail: string;
};

/*
 * En-tête de module — Givre calme : pastille de verre, micro-label
 * mono mist, titre Outfit light (l'accent medium ink vit dans
 * pv-display), stepper en filets dont l'étape active est soulignée
 * par le spectre — le seul fil vif de l'en-tête. Le paramètre
 * `accent` est conservé pour compatibilité d'API.
 */
export function ModuleHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  accent: _accent,
  meta,
  steps,
  activeStep = 0,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  meta?: string;
  steps: ModuleStep[];
  activeStep?: number;
}) {
  void _accent;
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.05)] text-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_6px_16px_rgba(0,0,0,0.42)]">
              <Icon size={14} strokeWidth={1.8} />
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {eyebrow}
            </span>
          </div>
          <h1 className="pv-display text-[clamp(1.9rem,3.4vw,2.6rem)]">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">{description}</p>
        </div>

        {meta ? (
          <span className="w-fit shrink-0 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist">
            {meta}
          </span>
        ) : null}
      </div>

      {/* Stepper en filets */}
      <div className="pv-hairline mt-7 grid border-t sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isDone = index < activeStep;
          const lit = isActive || isDone;
          return (
            <div
              key={step.label}
              className={`relative flex items-baseline gap-3 py-4 pr-6 ${
                isActive
                  ? "-mt-px border-t-2 border-t-transparent [border-image:linear-gradient(90deg,#B8A1E8,#F0C5A8)_1]"
                  : ""
              }`}
            >
              <span
                className={`font-mono text-[11px] tracking-[0.12em] ${
                  lit ? "text-[color:var(--num-color)]" : "text-ink/25"
                }`}
              >
                0{index + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate text-[13px] font-medium ${
                    lit ? "text-ink" : "text-ink/35"
                  }`}
                >
                  {step.label}
                </span>
                <span className="mt-1 block truncate font-mono text-[10px] tracking-[0.06em] text-mist">
                  {step.detail}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
