"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const demoPrompts = [
  "Create a premium FiveM hood poster",
  "Design a Discord banner for a NoPixel-style server",
  "Write a cinematic landing page hero for my GTA RP server",
  "Generate a FiveM server logo concept with tropical vibes",
];

const demoResponses: Record<string, string> = {
  "Create a premium FiveM hood poster":
    `🎨 **Premium Hood Poster — Concept Brief**

**Visual Direction:** Dark cinematic backdrop with subtle urban texture. Deep blacks and muted tones create depth. A single gradient light source (amber-to-coral) bleeds from top-left creating cinematic tension.

**Typography:** Bold condensed sans-serif for the server name (96px+). Subheadline in light weight tracking +0.05em. All-caps for status tags.

**Composition:** Full-bleed layout. Subject centered, environment elements at 60% opacity framing left and right. Server logo lockup at bottom-center with 24px padding.

**Neva Design Brief:**
\`cinematic FiveM server poster, urban Los Santos aesthetic, dramatic amber backlight, dark atmospheric photography, premium streetwear editorial, 85mm lens feel, shallow depth of field, portrait campaign format\`

**Variants recommended:** 3 color grades — Sunset / Midnight / Golden Hour`,

  "Design a Discord banner for a NoPixel-style server":
    `🖼️ **Discord Banner — Design System**

**Dimensions:** 960×540px (16:9)

**Color Palette:**
- Background: #0A0A0F (deep near-black)
- Accent: #E8C547 (gold) + #C8452A (crimson)
- Text: #F0EDE8 (warm white)

**Layout Zones:**
- Left third: Server emblem / crest at 180px
- Center: Server name + tagline + tagline
- Right third: Key art (character silhouette or skyline)

**Typography:** Display: Bebas Neue / Body: Inter Medium

**Neva Design Brief:**
\`Discord server banner, premium GTA RP, dark cinematic, gold and crimson palette, Los Santos skyline silhouette, luxury gaming aesthetic, 16:9 composition\``,

  "Write a cinematic landing page hero for my GTA RP server":
    `✍️ **Landing Page Hero — Copy System**

**H1 (Primary):**
"The City Has Rules. You Make Them."

**H2 (Subheadline):**
"A premium GTA RP experience built for those who demand more. Immersive storylines, a living economy, and a community that sets the standard."

**CTA Buttons:**
- Primary: "Join the City →"
- Secondary: "Watch the Trailer"

**Proof Elements:**
- "3,200+ Active Players"
- "Whitelisted · ESX Framework"
- "Est. 2021"

**Hero Visual Direction:**
Full-viewport dark cinematic still or loop of Los Santos at golden hour. Subtle film grain overlay at 4% opacity. Text lockup with left-aligned layout.`,

  "Generate a FiveM server logo concept with tropical vibes":
    `🌴 **Server Logo Concept — Tropical Edition**

**Concept:** A monogram built around an "A" and "V" letterform fused together, with a palm tree silhouette integrated into the counter of one letter. Gradient flows from coral-pink (#FF6B7D) through burnt orange (#FF7B4B) to tropical gold (#FFD166).

**Style:** Clean, modern logomark with a luxury feel — not cartoonish. Think premium resort meets Los Santos skyline.

**Variations:**
1. Logomark only (icon)
2. Wordmark + icon lockup (horizontal)
3. Stacked lockup (vertical)

**Neva Design Brief:**
\`minimalist logo design, tropical palm tree letterform, gradient coral to gold, premium FiveM server brand, clean professional mark, square composition\`

**Color Tokens:**
\`--brand-primary: #FF7B4B\`
\`--brand-secondary: #FFD166\`
\`--brand-accent: #FF6B7D\``,
};

export default function InteractiveDemo() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGenerate = (prompt?: string) => {
    const query = prompt || input;
    if (!query.trim()) return;
    if (!input && prompt) setInput(prompt);

    const key = Object.keys(demoResponses).find((k) =>
      k.toLowerCase().includes(query.toLowerCase().split(" ").slice(0, 3).join(" ").toLowerCase())
    ) || Object.keys(demoResponses)[0];

    const fullResponse = demoResponses[key];
    setResponse("");
    setIsTyping(true);

    let i = 0;
    if (typingRef.current) clearInterval(typingRef.current);
    typingRef.current = setInterval(() => {
      i += 4;
      setResponse(fullResponse.slice(0, i));
      if (i >= fullResponse.length) {
        setIsTyping(false);
        if (typingRef.current) clearInterval(typingRef.current);
      }
    }, 8);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-orange w-[500px] h-[300px] left-1/2 -translate-x-1/2 top-1/4 opacity-10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#9A9A9A] mb-6">
            <Sparkles size={11} className="text-[#FFD166]" />
            Try it live — no account needed
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-[#F5F0E8] mb-4">
            See Neva AI in action.
          </h2>
          <p className="text-[#9A9A9A] text-lg max-w-xl leading-relaxed">
            Type your creative brief or pick a prompt below. Watch Neva generate studio-quality output instantly.
          </p>
        </div>

        {/* Demo container */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08]">
          {/* Chrome */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-[#0c0c0c]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF6B7D]/50" />
              <div className="w-3 h-3 rounded-full bg-[#FFD166]/50" />
              <div className="w-3 h-3 rounded-full bg-[#4ADE80]/50" />
            </div>
            <span className="text-xs text-[#444] ml-2">Neva Chat — Interactive Demo</span>
          </div>

          {/* Prompt suggestions */}
          <div className="px-5 pt-5 flex flex-wrap gap-2">
            {demoPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleGenerate(prompt)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.08] text-[#9A9A9A] hover:text-[#F5F0E8] hover:border-[#FF7B4B]/30 hover:bg-white/[0.08] transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl focus-within:border-[#FF7B4B]/40 transition-colors">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Describe your creative project..."
                  className="flex-1 bg-transparent text-sm text-[#F5F0E8] placeholder-[#444] outline-none"
                />
              </div>
              <Button variant="gradient" size="md" onClick={() => handleGenerate()} disabled={isTyping}>
                {isTyping ? (
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
                    ))}
                  </div>
                ) : (
                  <>Generate <ArrowRight size={14} /></>
                )}
              </Button>
            </div>
          </div>

          {/* Response */}
          {(response || isTyping) && (
            <div className="px-5 pb-5">
              <div className="relative rounded-xl bg-[#0a0a0a] border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF6B7D] to-[#FFD166] flex items-center justify-center text-[10px] font-bold text-white">N</div>
                    <span className="text-xs text-[#666]">Neva AI</span>
                    {isTyping && (
                      <span className="flex items-center gap-1 text-[10px] text-[#FF7B4B]">
                        <span className="w-1 h-1 rounded-full bg-[#FF7B4B] animate-pulse" />
                        Generating…
                      </span>
                    )}
                  </div>
                  {!isTyping && response && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] text-[#666] hover:text-[#F5F0E8] transition-colors"
                    >
                      {copied ? <Check size={12} className="text-[#4ADE80]" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
                <div
                  ref={responseRef}
                  className="p-4 text-sm text-[#CCCCC0] leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto font-mono"
                >
                  {response}
                  {isTyping && <span className="typing-cursor text-[#FF7B4B]">█</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
