import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { backendGetJson } from '@/lib/api/backend-server'
import { Brand, BrandMark } from '@/components/prisme/Brand'
import { AdminRailNav, AdminSidebarNav } from '@/components/admin/AdminNav'

// Depends on the request's session cookie — never prerender statically.
export const dynamic = 'force-dynamic'

/*
 * Console d'administration — le registre le plus calme du site.
 * La scène d'aube diluée respire seule (aucune caustique, aucune
 * soie) ; la sidebar et l'en-tête flottent en panneaux de verre
 * radius 20 posés à l'ombre mauve, tenus par des filets d'encre à
 * six pour cent. L'item actif se pose en verre blanc — pas de
 * pilule encre ici : la hiérarchie reste sous le dashboard.
 */

const navItems = [
  { href: '/admin/overview', label: "Vue d'ensemble" },
  { href: '/admin/users', label: 'Utilisateurs' },
  { href: '/admin/security-alerts', label: 'Sécurité' },
  { href: '/admin/neva-design', label: 'Portfolio' },
  { href: '/admin/announcements', label: 'Annonces' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/maintenance', label: 'Maintenance' },
  { href: '/admin/admins', label: 'Admins' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await backendGetJson<{ email: string }>('/admin/verify')
  if (!admin) redirect('/dashboard')

  return (
    <div className="pv-light pv-atelier relative min-h-screen bg-paper text-ink">
      <style>{`html{color-scheme:light}`}</style>
      {/* La scène de la régie — l'aube diluée, fixe, et rien d'autre */}
      <div aria-hidden className="pv-scene-bg--dawn-calm pointer-events-none fixed inset-0" />

      {/* ── Sidebar desktop — panneau de verre flottant ────────── */}
      <aside className="pv-glass pv-glass--card pv-edge pv-shadow-mauve fixed bottom-4 left-4 top-4 z-50 hidden w-[264px] flex-col overflow-hidden lg:flex">
        <div className="relative flex h-[72px] shrink-0 items-center border-b border-[rgba(43,36,80,0.06)] px-6">
          <Brand href="/admin" size={20} tone="ink" sub="Console" />
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3.5 py-5" aria-label="Navigation de la console">
          <AdminSidebarNav items={navItems} />
        </nav>

        <div className="relative border-t border-[rgba(43,36,80,0.06)] p-3.5">
          <Link
            href="/dashboard"
            className="group flex h-10 items-center gap-3 rounded-[12px] px-3.5 text-[13px] text-slate transition-colors duration-[var(--dur-base)] hover:bg-[rgba(255,255,255,0.5)] hover:text-ink"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.8}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Retour au produit
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[296px]">
        {/* ── En-tête — barre de verre flottante, session à droite ─ */}
        <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-10">
          <div className="pv-glass pv-glass--card pv-edge pv-shadow-mauve mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 lg:hidden">
                <BrandMark size={20} tone="ink" />
              </span>
              <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                Neva Design — Console
              </p>
            </div>
            <p className="flex min-w-0 shrink-0 items-center gap-2 rounded-full border border-[color:var(--hairline-glass)] bg-white/60 px-4 py-2 font-mono text-[11px] tracking-[0.06em] text-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_6px_16px_rgba(96,84,140,0.1)]">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
              <span className="max-w-[130px] truncate sm:max-w-[240px]">{admin.email}</span>
            </p>
          </div>
        </header>

        {/* ── Nav mobile — rail horizontal sur la scène ─────────── */}
        <nav
          className="border-b border-[rgba(43,36,80,0.06)] px-4 pb-3 pt-4 lg:hidden"
          aria-label="Navigation de la console"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            <AdminRailNav items={navItems} />
            <Link
              href="/dashboard"
              className="flex h-10 shrink-0 items-center gap-2 rounded-[12px] border border-[rgba(43,36,80,0.1)] px-4 text-xs text-slate transition-colors duration-[var(--dur-base)] hover:bg-[rgba(255,255,255,0.45)] hover:text-ink"
            >
              <ArrowLeft size={12} strokeWidth={1.8} />
              Retour au produit
            </Link>
          </div>
        </nav>

        {/* ── Contenu — posé nu sur la scène ────────────────────── */}
        <main className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}
