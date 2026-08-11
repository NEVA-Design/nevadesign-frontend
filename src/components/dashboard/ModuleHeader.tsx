import type { LucideIcon } from "lucide-react";

type ModuleStep = {
  label: string;
  detail: string;
};

export function ModuleHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  accent,
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
  return (
    <div className="mb-6 overflow-hidden rounded-[16px] border border-white/[0.075] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              style={{ background: `${accent}14`, borderColor: `${accent}32`, color: accent }}
            >
              <Icon size={17} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
                {eyebrow}
              </div>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-[#F5F0E8]">{title}</h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-[#A9A39B]">{description}</p>
        </div>

        {meta && (
          <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/[0.075] bg-black/20 px-3 py-2 text-[11px] text-[#A9A39B]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            {meta}
          </div>
        )}
      </div>

      <div className="grid border-t border-white/[0.05] sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isDone = index < activeStep;
          return (
            <div
              key={step.label}
              className={`flex min-h-16 items-center gap-3 border-white/[0.05] px-5 py-3 sm:border-r sm:last:border-r-0 ${
                isActive ? "bg-white/[0.035]" : ""
              }`}
            >
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border text-[11px] font-bold"
                style={{
                  borderColor: isActive || isDone ? `${accent}45` : "rgba(255,255,255,.08)",
                  background: isActive || isDone ? `${accent}16` : "rgba(255,255,255,.025)",
                  color: isActive || isDone ? accent : "#555",
                }}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <div className={`truncate text-xs font-semibold ${isActive ? "text-[#F5F0E8]" : "text-[#A9A39B]"}`}>
                  {step.label}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[#444]">{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
