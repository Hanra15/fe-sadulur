'use client'

import { useEffect, useState } from 'react'
import { bookingService } from '@/services/bookingService'
import { villaService } from '@/services/villaService'
import { Booking } from '@/types'
import { formatCurrency } from '@/utils'
import { BarChart3, TrendingUp, Building2, CalendarCheck, DollarSign, Clock } from 'lucide-react'

interface ReportData {
  totalVilla: number
  totalBooking: number
  byStatus: Record<string, number>
  estimatedRevenue: number
  recentBookings: Booking[]
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [villasRes, bookingsRes] = await Promise.all([
          villaService.getAll({ limit: 1 } as never),
          bookingService.getAllBookings({ limit: 100 }),
        ])

        const bookingList = (bookingsRes as never as { data: Booking[] }).data ?? []
        const totalVilla = (villasRes as never as { pagination?: { total: number }; total?: number }).pagination?.total ?? 0

        const byStatus: Record<string, number> = {}
        let revenue = 0
        for (const b of bookingList) {
          byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
          if (b.status === 'paid' && b.villaPrice) revenue += b.villaPrice
        }

        setData({
          totalVilla,
          totalBooking: (bookingsRes as never as { pagination?: { total: number }; total?: number }).pagination?.total ?? bookingList.length,
          byStatus,
          estimatedRevenue: revenue,
          recentBookings: bookingList.slice(0, 8),
        })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Memuat laporan...</div>
  )
  if (!data) return null

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu', color: 'bg-amber-400' },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-400' },
    paid: { label: 'Dibayar', color: 'bg-green-500' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-400' },
  }

  const stats = [
    { label: 'Total Villa', value: data.totalVilla, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Booking', value: data.totalBooking, icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Estimasi Pendapatan', value: formatCurrency(data.estimatedRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Booking Pending', value: data.byStatus['pending'] ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-purple-50 rounded-xl"><BarChart3 size={20} className="text-purple-600" /></div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Laporan & Statistik</h1>
          <p className="text-xs text-slate-400">Ringkasan data sistem Villa Sadulur</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Status Breakdown */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-slate-500" />
            <h2 className="font-semibold text-slate-700 text-sm">Booking per Status</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(statusLabels).map(([key, { label, color }]) => {
              const count = data.byStatus[key] ?? 0
              const pct = data.totalBooking > 0 ? Math.round((count / data.totalBooking) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-slate-500" />
            <h2 className="font-semibold text-slate-700 text-sm">Ringkasan Pendapatan</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Booking Dibayar</span>
              <span className="font-semibold text-green-600">{data.byStatus['paid'] ?? 0} booking</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Estimasi Pendapatan</span>
              <span className="font-bold text-slate-800">{formatCurrency(data.estimatedRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Booking Dibatalkan</span>
              <span className="text-red-500">{data.byStatus['cancelled'] ?? 0} booking</span>
            </div>
            <div className="h-px bg-slate-100 my-2" />
            <p className="text-xs text-slate-400">* Pendapatan dihitung dari booking berstatus &quot;Dibayar&quot; × harga villa saat booking.</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700 text-sm">Booking Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-4 py-2.5">Tamu</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">Villa</th>
                <th className="text-right px-4 py-2.5 hidden sm:table-cell">Harga</th>
                <th className="text-center px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-xs">Belum ada booking</td></tr>
              ) : data.recentBookings.map(b => (
                <tr key={b.id} className="border-t border-slate-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-700">{b.customerName}</div>
                    <div className="text-xs text-slate-400">{b.bookingCode ?? `#${b.id}`}</div>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-slate-500 text-xs max-w-[120px] truncate">{b.villaName ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right hidden sm:table-cell text-slate-700">{b.villaPrice ? formatCurrency(b.villaPrice) : '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.status === 'paid' ? 'bg-green-50 text-green-700' :
                      b.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                      b.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-700'
                    }`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
