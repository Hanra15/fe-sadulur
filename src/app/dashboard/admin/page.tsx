'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Users, Building2, CalendarCheck, CreditCard, ShieldCheck, LogOut, BarChart3 } from 'lucide-react'

const menuItems = [
  { href: '/dashboard/admin/users', icon: <Users size={28} className="text-emerald-500" />, label: 'Manajemen User', desc: 'Kelola pengunjung & pengelola' },
  { href: '/dashboard/admin/villas', icon: <Building2 size={28} className="text-blue-500" />, label: 'Moderasi Villa', desc: 'Review & approve villa' },
  { href: '/dashboard/admin/bookings', icon: <CalendarCheck size={28} className="text-indigo-500" />, label: 'Semua Booking', desc: 'Monitor semua pemesanan' },
  { href: '/dashboard/admin/payments', icon: <CreditCard size={28} className="text-amber-500" />, label: 'Transaksi', desc: 'Monitor pembayaran' },
  { href: '/dashboard/admin/reports', icon: <BarChart3 size={28} className="text-purple-500" />, label: 'Laporan', desc: 'Statistik & laporan' },
  { href: '/dashboard/admin/settings', icon: <ShieldCheck size={28} className="text-rose-500" />, label: 'Pengaturan', desc: 'Konfigurasi sistem' },
]

export default function AdminDashboard() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (!isAdmin) router.push('/login')
  }, [isLoggedIn, isAdmin, router])

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-500 rounded-2xl p-6 text-white mb-8 flex items-center justify-between">
        <div>
          <p className="text-purple-100 text-sm">Super Admin Panel</p>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-purple-100 text-sm mt-1">{user.email}</p>
        </div>
        <div className="p-4 bg-white/20 rounded-full">
          <ShieldCheck size={36} />
        </div>
      </div>

      {/* Stats Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Villa', value: '—', color: 'text-blue-600' },
          { label: 'Total User', value: '—', color: 'text-emerald-600' },
          { label: 'Booking Aktif', value: '—', color: 'text-indigo-600' },
          { label: 'Transaksi', value: '—', color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="p-3 bg-slate-50 rounded-xl">{item.icon}</div>
            <div>
              <div className="font-semibold text-slate-700">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <button onClick={logout} className="mt-8 flex items-center gap-2 text-red-500 hover:text-red-700 transition text-sm">
        <LogOut size={15} /> Keluar
      </button>
    </div>
  )
}
