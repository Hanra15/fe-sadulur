'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, CalendarCheck, CreditCard, Users, ShieldCheck, Clock, CheckCircle, XCircle } from 'lucide-react'
import { villaService } from '@/services/villaService'
import { bookingService } from '@/services/bookingService'

interface Stats {
  totalVilla: number
  totalBooking: number
  pendingBooking: number
  paidBooking: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ totalVilla: 0, totalBooking: 0, pendingBooking: 0, paidBooking: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [villas, allBookings, pendingB, paidB] = await Promise.all([
          villaService.getAll({ limit: 1 } as never),
          bookingService.getAllBookings({ limit: 1 }),
          bookingService.getAllBookings({ status: 'pending', limit: 1 }),
          bookingService.getAllBookings({ status: 'paid', limit: 1 }),
        ])
        setStats({
          totalVilla: (villas as never as { pagination?: { total: number }; total?: number }).pagination?.total ?? (villas as never as { total?: number }).total ?? 0,
          totalBooking: (allBookings as never as { pagination?: { total: number }; total?: number }).pagination?.total ?? (allBookings as never as { total?: number }).total ?? 0,
          pendingBooking: (pendingB as never as { pagination?: { total: number }; total?: number }).pagination?.total ?? (pendingB as never as { total?: number }).total ?? 0,
          paidBooking: (paidB as never as { pagination?: { total: number }; total?: number }).pagination?.total ?? (paidB as never as { total?: number }).total ?? 0,
        })
      } catch {
        // stats tetap 0 jika gagal
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    { label: 'Total Villa', value: stats.totalVilla, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/admin/villas' },
    { label: 'Total Booking', value: stats.totalBooking, icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/dashboard/admin/bookings' },
    { label: 'Menunggu Konfirmasi', value: stats.pendingBooking, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/dashboard/admin/bookings?status=pending' },
    { label: 'Sudah Dibayar', value: stats.paidBooking, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', href: '/dashboard/admin/bookings?status=paid' },
  ]

  const menuItems = [
    { href: '/dashboard/admin/villas', icon: Building2, label: 'Moderasi Villa', desc: 'Tambah, edit, dan hapus villa', color: 'text-blue-500' },
    { href: '/dashboard/admin/bookings', icon: CalendarCheck, label: 'Semua Booking', desc: 'Monitor & ubah status pemesanan', color: 'text-indigo-500' },
    { href: '/dashboard/admin/payments', icon: CreditCard, label: 'Pembayaran', desc: 'Monitor status pembayaran', color: 'text-amber-500' },
    { href: '/dashboard/admin/users', icon: Users, label: 'Pengguna', desc: 'Kelola pengunjung & pengelola', color: 'text-green-600' },
    { href: '/dashboard/admin/reports', icon: CheckCircle, label: 'Laporan', desc: 'Statistik & ringkasan data', color: 'text-purple-500' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-500 rounded-2xl p-5 text-white mb-6 flex items-center justify-between">
        <div>
          <p className="text-purple-100 text-xs">Super Admin Panel</p>
          <h1 className="text-xl font-bold">{user?.name}</h1>
          <p className="text-purple-100 text-xs mt-0.5">{user?.email}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-full">
          <ShieldCheck size={28} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((s, i) => (
          <Link key={i} href={s.href} className="bg-white border border-slate-100 rounded-2xl p-4 text-center hover:shadow-md transition">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>
              {loading ? '...' : s.value}
            </div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="p-3 bg-slate-50 rounded-xl">
              <item.icon size={24} className={item.color} />
            </div>
            <div>
              <div className="font-semibold text-slate-700 text-sm">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
