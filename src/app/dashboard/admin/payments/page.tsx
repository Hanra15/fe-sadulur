'use client'

import { useState } from 'react'
import { paymentService } from '@/services/paymentService'
import { Payment } from '@/types'
import { formatCurrency, formatDate } from '@/utils'
import { Search, CreditCard } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-slate-100 text-slate-600',
}

export default function AdminPaymentsPage() {
  const [bookingId, setBookingId] = useState('')
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingId.trim()) return
    setLoading(true); setPayment(null); setNotFound(false); setError('')
    try {
      const res = await paymentService.getByBookingId(bookingId)
      const data = (res as never as { data: Payment | null }).data
      if (data) setPayment(data)
      else setNotFound(true)
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } }
      if (err?.response?.status === 404) setNotFound(true)
      else setError('Gagal mengambil data pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-800">Pembayaran</h1>
        <p className="text-xs text-slate-400">Cari status pembayaran berdasarkan ID Booking</p>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 flex gap-3">
        <CreditCard size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-0.5">Cara kerja pembayaran manual</p>
          <p className="text-xs text-amber-700">Pembayaran dicatat secara manual per booking. Masukkan ID Booking untuk melihat status pembayarannya. Untuk update status booking, gunakan halaman <a href="/dashboard/admin/bookings" className="underline">Booking</a>.</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-100 p-5 mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">Cari berdasarkan ID Booking</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={bookingId}
            onChange={e => setBookingId(e.target.value)}
            placeholder="Masukkan ID Booking (contoh: 12)"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition">
            <Search size={15} />
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      </form>

      {/* Result */}
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
      {notFound && <div className="bg-slate-50 text-slate-500 px-4 py-8 rounded-2xl text-sm text-center">Belum ada data pembayaran untuk booking ini.</div>}
      {payment && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800">Detail Pembayaran #{payment.id}</h2>
              <p className="text-xs text-slate-400">Booking #{payment.booking_id}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[payment.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {payment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Jumlah</div>
              <div className="font-semibold text-slate-800">{formatCurrency(payment.amount)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Metode</div>
              <div className="text-slate-700">{payment.method ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Tanggal Bayar</div>
              <div className="text-slate-700">{payment.paid_at ? formatDate(payment.paid_at) : '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Dibuat</div>
              <div className="text-slate-700">{payment.created_at ? formatDate(payment.created_at) : '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
