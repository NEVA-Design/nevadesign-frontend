import { Code2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const snippets = [
  { name: "Job Script (ESX)", lang: "Lua", color: "#FF7B4B" },
  { name: "Custom Inventory UI", lang: "React/HTML", color: "#FFD166" },
  { name: "Vehicle Spawn System", lang: "Lua", color: "#FF6B7D" },
  { name: "Whitelist System", lang: "Lua", color: "#FF7B4B" },
  { name: "Admin Panel Commands", lang: "Lua", color: "#FFB5C8" },
  { name: "HUD Component", lang: "HTML/CSS", color: "#FFD166" },
];

export default function CodePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Code2 size={16} className="text-[#FF7B4B]" />
            <h1 className="text-2xl font-bold text-[#F5F0E8]">Neva Code</h1>
          </div>
          <p className="text-sm text-[#666]">Lua snippets, resource scaffolding, and FiveM development assistance.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A] bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5">
          <Sparkles size={10} className="text-[#FFD166]" />
          Inclus selon ton plan
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="glass-card rounded-2xl p-5 border border-white/[0.08]">
            <div className="flex gap-2 mb-4">
              {["ESX", "QBCore", "Standalone"].map((f, i) => (
                <button key={f} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === 0 ? "bg-[#FF7B4B]/15 border border-[#FF7B4B]/30 text-[#FF7B4B]" : "bg-white/5 border border-white/[0.06] text-[#666]"}`}>
                  {f}
                </button>
              ))}
            </div>

            <label className="block text-[11px] text-[#666] mb-2">Describe what you need</label>
            <textarea
              rows={5}
              placeholder="e.g. A job script for a mechanic job with ESX, including job grades, blips, and vehicle repair mechanics..."
              className="w-full bg-transparent text-sm text-[#F5F0E8] placeholder-[#444] outline-none resize-none leading-relaxed"
            />

            <Button variant="gradient" size="md" className="w-full mt-3">
              Generate Code <ArrowRight size={14} />
            </Button>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest mb-3">Quick Templates</div>
            <div className="flex flex-col gap-2">
              {snippets.map((s) => (
                <button key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-card border border-white/[0.06] hover:border-white/10 group transition-all">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold" style={{ background: `${s.color}18`, color: s.color }}>{s.lang}</span>
                  <span className="text-sm text-[#CCCCC0] group-hover:text-[#F5F0E8] transition-colors flex-1 text-left">{s.name}</span>
                  <ArrowRight size={11} className="text-[#444] group-hover:text-[#FF7B4B] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code output */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#0a0a0a]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <span className="text-xs text-[#444] font-mono">output.lua</span>
            <button className="text-xs text-[#666] hover:text-[#F5F0E8] transition-colors">Copy</button>
          </div>
          <div className="flex-1 p-5 font-mono text-sm text-[#CCCCC0] leading-relaxed">
            <span className="text-[#444]">-- Your generated code will appear here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
