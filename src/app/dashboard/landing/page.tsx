import { FileCode, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = ["Hero + CTA", "Stats / Social Proof", "Features Grid", "Pricing Table", "FAQ", "Footer"];

export default function LandingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCode size={16} className="text-[#FFB5C8]" />
            <h1 className="text-2xl font-bold text-[#F5F0E8]">Neva Landing</h1>
          </div>
          <p className="text-sm text-[#666]">Generate complete landing page copy and structure for your FiveM server.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A] bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5">
          <Sparkles size={10} className="text-[#FFD166]" />
          3 créations / page
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <h3 className="text-xs font-medium text-[#9A9A9A] mb-4">Server Details</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Server Name", placeholder: "e.g. Los Santos Chronicles" },
                { label: "Framework", placeholder: "ESX / QBCore / Custom" },
                { label: "Target Audience", placeholder: "e.g. Serious RP players, 18+" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[11px] text-[#666] mb-1">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2 bg-white/5 border border-white/[0.06] rounded-lg text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FFB5C8]/40 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] text-[#666] mb-1">Key Features</label>
                <textarea rows={3} placeholder="List your server's unique selling points..." className="w-full px-3 py-2 bg-white/5 border border-white/[0.06] rounded-lg text-sm text-[#F5F0E8] placeholder-[#444] outline-none resize-none focus:border-[#FFB5C8]/40 transition-colors" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <h3 className="text-xs font-medium text-[#9A9A9A] mb-3">Sections to generate</h3>
            <div className="flex flex-col gap-2">
              {sections.map((s, i) => (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${i < 3 ? "bg-[#FFB5C8]/20 border border-[#FFB5C8]/30" : "bg-white/5 border border-white/[0.08]"}`}>
                    {i < 3 && <div className="w-2 h-2 rounded-sm bg-[#FFB5C8]" />}
                  </div>
                  <span className="text-sm text-[#CCCCC0]">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <Button variant="gradient" size="md" className="w-full">
            Generate Landing Page <ArrowRight size={14} />
          </Button>
        </div>

        <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-[#666]">Preview</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="p-5 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-[#FFB5C8]/10 border border-[#FFB5C8]/20 flex items-center justify-center mx-auto mb-3">
                <FileCode size={20} className="text-[#FFB5C8]" />
              </div>
              <p className="text-sm text-[#666]">Your landing page will preview here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
