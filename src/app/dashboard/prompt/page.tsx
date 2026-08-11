import { Wand2, ArrowRight, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const stylePresets = [
  { label: "Cinematic Dark", color: "#FF6B7D" },
  { label: "Miami Sunset", color: "#FF7B4B" },
  { label: "Golden Hour", color: "#FFD166" },
  { label: "Urban Gritty", color: "#9A9A9A" },
  { label: "Luxury Editorial", color: "#FFB5C8" },
  { label: "Neon Noir", color: "#60A5FA" },
];

const nevaEngines = ["Neva Core", "Neva Vision", "Neva Studio"];

export default function PromptPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wand2 size={16} className="text-[#FFD166]" />
            <h1 className="text-2xl font-bold text-[#F5F0E8]">Neva Prompt</h1>
          </div>
          <p className="text-sm text-[#666]">Generate ultra-precise AI image prompts crafted for GTA RP and FiveM aesthetics.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A] bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5">
          <Sparkles size={10} className="text-[#FFD166]" />
          1 création / prompt
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Config */}
        <div className="flex flex-col gap-5">
          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <label className="block text-xs font-medium text-[#9A9A9A] mb-2">What to generate</label>
            <textarea
              rows={4}
              placeholder="e.g. A cinematic recruitment poster for a luxury FiveM server, urban photography style, Los Santos skyline..."
              className="w-full bg-transparent text-sm text-[#F5F0E8] placeholder-[#444] outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <label className="block text-xs font-medium text-[#9A9A9A] mb-3">Neva Engine</label>
            <div className="grid grid-cols-2 gap-2">
              {nevaEngines.map((m, i) => (
                <button key={m} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${i === 0 ? "bg-[#FF7B4B]/15 border border-[#FF7B4B]/30 text-[#FF7B4B]" : "bg-white/5 border border-white/[0.06] text-[#666] hover:text-[#CCCCC0]"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <label className="block text-xs font-medium text-[#9A9A9A] mb-3">Style Presets</label>
            <div className="flex flex-wrap gap-2">
              {stylePresets.map((s, i) => (
                <button key={s.label} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${i === 0 ? "text-white" : "bg-white/5 border border-white/[0.06] text-[#666] hover:text-[#CCCCC0]"}`} style={i === 0 ? { background: s.color } : {}}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Button variant="gradient" size="md" className="w-full">
            <Wand2 size={14} />
            Generate Prompt
          </Button>
        </div>

        {/* Right: Output */}
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#9A9A9A]">Generated Prompt</span>
            <button className="flex items-center gap-1 text-xs text-[#666] hover:text-[#F5F0E8] transition-colors">
              <Copy size={11} /> Copy
            </button>
          </div>
          <div className="flex-1 p-4 bg-[#0a0a0a] rounded-xl border border-white/[0.06] text-sm text-[#CCCCC0] leading-relaxed font-mono">
            <span className="text-[#444]">Your prompt will appear here after generationâ€¦</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 px-3 py-2 text-xs text-[#666] bg-white/5 border border-white/[0.06] rounded-lg hover:text-[#F5F0E8] hover:border-white/10 transition-all">Regenerate</button>
            <button className="flex-1 px-3 py-2 text-xs text-[#666] bg-white/5 border border-white/[0.06] rounded-lg hover:text-[#F5F0E8] hover:border-white/10 transition-all">Save Prompt</button>
            <button className="flex items-center gap-1 px-3 py-2 text-xs bg-gradient-to-r from-[#FF6B7D] to-[#FFD166] text-white rounded-lg hover:opacity-90 transition-opacity">
              Use <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
