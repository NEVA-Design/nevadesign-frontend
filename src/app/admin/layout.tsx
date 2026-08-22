import '@/components/dashboard/dashboard-skin.css'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  { href: '/admin/test-moteur', label: 'Test moteur' },
  { href: '/admin/announcements', label: 'Annonces' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/maintenance', label: 'Maintenance' },
  { href: '/admin/admins', label: 'Admins' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await backendGetJson<{
    email: string
    displayName: string | null
    avatarUrl: string | null
  }>('/admin/verify')
  if (!admin) redirect('/dashboard')

  const adminLabel = admin.displayName || admin.email

  return (
    <div className="pv-light pv-atelier relative min-h-screen text-ink">
      <style>{`html{color-scheme:dark}`}</style>
      {/* La scène de la régie — l'aube diluée, fixe, et rien d'autre */}
      <div aria-hidden className="pv-scene-bg--dawn-calm pointer-events-none fixed inset-0" />

      {/* ── Sidebar desktop — panneau de verre flottant ────────── */}
      <aside className="pv-glass pv-glass--card pv-edge pv-shadow-mauve fixed bottom-4 left-4 top-4 z-50 hidden w-[264px] flex-col overflow-hidden lg:flex">
        <div className="relative flex h-[72px] shrink-0 items-center border-b border-[rgba(255,255,255,0.06)] px-6">
          <Brand href="/admin" size={20} tone="white" sub="Console" />
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3.5 py-5" aria-label="Navigation de la console">
          <AdminSidebarNav items={navItems} />
        </nav>

        <div className="relative border-t border-[rgba(255,255,255,0.06)] p-3.5">
          <Link
            href="/dashboard"
            className="group flex h-10 items-center gap-3 rounded-[12px] px-3.5 text-[13px] text-slate transition-colors duration-[var(--dur-base)] hover:bg-[rgba(255,255,255,0.05)] hover:text-ink"
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
                <BrandMark size={20} tone="white" />
              </span>
              <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                Neva Design — Console
              </p>
            </div>
            <p className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-full border border-[color:var(--hairline-glass)] bg-white/[0.05] py-1.5 pl-1.5 pr-4 font-mono text-[11px] tracking-[0.06em] text-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_6px_16px_rgba(0,0,0,0.4)]">
              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-ink">
                {admin.avatarUrl ? (
                  <Image src={admin.avatarUrl} alt="" fill sizes="28px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[color:var(--color-noir-2)]">
                    <svg viewBox="0 0 1441 1000" className="h-3 w-auto" fill="none" stroke="rgba(244,242,238,0.6)" strokeWidth="44" aria-hidden>
                      <path d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" />
                      <path d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" />
                    </svg>
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="max-w-[130px] truncate text-[11.5px] font-medium normal-case tracking-normal text-ink sm:max-w-[220px]">
                  {adminLabel}
                </span>
                <span className="flex items-center gap-1.5 text-[9.5px] text-mist">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                  {adminLabel === admin.email ? 'Connecté' : admin.email}
                </span>
              </span>
            </p>
          </div>
        </header>

        {/* ── Nav mobile — rail horizontal sur la scène ─────────── */}
        <nav
          className="border-b border-[rgba(255,255,255,0.06)] px-4 pb-3 pt-4 lg:hidden"
          aria-label="Navigation de la console"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            <AdminRailNav items={navItems} />
            <Link
              href="/dashboard"
              className="flex h-10 shrink-0 items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.10)] px-4 text-xs text-slate transition-colors duration-[var(--dur-base)] hover:bg-[rgba(255,255,255,0.05)] hover:text-ink"
            >
              <ArrowLeft size={12} strokeWidth={1.8} />
              Retour au produit
            </Link>
          </div>
        </nav>

        {/* ── Contenu — posé nu sur la scène, sous le champ de
            lumière aurore de la zone de travail ──────────────────── */}
        <main className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div aria-hidden className="pv-field-light pv-field-light--tr" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
