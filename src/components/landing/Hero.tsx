"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images, Layers3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const proofPoints = [
  { label: "Creative OS", value: "FiveM" },
  { label: "Exports", value: "Ready" },
  { label: "Workflow", value: "Studio" },
];

const gallery = [
  { src: "/postergrandfivem.png", label: "Server poster" },
  { src: "/vice.png", label: "RP campaign" },
  { src: "/Prime_-_preview_serveur_pack_15.png", label: "Premium pack" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#050505] pt-24 text-[#F5F0E8]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_34%),linear-gradient(90deg,rgba(255,123,75,0.08),transparent_38%,rgba(255,209,102,0.045))]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:px-10">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-[#BDB6AC]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#55D18A]" />
            Built for serious FiveM founders
          </div>

          <h1 className="text-5xl font-semibold leading-[0.96] tracking-tight text-[#F8F3EA] sm:text-7xl lg:text-[5.9rem]">
            The creative operating system for FiveM.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#BDB6AC] sm:text-xl">
            Plan, generate and ship premium visuals for your server without bouncing between prompts,
            designers and random tools. Neva turns a rough RP idea into assets that feel ready to sell.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full rounded-xl bg-[#F5F0E8] px-6 text-[#080808] hover:bg-white sm:w-auto">
                Start Creating
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/neva-design#portfolio">
              <Button variant="outline" size="lg" className="w-full rounded-xl border-white/[0.14] bg-white/[0.03] sm:w-auto">
                <Images size={18} />
                View Creations
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 divide-x divide-white/[0.08] rounded-xl border border-white/[0.08] bg-white/[0.025]">
            {proofPoints.map((item) => (
              <div key={item.label} className="px-4 py-4">
                <div className="text-xl font-semibold tracking-tight text-[#F8F3EA]">{item.value}</div>
                <div className="mt-1 text-xs text-[#777]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/[0.10] bg-[#0B0B0B] p-3 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
            <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[460px] overflow-hidden rounded-xl border border-white/[0.08]">
                <Image
                  src="/bglanding.png"
                  alt="Neva AI FiveM creative workspace preview"
                  fill
                  priority
                  sizes="(min-width: 1024px) 620px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02),rgba(5,5,5,0.78))]" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/45 px-3 py-1 text-xs text-white/80 backdrop-blur">
                    <Layers3 size={13} className="text-[#FFD166]" />
                    Campaign builder
                  </div>
                  <h2 className="max-w-sm text-2xl font-semibold tracking-tight text-white">
                    One place for posters, characters, brands and launch assets.
                  </h2>
                </div>
              </div>

              <div className="grid gap-3">
                {gallery.map((item) => (
                  <div key={item.src} className="relative min-h-[146px] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
                    <Image src={item.src} alt={item.label} fill sizes="260px" className="object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.74))]" />
                    <span className="absolute bottom-3 left-3 rounded-full border border-white/[0.12] bg-black/45 px-2.5 py-1 text-xs text-white/82 backdrop-blur">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#55D18A]/20 bg-[#55D18A]/[0.07] px-4 py-3 text-sm text-[#BDEBCF]">
            <ShieldCheck size={16} />
            Visual direction, reference handling and credit protection run server-side.
          </div>
        </div>
      </div>
    </section>
  );
}
