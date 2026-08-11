"use client";
import { ExternalLink } from "lucide-react";

const showcaseItems = [
  {
    category: "Landing Page",
    title: "Eclipse RP Server",
    description: "Full landing page with cinematic hero, player stats, and CTA system.",
    gradient: "from-[#FF6B7D]/40 to-[#FF7B4B]/20",
    bgColor: "#0F0A08",
    accentColor: "#FF7B4B",
    mockup: "landing",
  },
  {
    category: "Logo Design",
    title: "Los Santos Cartel",
    description: "Monogram-based logo with gradient system and brand guidelines.",
    gradient: "from-[#FFD166]/30 to-[#FF7B4B]/20",
    bgColor: "#0A0A06",
    accentColor: "#FFD166",
    mockup: "logo",
  },
  {
    category: "Poster",
    title: "NoPixel Recruitment",
    description: "Cinematic hood poster with premium editorial photography direction.",
    gradient: "from-[#FFB5C8]/30 to-[#FF6B7D]/20",
    bgColor: "#0A0608",
    accentColor: "#FFB5C8",
    mockup: "poster",
  },
  {
    category: "FiveM Branding",
    title: "Vice City Chronicles",
    description: "Complete brand kit — logo, colors, typography and social templates.",
    gradient: "from-[#FF7B4B]/30 to-[#FFD166]/20",
    bgColor: "#0A0806",
    accentColor: "#FF7B4B",
    mockup: "brand",
  },
  {
    category: "Discord Design",
    title: "Mafia City Server",
    description: "Dark luxury Discord setup — banners, icons, role colors and info channels.",
    gradient: "from-[#FF6B7D]/30 to-[#FFB5C8]/20",
    bgColor: "#0A0609",
    accentColor: "#FF6B7D",
    mockup: "discord",
  },
  {
    category: "Marketing",
    title: "GTA World Agency",
    description: "Full social media marketing kit for server launch campaign.",
    gradient: "from-[#FFD166]/30 to-[#FFB5C8]/20",
    bgColor: "#0A0A08",
    accentColor: "#FFD166",
    mockup: "marketing",
  },
];

function MockupVisual({ type, accentColor }: { type: string; accentColor: string }) {
  if (type === "landing") {
    return (
      <div className="w-full h-full flex flex-col gap-1.5 p-3">
        <div className="h-3 rounded" style={{ background: `${accentColor}30`, width: "70%" }} />
        <div className="h-2 rounded bg-white/10" style={{ width: "90%" }} />
        <div className="h-2 rounded bg-white/10" style={{ width: "75%" }} />
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 w-14 rounded-md" style={{ background: accentColor }} />
          <div className="h-5 w-14 rounded-md bg-white/10" />
        </div>
        <div className="mt-2 h-16 rounded-lg bg-white/5 border border-white/10" />
      </div>
    );
  }
  if (type === "logo") {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold" style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}40`, color: accentColor }}>
          N
        </div>
      </div>
    );
  }
  if (type === "poster") {
    return (
      <div className="w-full h-full flex flex-col justify-end p-3" style={{ background: `linear-gradient(180deg, transparent 30%, ${accentColor}25 100%)` }}>
        <div className="h-2.5 rounded w-3/4 mb-1" style={{ background: accentColor }} />
        <div className="h-1.5 rounded w-1/2 bg-white/30" />
      </div>
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="flex flex-col gap-2 w-full">
        {[80, 60, 90, 50].map((w, i) => (
          <div key={i} className="h-2 rounded" style={{ width: `${w}%`, background: i === 0 ? accentColor : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
    </div>
  );
}

export default function Showcase() {
  return (
    <section id="showcase" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-yellow w-[400px] h-[300px] right-0 top-1/3 opacity-[0.05]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#9A9A9A] mb-6">
            Built with Neva AI
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-[#F5F0E8] mb-4">
            What creators are building.
          </h2>
          <p className="text-[#9A9A9A] text-lg max-w-xl leading-relaxed">
            From landing pages to brand identities — real creative work, powered by Neva.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {showcaseItems.map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden border border-white/[0.06] cursor-pointer transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
              style={{ background: item.bgColor }}
            >
              {/* Visual mockup area */}
              <div className={`h-44 relative overflow-hidden bg-gradient-to-br ${item.gradient}`}>
                <MockupVisual type={item.mockup} accentColor={item.accentColor} />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-xs text-white border border-white/20">
                      <ExternalLink size={11} />
                      View Project
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <span
                  className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: item.accentColor }}
                >
                  {item.category}
                </span>
                <h3 className="text-sm font-semibold text-[#F5F0E8] mt-1 mb-1">{item.title}</h3>
                <p className="text-xs text-[#666] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
