import {
  ArrowRight,
  BarChart3,
  Clock3,
  ImageIcon,
  MessageSquare,
  Palette,
  Search,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ACCENT_STYLES, KIND_LABELS, type SiteAnnouncement } from "@/lib/announcements";
import { PLANS } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import LiveCreditMeter from "@/components/dashboard/LiveCreditMeter";

const quickActions = [
  { label: "Create visual", href: "/dashboard/design", icon: Palette, detail: "Poster, banner, logo, RP campaign", accent: "#FF7B4B" },
  { label: "Improve image", href: "/dashboard/enhance", icon: Sparkles, detail: "Upscale and clean existing assets", accent: "#FFD166" },
  { label: "Audit project", href: "/dashboard/audit", icon: Search, detail: "Find weak points before launch", accent: "#55D18A" },
  { label: "Character kit", href: "/dashboard/character", icon: UserRound, detail: "Identity and RP dossier", accent: "#FF6B7D" },
];

const libraryItems = [
  { title: "Vice City cartel poster", type: "Campaign", image: "/vice.png", metric: "9:16" },
  { title: "Prime server pack", type: "Resource", image: "/Prime_-_preview_serveur_pack_15.png", metric: "Pack" },
  { title: "Beach club launch", type: "Lifestyle", image: "/plage.png", metric: "4K" },
];

const TYPE_LABELS: Record<string, string> = {
  chat: "Creative Director",
  image_generation: "Design Studio",
  image_enhancement: "Enhance",
  image_audit: "Audit",
  image_audit_improved: "Audit",
  character_asset: "Character",
  signup_bonus: "Signup bonus",
  subscription: "Subscription",
  topup: "Credit pack",
};

const TYPE_COLORS: Record<string, string> = {
  chat: "#FFB5C8",
  image_generation: "#FF7B4B",
  image_enhancement: "#FFD166",
  image_audit: "#55D18A",
  image_audit_improved: "#55D18A",
  character_asset: "#FF6B7D",
  signup_bonus: "#55D18A",
  subscription: "#FFD166",
  topup: "#FFB5C8",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const meta = user?.user_metadata ?? {};
  const firstName = (meta.display_name ?? meta.full_name ?? meta.name ?? user?.email?.split("@")[0] ?? "Creator")
    .split(" ")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", user!.id)
    .single();

  const credits = profile?.credits ?? 0;
  const plan = (profile?.plan ?? "free") as keyof typeof PLANS;
  const planInfo = PLANS[plan] ?? PLANS.free;
  const maxCredits = planInfo.credits;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const usageTypes = ["chat", "image_generation", "image_enhancement", "image_audit", "image_audit_improved", "character_asset"];

  const [{ count: todayCount }, { count: monthCount }, { data: announcementRaw }, { data: recentRaw }] = await Promise.all([
    supabase
      .from("credit_transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .in("type", usageTypes)
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("credit_transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .in("type", usageTypes)
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("site_announcements")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("credit_transactions")
      .select("type, description, amount, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const announcements = (announcementRaw ?? []) as SiteAnnouncement[];
  const recentActivity = (recentRaw ?? []).filter((t) => usageTypes.includes(t.type));
  const conversionHint = plan === "free" ? "Upgrade removes preview limits" : "Production workspace active";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {announcements.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {announcements.map((item) => {
            const style = ACCENT_STYLES[item.accent];
            const content = (
              <div className="rounded-xl border px-4 py-3 transition-colors hover:bg-white/[0.045]" style={{ borderColor: style.border, background: style.bg }}>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ borderColor: style.border, color: style.color }}>
                    {item.badge || KIND_LABELS[item.kind]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#F5F0E8]">{item.title}</div>
                    <div className="truncate text-xs text-[#A9A39B]">{item.message}</div>
                  </div>
                  {item.cta_label && <ArrowRight size={14} className="text-[#777]" />}
                </div>
              </div>
            );
            return item.href ? <Link key={item.id} href={item.href}>{content}</Link> : <div key={item.id}>{content}</div>;
          })}
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[1fr_390px]">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6 sm:p-7">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF7B4B]">Workspace</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#F8F3EA] sm:text-5xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9A948C]">
                Manage credits, launch assets and keep your FiveM creative pipeline moving from one cockpit.
              </p>
            </div>
            <Link href="/dashboard/design">
              <ButtonLike>
                Quick create
                <ArrowRight size={16} />
              </ButtonLike>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <LiveCreditMeter userId={user!.id} initialCredits={credits} maxCredits={maxCredits} />
            <MetricCard label="Current plan" value={planInfo.name} detail={conversionHint} icon={Sparkles} color="#FF7B4B" />
            <MetricCard label="Monthly usage" value={`${monthCount ?? 0}`} detail={`${todayCount ?? 0} generations today`} icon={BarChart3} color="#55D18A" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#F5F0E8]">Production queue</h2>
              <p className="mt-1 text-xs text-[#777]">Start from the outcome you need.</p>
            </div>
            <Palette size={18} className="text-[#FF7B4B]" />
          </div>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ color: action.accent, borderColor: `${action.accent}38`, background: `${action.accent}12` }}>
                  <action.icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#F5F0E8]">{action.label}</span>
                  <span className="block truncate text-xs text-[#777]">{action.detail}</span>
                </span>
                <ArrowRight size={14} className="text-[#555] transition-colors group-hover:text-[#FFD166]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#F5F0E8]">Creation library</h2>
              <p className="mt-1 text-sm text-[#777]">Recent examples and reusable directions.</p>
            </div>
            <Link href="/neva-design#portfolio" className="text-xs font-semibold text-[#FF7B4B] hover:text-[#FFD166]">
              Open gallery
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {libraryItems.map((project) => (
              <div key={project.title} className="overflow-hidden rounded-xl border border-white/[0.075] bg-white/[0.025]">
                <div className="relative aspect-[4/3]">
                  <Image src={project.image} alt="" fill sizes="320px" className="object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.78))]" />
                  <span className="absolute right-3 top-3 rounded-full border border-white/[0.12] bg-black/45 px-2 py-1 text-[10px] font-semibold text-[#F5F0E8] backdrop-blur">
                    {project.metric}
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-sm font-semibold text-[#F5F0E8]">{project.title}</div>
                  <div className="mt-1 text-xs text-[#777]">{project.type}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#F5F0E8]">Live activity</h2>
              <p className="mt-1 text-sm text-[#777]">Synced with credit consumption.</p>
            </div>
            <Clock3 size={17} className="text-[#777]" />
          </div>
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-[#666]">
                Launch a design, audit or chat to build your activity trail.
              </div>
            ) : (
              recentActivity.map((item, index) => (
                <div key={`${item.created_at}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/[0.055] bg-white/[0.02] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ color: TYPE_COLORS[item.type] ?? "#888", borderColor: `${TYPE_COLORS[item.type] ?? "#888"}35`, background: `${TYPE_COLORS[item.type] ?? "#888"}12` }}>
                    {item.type === "chat" ? <MessageSquare size={16} /> : item.type === "character_asset" ? <UserRound size={16} /> : item.type.includes("audit") ? <Search size={16} /> : item.type.includes("enhancement") ? <WandSparkles size={16} /> : <ImageIcon size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#F5F0E8]">{TYPE_LABELS[item.type] ?? item.type}</div>
                    <div className="truncate text-xs text-[#777]">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#FFD166]">{Math.abs(item.amount)} cr</div>
                    <div className="text-[10px] text-[#555]">{timeAgo(item.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ButtonLike({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F5F0E8] px-4 text-sm font-semibold text-[#080808] transition-colors hover:bg-white">
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  detail: string
  icon: ElementType
  color: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080808]/80 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="text-sm font-medium text-[#A9A39B]">{label}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ color, borderColor: `${color}30`, background: `${color}10` }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-3xl font-semibold capitalize tracking-tight text-[#F8F3EA]">{value}</div>
      <div className="mt-2 text-xs text-[#777]">{detail}</div>
    </div>
  );
}
