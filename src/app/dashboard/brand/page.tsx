import { Tag, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrandPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={16} className="text-[#FF6B7D]" />
            <h1 className="text-2xl font-bold text-[#F5F0E8]">Neva Brand</h1>
          </div>
          <p className="text-sm text-[#666]">Create a complete brand identity system for your FiveM server.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A] bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5">
          <Sparkles size={10} className="text-[#FFD166]" />
          3 créations / identité
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <h3 className="text-xs font-medium text-[#9A9A9A] mb-4">Brand Brief</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Server Name", placeholder: "Los Santos Chronicles" },
                { label: "Brand Personality", placeholder: "e.g. Luxury, Exclusive, Cinematic" },
                { label: "Target Vibe", placeholder: "e.g. Miami luxury, Urban grit, Tropical sunset" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[11px] text-[#666] mb-1">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2 bg-white/5 border border-white/[0.06] rounded-lg text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF6B7D]/40 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <h3 className="text-xs font-medium text-[#9A9A9A] mb-3">Deliverables</h3>
            <div className="flex flex-col gap-2">
              {["Logo Concept + Variants", "Color Palette (6 colors)", "Typography System", "Usage Guidelines", "Social Media Templates"].map((d, i) => (
                <div key={d} className="flex items-center gap-2.5 text-sm text-[#CCCCC0]">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: i < 3 ? "#FF6B7D" : "#333" }} />
                  {d}
                </div>
              ))}
            </div>
          </div>

          <Button variant="gradient" size="md" className="w-full">
            Generate Brand Identity <ArrowRight size={14} />
          </Button>
        </div>

        {/* Brand preview */}
        <div className="glass-card rounded-2xl border border-white/[0.08] p-6 flex flex-col gap-4">
          <div className="text-xs font-medium text-[#9A9A9A]">Identity Preview</div>

          <div className="flex items-center justify-center h-32 rounded-xl bg-[#0a0a0a] border border-white/[0.06]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B7D] to-[#FFD166] flex items-center justify-center text-3xl font-bold text-white">N</div>
          </div>

          <div>
            <div className="text-[10px] text-[#444] mb-2">Color Palette</div>
            <div className="flex gap-2">
              {["#FF6B7D", "#FF7B4B", "#FFD166", "#FFB5C8", "#F5F0E8", "#080808"].map((c) => (
                <div key={c} className="w-7 h-7 rounded-lg" style={{ background: c, border: c === "#F5F0E8" ? "1px solid #333" : "none" }} title={c} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[#444] mb-2">Typography</div>
            <div className="text-xl font-bold text-[#F5F0E8] tracking-tight">Display / Geist</div>
            <div className="text-sm text-[#9A9A9A]">Body / Geist</div>
          </div>

          <p className="text-xs text-[#555] mt-auto">Complete brand system will be generated based on your brief.</p>
        </div>
      </div>
    </div>
  );
}
