"use client";

import { ArrowRight, BadgeCheck, Braces, FileImage, Gauge, ScanFace } from "lucide-react";

const systems = [
  {
    icon: FileImage,
    problem: "Launch visuals feel inconsistent.",
    solution: "Generate posters, banners and promo images from one creative direction.",
    result: "A server presence that looks intentional before players even join.",
  },
  {
    icon: ScanFace,
    problem: "Uploaded characters get redesigned.",
    solution: "Reference intelligence preserves face, skin tone, hairstyle, tattoos and outfit.",
    result: "Characters stay recognizable across campaigns and RP assets.",
  },
  {
    icon: Braces,
    problem: "Prompts produce the same style.",
    solution: "Neva reads the intent first, then adapts the visual direction to the request.",
    result: "Beach, business, hood, logo and poster work each get the right treatment.",
  },
  {
    icon: Gauge,
    problem: "Free credits can be farmed.",
    solution: "Signup security checks duplicate IP patterns and routes risk to admins.",
    result: "Creators can test the product while abuse stops draining margin.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#050505] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.10] px-3 py-1.5 text-xs text-[#A9A39B]">
              <BadgeCheck size={14} className="text-[#FF7B4B]" />
              Product maturity update
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-[#F8F3EA] sm:text-5xl">
              Less wrapper. More operating system.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#8F8981]">
              Neva is organized around the work FiveM owners actually repeat: launching campaigns,
              preserving identity, converting players and protecting free usage from abuse.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-2">
            {systems.map((item) => (
              <div key={item.problem} className="bg-[#0A0A0A] p-6">
                <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#FF7B4B]">
                  <item.icon size={20} />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5F5A55]">Problem</div>
                    <p className="mt-1 text-sm leading-6 text-[#BDB6AC]">{item.problem}</p>
                  </div>
                  <ArrowRight size={15} className="text-[#FF7B4B]" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5F5A55]">Solution</div>
                    <p className="mt-1 text-sm leading-6 text-[#DCD6CD]">{item.solution}</p>
                  </div>
                  <div className="rounded-xl border border-[#FFD166]/15 bg-[#FFD166]/[0.045] px-3 py-2 text-sm leading-6 text-[#D8C18A]">
                    {item.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
