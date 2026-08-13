import Link from 'next/link'
import { DEFAULT_MAINTENANCE, isMaintenanceActive, type MaintenanceMode } from '@/lib/maintenance'
import { createServiceClient } from '@/lib/supabase/server'
import { BrandMark } from '@/components/prisme/Brand'
import { Button } from '@/components/ui/button'

async function getMaintenance() {
  try {
    const service = await createServiceClient()
    const { data } = await service
      .from('site_maintenance')
      .select('*')
      .eq('id', 'global')
      .maybeSingle()

    return (data ?? DEFAULT_MAINTENANCE) as MaintenanceMode
  } catch {
    return DEFAULT_MAINTENANCE
  }
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
      {/* La scène — aube calme, caustiques, rais de fenêtre discrets */}
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-windowlight absolute inset-0 opacity-60" />

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
