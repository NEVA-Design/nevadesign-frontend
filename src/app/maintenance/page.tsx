import Link from 'next/link'
import type { Metadata } from 'next'
import { DEFAULT_MAINTENANCE, isMaintenanceActive, type MaintenanceMode } from '@/lib/maintenance'
import { backendGetJson } from '@/lib/api/backend-server'
import { BrandMark } from '@/components/prisme/Brand'
import SatinSphere from '@/components/givre/SatinSphere'
import { Button } from '@/components/ui/button'

/* Cible du 307 de maintenance : ne doit jamais s'indexer à la
   place des vraies pages (run 3, LOT 5). */
export const metadata: Metadata = {
  title: 'Maintenance en cours',
  robots: {
    index: false,
    follow: false,
  },
}

async function getMaintenance() {
  const data = await backendGetJson<{ maintenance: MaintenanceMode }>('/maintenance')
  return data?.maintenance ?? DEFAULT_MAINTENANCE
}

/*
 * Maintenance — une scène de marque, pas un panneau d'erreur.
 * Le studio a baissé la lumière mais elle respire encore : l'aube
 * calme dérive derrière le cadre éditorial, le monogramme reste
 * allumé, le message vient de la base. Pas de carte : le contenu
 * se pose nu au centre de la scène.
 */
export default async function MaintenancePage() {
  const maintenance = await getMaintenance()
  const active = isMaintenanceActive(maintenance)

  return (
    <main className="pv-scene relative flex min-h-[100svh] flex-col text-ink">
      {/* La scène — aube calme, caustiques, rais de fenêtre discrets,
          le halo aurore et la sphère satinée : la composition du
          rideau, identique que la maintenance soit en cours ou
          terminée (D45). */}
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-windowlight absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(34% 42% at 36% 28%, rgba(164,139,232,0.22) 0%, rgba(164,139,232,0) 70%), radial-gradient(30% 38% at 64% 66%, rgba(239,184,148,0.2) 0%, rgba(239,184,148,0) 72%)',
        }}
      />
      <SatinSphere
        size={140}
        className="pointer-events-none absolute right-[10%] top-[14%] hidden lg:block"
      />

      {/* Cadre éditorial — la page comme objet imprimé */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[24px] border border-[rgba(255,255,255,0.55)]"
        style={{ inset: 'var(--frame-inset)' }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-24 text-center sm:px-8">
        <div className="pv-fade-up" style={{ animationDelay: '0.05s' }}>
          <BrandMark size={36} tone="ink" />
        </div>

        <p
          className="pv-fade-up mt-9 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist"
          style={{ animationDelay: '0.15s' }}
        >
          {active ? 'Interlude technique' : 'De retour en ligne'}
        </p>

        <h1
          className="pv-display pv-fade-up mt-5 text-balance text-[clamp(2.1rem,6.5vw,3.5rem)]"
          style={{ animationDelay: '0.25s' }}
        >
          {active ? (
            maintenance.title
          ) : (
            <>
              Maintenance <span className="font-medium text-ink">terminée.</span>
            </>
          )}
        </h1>

        <p
          className="pv-fade-up mt-6 max-w-lg text-[15px] leading-[1.8] text-slate"
          style={{ animationDelay: '0.38s' }}
        >
          {active
            ? maintenance.message
            : 'Le site est de nouveau disponible. Vous pouvez revenir sur Neva Design.'}
        </p>

        {/* Filet discret — l'encre respire, pas de spectre ici */}
        <hr
          className="pv-rule pv-fade-up mt-10 w-[min(280px,64vw)]"
          style={{ animationDelay: '0.5s' }}
        />

        {active ? (
          <p
            className="pv-fade-up mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-mist sm:text-[11px] sm:tracking-[0.16em]"
            style={{ animationDelay: '0.62s' }}
          >
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="pv-breathe absolute -inset-1 rounded-full bg-info/40 blur-[3px]" />
              <span className="relative h-2 w-2 rounded-full bg-info" />
            </span>
            Intervention en cours · Retour très vite
          </p>
        ) : (
          <div className="pv-fade-up mt-9" style={{ animationDelay: '0.62s' }}>
            <Link href="/">
              <Button variant="primary" size="lg" className="pv-btn">
                Revenir sur Neva Design
              </Button>
            </Link>
          </div>
        )}
      </div>

      <p
        className="absolute left-1/2 z-10 w-max -translate-x-1/2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist"
        style={{ bottom: 'calc(var(--frame-inset) + 18px)' }}
      >
        Neva Design · Studio créatif IA
      </p>
    </main>
  )
}
