"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  {
    q: "Neva AI sert a quoi exactement ?",
    a: "Neva AI est une plateforme creative premium pour proprietaires de serveurs FiveM, designers et agences. Le coeur du produit est Neva Design : transformer une idee en visuel, brief, direction artistique et asset pret a publier.",
  },
  {
    q: "Quelle est la difference entre Free et les plans payants ?",
    a: "Free permet de tester le workflow et de generer des previews limitees. Les plans payants debloquent les exports HD, l'usage commercial, l'historique complet, la bibliotheque et les generations premium.",
  },
  {
    q: "Puis-je utiliser les creations pour un serveur ou un client ?",
    a: "Oui, sur les plans payants. Vous pouvez utiliser les exports pour votre Discord, Tebex, reseaux sociaux, lancements serveur, packs clients et campagnes commerciales.",
  },
  {
    q: "Neva Chat est-il juste un chatbot ?",
    a: "Non. Neva Chat est pense comme un Creative Director Assistant : il aide a ameliorer les prompts, trouver des concepts de posters, structurer une campagne et clarifier la direction artistique.",
  },
  {
    q: "Dois-je savoir designer ?",
    a: "Non. Vous apportez l'idee, Neva vous aide a la rendre exploitable : cadrage, ambiance, composition, format et niveau de finition.",
  },
  {
    q: "Puis-je annuler quand je veux ?",
    a: "Oui. Vous gardez l'acces jusqu'a la fin de la periode en cours, sans frais caches.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#F5F0E8] sm:text-5xl">
            Questions avant de lancer.
          </h2>
          <p className="text-lg leading-relaxed text-[#9A9A9A]">
            Tout ce qu&apos;il faut comprendre avant de transformer votre workflow creatif.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                open === i
                  ? "border-[#FF7B4B]/25 bg-white/[0.03]"
                  : "border-white/[0.06] bg-transparent hover:border-white/10"
              }`}
            >
              <button
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`text-[15px] font-medium transition-colors ${open === i ? "text-[#F5F0E8]" : "text-[#CCCCC0]"}`}>
                  {faq.q}
                </span>
                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${open === i ? "bg-[#FF7B4B]/20" : "bg-white/5"}`}>
                  {open === i ? <Minus size={12} className="text-[#FF7B4B]" /> : <Plus size={12} className="text-[#666]" />}
                </div>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed text-[#9A9A9A]">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="mb-3 text-sm text-[#666]">Besoin d&apos;un avis sur votre serveur ?</p>
          <a
            href="https://discord.gg/neva-design"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#FF7B4B] transition-colors hover:text-[#FFD166]"
          >
            Rejoindre la communaute Discord →
          </a>
        </div>
      </div>
    </section>
  );
}
