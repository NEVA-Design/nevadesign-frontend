import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CreditCard, ShieldCheck, TrendingUp, Users, Zap } from 'lucide-react'
import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/plans'

type ProfileRow = {
  id: string
  credits: number | null
  plan: keyof typeof PLANS | string | null
  created_at: string | null
}

type TransactionRow = {
  amount: number | null
  type: string | null
  created_at: string | null
}

function money(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function pct(value: number) {
  return `${Math.round(value)}%`
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function lastDays(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (count - 1 - index))
    return dayKey(date)
  })
}

export default async function AdminOverviewPage() {
  const admin = await verifyAdmin()
  if (!admin) redirect('/dashboard')

  const service = await createServiceClient()
  const [{ data: profiles }, { data: transactions }, { data: authUsers }, { data: securityEvents }] = await Promise.all([
    service.from('profiles').select('id, credits, plan, created_at'),
    service.from('credit_transactions').select('amount, type, created_at').order('created_at', { ascending: false }).limit(700),
    service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    service.from('signup_security_events').select('status, ip_address, risk_score, created_at').order('created_at', { ascending: false }).limit(500),
  ])

  const profileRows = (profiles ?? []) as ProfileRow[]
  const transactionRows = (transactions ?? []) as TransactionRow[]
  const totalUsers = authUsers?.users.length ?? profileRows.length
  const paidUsers = profileRows.filter((profile) => profile.plan && profile.plan !== 'free').length
  const freeUsers = Math.max(totalUsers - paidUsers, 0)
  const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0
  const monthlyRevenue = profileRows.reduce((sum, profile) => {
    const plan = profile.plan && profile.plan in PLANS ? PLANS[profile.plan as keyof typeof PLANS] : null
    return sum + (plan && plan.id !== 'free' ? plan.price : 0)
  }, 0)
  const creditsRemaining = profileRows.reduce((sum, profile) => sum + Math.max(profile.credits ?? 0, 0), 0)
  const creditsConsumed = Math.abs(transactionRows.filter((tx) => (tx.amount ?? 0) < 0).reduce((sum, tx) => sum + (tx.amount ?? 0), 0))
  const purchasedCredits = transactionRows.filter((tx) => (tx.amount ?? 0) > 0 && ['topup', 'purchase', 'subscription'].some((type) => (tx.type ?? '').includes(type))).reduce((sum, tx) => sum + (tx.amount ?? 0), 0)
  const nowMs = new Date().getTime()
  const dailyGenerations = transactionRows.filter((tx) => (tx.amount ?? 0) < 0 && tx.created_at && nowMs - new Date(tx.created_at).getTime() < 86400000).length
  const monthlyGenerations = transactionRows.filter((tx) => (tx.amount ?? 0) < 0 && tx.created_at && nowMs - new Date(tx.created_at).getTime() < 30 * 86400000).length
  const securityRows = securityEvents ?? []
  const todayKey = dayKey(new Date())
  const pendingSecurityAlerts = securityRows.filter((event) => event.status === 'pending_review').length
  const blockedFreeCreditAttempts = securityRows.filter((event) => event.status === 'blocked' || event.status === 'rejected_by_admin').length
  const duplicateIpSignupsToday = securityRows.filter((event) => event.created_at?.startsWith(todayKey) && (event.risk_score ?? 0) >= 60).length
  const estimatedCreditsSaved = blockedFreeCreditAttempts * PLANS.free.credits

  const days = lastDays(14)
  const generationSeries = days.map((day) => ({
    day,
    value: transactionRows.filter((tx) => (tx.amount ?? 0) < 0 && tx.created_at?.startsWith(day)).length,
  }))
  const maxSeries = Math.max(...generationSeries.map((entry) => entry.value), 1)

  const planCounts = (Object.keys(PLANS) as Array<keyof typeof PLANS>).map((plan) => ({
    plan,
    label: PLANS[plan].name,
    count: profileRows.filter((profile) => (profile.plan ?? 'free') === plan).length,
  }))

  const primaryMetrics = [
    { label: 'Revenue', value: money(monthlyRevenue), detail: 'estimated monthly recurring', icon: CreditCard, color: '#FFD166' },
    { label: 'Active users', value: totalUsers.toLocaleString('fr-FR'), detail: `${paidUsers} paid / ${freeUsers} free`, icon: Users, color: '#55D18A' },
    { label: 'Conversion', value: pct(conversionRate), detail: 'free to paid accounts', icon: TrendingUp, color: '#FF7B4B' },
    { label: 'Abuse alerts', value: pendingSecurityAlerts.toLocaleString('fr-FR'), detail: `${blockedFreeCreditAttempts} blocked attempts`, icon: AlertTriangle, color: '#FF6B7D' },
  ]

  const usageMetrics = [
    { label: 'Credits consumed', value: creditsConsumed.toLocaleString('fr-FR'), detail: `${creditsRemaining.toLocaleString('fr-FR')} remaining in wallets` },
    { label: 'Credits purchased', value: purchasedCredits.toLocaleString('fr-FR'), detail: 'subscriptions and topups' },
    { label: 'Daily generations', value: dailyGenerations.toLocaleString('fr-FR'), detail: `${monthlyGenerations} in the last 30 days` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF7B4B]">Neva AI 3.0</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F8F3EA]">Command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#8C8780]">
            The business in one screen: revenue, growth, usage, conversion and free-credit abuse.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs text-[#777]">
          Signed in as <span className="text-[#DCD6CD]">{admin.email}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primaryMetrics.map((metric) => (
          <section key={metric.label} className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-medium text-[#A9A39B]">{metric.label}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ color: metric.color, borderColor: `${metric.color}30`, background: `${metric.color}10` }}>
                <metric.icon size={18} />
              </div>
            </div>
            <div className="text-3xl font-semibold tracking-tight text-[#F8F3EA]">{metric.value}</div>
            <div className="mt-2 text-xs text-[#777]">{metric.detail}</div>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#F8F3EA]">Generation velocity</h2>
              <p className="mt-1 text-sm text-[#777]">Last 14 days of credit-consuming actions.</p>
            </div>
            <Zap size={18} className="text-[#FFD166]" />
          </div>
          <div className="flex h-72 items-end gap-2">
            {generationSeries.map((entry) => (
              <div key={entry.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[linear-gradient(180deg,#FFD166,#FF7B4B)] opacity-85"
                  style={{ height: `${Math.max(8, (entry.value / maxSeries) * 245)}px` }}
                  title={`${entry.day}: ${entry.value}`}
                />
                <span className="text-[9px] text-[#555]">{entry.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-5">
          <h2 className="text-lg font-semibold text-[#F8F3EA]">Plan mix</h2>
          <p className="mb-5 mt-1 text-sm text-[#777]">Distribution and conversion pressure.</p>
          <div className="space-y-4">
            {planCounts.map((entry) => {
              const width = totalUsers > 0 ? (entry.count / totalUsers) * 100 : 0
              return (
                <div key={entry.plan}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-[#CCCCC0]">{entry.label}</span>
                    <span className="text-[#666]">{entry.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-[#FF7B4B]" style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#F8F3EA]">Credit economy</h2>
              <p className="mt-1 text-sm text-[#777]">Consumption, purchase behavior and retained balance.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {usageMetrics.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#666]">{item.label}</div>
                <div className="mt-3 text-2xl font-semibold text-[#F8F3EA]">{item.value}</div>
                <div className="mt-2 text-xs leading-5 text-[#777]">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#FFD166]/20 bg-[#FFD166]/[0.045] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-[#FFD166]" />
                <h2 className="text-lg font-semibold text-[#F8F3EA]">Free Credit Abuse Alerts</h2>
              </div>
              <p className="mt-1 text-sm text-[#A99563]">Duplicate IP signups, blocked grants and review queue.</p>
            </div>
            <Link href="/admin/security-alerts" className="inline-flex items-center gap-2 text-xs font-semibold text-[#FFD166] hover:text-[#F5F0E8]">
              Open queue
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { label: 'Pending', value: pendingSecurityAlerts },
              { label: 'Blocked', value: blockedFreeCreditAttempts },
              { label: 'Duplicate today', value: duplicateIpSignupsToday },
              { label: 'Credits saved', value: estimatedCreditsSaved },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#8A7440]">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold text-[#FFD166]">{item.value.toLocaleString('fr-FR')}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
