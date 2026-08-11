"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Brush, FileText, ImageIcon, Megaphone, Sparkles } from "lucide-react";

const cards = [
  {
    icon: ImageIcon,
    title: "Images & Visuels",
    description: "Visuels uniques pour Discord, affiches et réseaux.",
    image: "/plage.png",
  },
  {
    icon: Sparkles,
    title: "Prompts & Concepts",
    description: "Idées percutantes pour vos scènes FiveM.",
    image: "/vice.png",
  },
  {
    icon: FileText,
    title: "Pages d'accueil",
    description: "Landing pages modernes pour convertir.",
    image: "/ordi.png",
  },
  {
    icon: Brush,
    title: "Branding & Identité",
    description: "Marques fortes, cohérentes et premium.",
    image: "/poser.png",
  },
  {
    icon: Megaphone,
    title: "Assets FiveM",
    description: "Contenus prêts pour vos serveurs.",
    image: "/jetski.jpg",
  },
];

export default function LandingShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#050505] px-5 pb-24 pt-8 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF7B4B]/24 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[460px] w-[820px] -translate-x-1/2 rounded-full bg-[#FF7B4B]/7 blur-[140px]" />

      <div className="relative mx-auto max-w-[1480px]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <h2 className="max-w-2xl text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
            Tout ce qu&apos;il vous faut, réuni en un seul outil.
          </h2>
          <p className="max-w-md text-sm leading-6 text-white/48">
            Une suite créative complète pour imaginer, présenter et lancer votre univers FiveM.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.58, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ y: -7, scale: 1.012 }}
              className="group relative min-h-[250px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 20vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/52 to-black/12" />
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_100%,rgba(255,123,75,0.28),transparent_52%)]" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/45 text-[#FF8A4C] ring-1 ring-white/[0.09] backdrop-blur-xl">
                  <card.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{card.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
