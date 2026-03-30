'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, Users, Building2, CalendarCheck,
  CreditCard, BarChart3, ShieldCheck, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/dashboard/admin/villas', icon: Building2, label: 'Villa' },
  { href: '/dashboard/admin/bookings', icon: CalendarCheck, label: 'Booking' },
  { href: '/dashboard/admin/payments', icon: CreditCard, label: 'Pembayaran' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Pengguna' },
  { href: '/dashboard/admin/reports', icon: BarChart3, label: 'Laporan' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (!isAdmin) router.push('/login')
  }, [isLoggedIn, isAdmin, router])

  if (!user) return null

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const Sidebar = () => (
    <>
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-purple-600" />
          <span className="font-bold text-slate-800 text-sm">Admin Panel</span>
        </div>
        <div className="text-xs text-slate-400 mt-1 truncate">{user.name}</div>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition ${
              isActive(item.href, item.exact)
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon size={15} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm w-full px-3 py-2 rounded-lg hover:bg-red-50 transition"
        >
          <LogOut size={14} /> Keluar
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-52 bg-white border-r border-slate-200 min-h-screen fixed top-0 left-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col md:ml-52">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-purple-600" />
            <span className="font-bold text-slate-800 text-sm">Admin Panel</span>
          </div>
          <button onClick={() => setOpen(!open)} className="text-slate-600">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {open && (
          <div className="md:hidden bg-white border-b border-slate-200 flex flex-col">
            <Sidebar />
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
