import { AlertTriangle } from 'lucide-react'
import { DEFAULT_MAINTENANCE, isMaintenanceActive, type MaintenanceMode } from '@/lib/maintenance'
import { createServiceClient } from '@/lib/supabase/server'

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

export default async function MaintenancePage() {
  const maintenance = await getMaintenance()
  const active = isMaintenanceActive(maintenance)

  return (
    <main className="min-h-screen bg-[#080808] text-[#F5F0E8]">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF7B4B]/25 bg-[#FF7B4B]/10">
          <AlertTriangle size={30} className="text-[#FF7B4B]" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF7B4B]">Neva AI</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {active ? maintenance.title : 'Maintenance terminee'}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-[#9A9A9A]">
          {active ? maintenance.message : 'Le site est de nouveau disponible. Tu peux revenir sur Neva AI.'}
        </p>
      </div>
    </main>
  )
}
