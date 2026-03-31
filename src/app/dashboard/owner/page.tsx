'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { villaService } from '@/services/villaService'
import { bookingService } from '@/services/bookingService'
import { Villa, Booking } from '@/types'
import { formatCurrency, formatDate } from '@/utils'
import Link from 'next/link'
import {
  Building2, CalendarCheck, Clock, CheckCircle2,
  Plus, TrendingUp, Users,
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Menunggu',   color: 'bg-amber-50 text-amber-700' },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-700' },
  paid:      { label: 'Lunas',      color: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-600' },
}

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [villas, setVillas] = useState<Villa[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      villaService.getAll({ limit: 100 } as never),
      bookingService.getAllBookings({ limit: 100 }),
    ]).then(([vRes, bRes]) => {
      const myVillas = (vRes.data ?? []).filter(v => String(v.owner_id) === String(user.id))
      setVillas(myVillas)
      setBookings(bRes.data ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const totalRevenue = bookings
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0)
  const recent = bookings.slice(0, 6)

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-5 text-white">
        <p className="text-blue-100 text-xs">Dashboard Pengelola</p>
        <h1 className="text-xl font-bold mt-0.5">{user?.name}</h1>
        <p className="text-blue-100 text-xs mt-0.5">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Building2,    label: 'Villa Saya',    value: loading ? '—' : String(villas.length),         color: '#3b82f6', bg: '#eff6ff' },
          { icon: Clock,        label: 'Booking Baru',  value: loading ? '—' : String(pendingCount),          color: '#f59e0b', bg: '#fffbeb' },
          { icon: CheckCircle2, label: 'Dikonfirmasi',  value: loading ? '—' : String(confirmedCount),        color: '#6366f1', bg: '#eef2ff' },
          { icon: TrendingUp,   label: 'Total Lunas',   value: loading ? '—' : formatCurrency(totalRevenue),  color: '#10b981', bg: '#ecfdf5' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div className="text-base font-bold text-slate-800 truncate">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/owner/villas" className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-700 text-sm">Villa Saya</div>
            <div className="text-xs text-slate-400">Kelola daftar villa</div>
          </div>
        </Link>
        <Link href="/dashboard/owner/bookings" className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <CalendarCheck size={18} className="text-indigo-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-700 text-sm">Booking</div>
            <div className="text-xs text-slate-400">{pendingCount} perlu konfirmasi</div>
          </div>
        </Link>
      </div>

      {/* My Villas */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
          <h2 className="font-semibold text-slate-700 text-sm">Villa Saya</h2>
          <Link href="/dashboard/owner/villas" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Plus size={12} /> Tambah
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
        ) : villas.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <Building2 size={32} className="mx-auto mb-2 text-slate-200" />
            Belum ada villa.{' '}
            <Link href="/dashboard/owner/villas" className="text-blue-600 hover:underline">Tambah villa</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {villas.map(v => (
              <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-700 text-sm">{v.name}</div>
                  <div className="text-xs text-slate-400">{v.location} · {formatCurrency(v.price)}/malam</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                  {v.available ? 'Tersedia' : 'Tutup'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
          <h2 className="font-semibold text-slate-700 text-sm">Booking Terbaru</h2>
          <Link href="/dashboard/owner/bookings" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <Users size={32} className="mx-auto mb-2 text-slate-200" />
            Belum ada booking masuk
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map(b => (
              <div key={b.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-slate-700 text-sm truncate">{b.customerName}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {b.villaName} · {b.checkInDate ? formatDate(b.checkInDate) : '—'}
                  </div>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[b.status]?.color}`}>
                  {STATUS_CONFIG[b.status]?.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
