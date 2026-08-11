const metrics = [
  { value: "4 modes", label: "Design, audit, enhancement and character kits" },
  { value: "Server-side", label: "Credit checks and reference handling" },
  { value: "FiveM-first", label: "Built around RP launches and creator workflows" },
  { value: "Admin-ready", label: "Security queue, maintenance and business metrics" },
];

export default function SocialProof() {
  return (
    <section className="border-y border-white/[0.08] bg-[#080808] py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.value} className="bg-[#0A0A0A] p-6">
              <div className="text-2xl font-semibold tracking-tight text-[#F8F3EA]">{metric.value}</div>
              <p className="mt-2 text-sm leading-6 text-[#8C8780]">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
