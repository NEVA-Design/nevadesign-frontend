import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  BarChart3,
  Images,
  LayoutDashboard,
  Mail,
  Megaphone,
  Shield,
  UserPlus,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { verifyAdmin } from '@/lib/admin'

const navItems = [
  { href: '/admin/overview', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/security-alerts', label: 'Security', icon: AlertTriangle },
  { href: '/admin/neva-design', label: 'Generations', icon: Images },
  { href: '/admin/announcements', label: 'Growth', icon: Megaphone },
  { href: '/admin/newsletter', label: 'Revenue', icon: Mail },
  { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/admin/admins', label: 'Admins', icon: UserPlus },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await verifyAdmin()
  if (!admin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F0E8]">
      <aside className="fixed inset-y-0 left-0 hidden w-[264px] border-r border-white/[0.08] bg-[#080808] lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FF7B4B]/25 bg-[#FF7B4B]/10 text-[#FF7B4B]">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-[#F8F3EA]">Neva Control</div>
            <div className="text-[11px] text-[#777]">SaaS command center</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#8C8780] transition-colors hover:bg-white/[0.045] hover:text-[#F5F0E8]"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3 text-sm text-[#A9A39B] transition-colors hover:bg-white/[0.05] hover:text-[#F5F0E8]"
          >
            <LayoutDashboard size={16} />
            Back to product
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#FFD166] lg:hidden">
                <Shield size={17} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F8F3EA]">Business health</div>
                <div className="text-xs text-[#777]">Revenue, usage, conversion and abuse detection</div>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-[#777] sm:flex">
              <Zap size={13} className="text-[#55D18A]" />
              <span>{admin.email}</span>
            </div>
          </div>
        </header>

        <div className="border-b border-white/[0.08] bg-[#080808] px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-[#A9A39B]">
                <item.icon size={13} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <main className="mx-auto max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
