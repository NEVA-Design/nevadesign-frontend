import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { backendGetJson } from '@/lib/api/backend-server'
import { PLANS } from '@/lib/plans'
import { PageHeader } from '@/components/admin/PageHeader'
import { StatTile } from '@/components/admin/StatTile'
import { Card } from '@/components/ui/card'
import { Gauge } from '@/components/ui/gauge'

/*
 * Vue d'ensemble — l'activité du studio sur un seul écran : tuiles de
 * verre aux grands chiffres display, rythme de génération en barres
 * spectrales sur pistes de verre, économie de crédits et file d'abus.
 */

type OverviewResponse = {
  totalUsers: number
  paidUsers: number
  freeUsers: number
  conversionRate: number
  monthlyRevenue: number
  creditsRemaining: number
  creditsConsumed: number
  purchasedCredits: number
  dailyGenerations: number
  monthlyGenerations: number
  pendingSecurityAlerts: number
  blockedFreeCreditAttempts: number
  duplicateIpSignupsToday: number
  estimatedCreditsSaved: number
  generationSeries: Array<{ day: string; value: number }>
  planCounts: Array<{ plan: keyof typeof PLANS; label: string; count: number }>
}

function money(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function pct(value: number) {
  return `${Math.round(value)}%`
}

export default async function AdminOverviewPage() {
  const [admin, overview] = await Promise.all([
    backendGetJson<{ email: string }>('/admin/verify'),
    backendGetJson<OverviewResponse>('/admin/overview'),
  ])
  if (!admin || !overview) redirect('/dashboard')

  const {
    totalUsers,
    paidUsers,
    freeUsers,
    conversionRate,
    monthlyRevenue,
    creditsRemaining,
    creditsConsumed,
    purchasedCredits,
    dailyGenerations,
    monthlyGenerations,
    pendingSecurityAlerts,
    blockedFreeCreditAttempts,
    duplicateIpSignupsToday,
    estimatedCreditsSaved,
    generationSeries,
    planCounts,
  } = overview

  const maxSeries = Math.max(...generationSeries.map((entry) => entry.value), 1)

  const primaryMetrics = [
    { label: 'MRR estimé', value: money(monthlyRevenue), detail: 'récurrence mensuelle estimée' },
    { label: 'Utilisateurs actifs', value: totalUsers.toLocaleString('fr-FR'), detail: `${paidUsers} payants · ${freeUsers} gratuits` },
    { label: 'Conversion', value: pct(conversionRate), detail: 'des comptes gratuits passés en payant' },
    { label: 'Alertes en attente', value: pendingSecurityAlerts.toLocaleString('fr-FR'), detail: `${blockedFreeCreditAttempts} tentatives bloquées` },
  ]

  const usageMetrics = [
    { label: 'Crédits consommés', value: creditsConsumed.toLocaleString('fr-FR'), detail: `${creditsRemaining.toLocaleString('fr-FR')} restants dans les portefeuilles` },
    { label: 'Crédits achetés', value: purchasedCredits.toLocaleString('fr-FR'), detail: 'abonnements et packs de créations' },
    { label: 'Générations du jour', value: dailyGenerations.toLocaleString('fr-FR'), detail: `${monthlyGenerations.toLocaleString('fr-FR')} sur les 30 derniers jours` },
  ]

  const abuseFigures = [
    { label: 'En attente de revue', value: pendingSecurityAlerts },
    { label: 'Tentatives bloquées', value: blockedFreeCreditAttempts },
    { label: 'Signaux à risque du jour', value: duplicateIpSignupsToday },
    { label: 'Crédits préservés', value: estimatedCreditsSaved },
  ]

  return (
    <div className="pv-fade-up">
      <PageHeader
        eyebrow="Console"
        title={
          <>
            Vue <span className="pv-beam-underline font-medium text-ink">d&apos;ensemble.</span>
          </>
        }
        description="Revenu, croissance, usage et abus de crédits gratuits — l'activité du studio sur un seul écran."
      >
        <p className="font-mono text-[11px] tracking-[0.06em] text-dusk">
          Session — <span className="text-ink/70">{admin.email}</span>
        </p>
      </PageHeader>

      {/* Tuiles de verre — les quatre chiffres qui comptent */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {primaryMetrics.map((metric, index) => (
          <StatTile
            key={metric.label}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone={index === 3 && pendingSecurityAlerts > 0 ? 'warn' : 'default'}
          />
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        {/* Rythme de génération — barres spectrales sur pistes de verre */}
        <Card className="p-6 sm:p-7 xl:col-span-8">
          <div className="mb-7 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
              Rythme de génération
            </h2>
            <span className="pv-label text-[10px]">14 derniers jours</span>
          </div>
          <div className="flex h-52 items-end gap-1.5 sm:h-60 sm:gap-2.5">
            {generationSeries.map((entry) => (
              <div
                key={entry.day}
                className="group relative h-full flex-1"
                title={`${entry.day}: ${entry.value}`}
              >
                {/* piste de verre */}
                <div aria-hidden className="absolute inset-0 rounded-full bg-white/[0.06]" />
                {/* barre spectrale */}
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-[linear-gradient(180deg,#B9A7DA,#E9C6A2)] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ height: `${Math.max(4, (entry.value / maxSeries) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-1.5 sm:gap-2.5" aria-hidden>
            {generationSeries.map((entry) => (
              <span key={entry.day} className="flex-1 text-center font-mono text-[9px] text-dusk">
                {entry.day.slice(8)}
              </span>
            ))}
          </div>
          <p className="mt-5 font-mono text-[10px] tracking-[0.08em] text-dusk">
            Actions consommant des crédits, comptées par jour.
          </p>
        </Card>

        {/* Répartition par plan — le spectre mesure */}
        <Card className="p-6 sm:p-7 xl:col-span-4">
          <div className="mb-7 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
              Répartition par plan
            </h2>
            <span className="pv-label text-[10px]">
              {totalUsers.toLocaleString('fr-FR')} comptes
            </span>
          </div>
          <ul className="space-y-6">
            {planCounts.map((entry) => (
              <li key={entry.plan}>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[13px] text-ink/80">{entry.label}</span>
                  <span className="font-mono text-[11px] text-steel">
                    {entry.count.toLocaleString('fr-FR')}
                  </span>
                </div>
                <Gauge value={entry.count} max={Math.max(totalUsers, 1)} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 pb-4 xl:grid-cols-12">
        {/* Économie de crédits — trois mesures sous la même arête */}
        <Card className="overflow-hidden xl:col-span-7">
          <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--hairline)] px-6 py-5 sm:px-7">
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
              Économie de crédits
            </h2>
            <span className="pv-label text-[10px]">Consommation et achats</span>
          </div>
          <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-[color:var(--hairline)]">
            {usageMetrics.map((item) => (
              <div
                key={item.label}
                className="border-b border-[color:var(--hairline)] px-6 py-6 last:border-b-0 sm:border-b-0 sm:px-7"
              >
                <p className="pv-label text-[10px]">{item.label}</p>
                <p className="pv-display mt-3.5 text-[28px] leading-none text-ink">{item.value}</p>
                <p className="mt-3.5 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-dusk">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertes d'abus de crédits gratuits */}
        <Card className="overflow-hidden xl:col-span-5">
          <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--hairline)] px-6 py-5 sm:px-7">
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
              Alertes d&apos;abus
            </h2>
            <Link
              href="/admin/security-alerts"
              className="pv-link inline-flex items-center gap-1.5 text-[13px]"
            >
              Ouvrir la file
              <ArrowUpRight size={13} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
            </Link>
          </div>
          <div className="px-6 py-2 sm:px-7">
            {abuseFigures.map((item, index) => (
              <div
                key={item.label}
                className="flex items-baseline justify-between gap-4 border-b border-[color:var(--hairline)] py-4 last:border-b-0"
              >
                <span className="text-[13px] text-ink/70">{item.label}</span>
                <span
                  className={`pv-display text-xl ${
                    index === 0 && item.value > 0 ? 'text-warn' : 'text-ink'
                  }`}
                >
                  {item.value.toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
            <p className="border-t border-[color:var(--hairline)] py-4 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-dusk">
              Inscriptions à IP dupliquée, dotations bloquées et file de revue.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
