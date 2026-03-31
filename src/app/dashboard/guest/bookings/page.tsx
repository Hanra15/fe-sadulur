'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { bookingService } from '@/services/bookingService'
import { Booking } from '@/types'
import { formatCurrency, formatDate, calculateNights } from '@/utils'
import { CalendarCheck, AlertCircle, Loader2, ChevronRight, Hash, MapPin, Calendar } from 'lucide-react'

type Status = 'all' | 'pending' | 'confirmed' | 'paid' | 'cancelled'

const TABS: { key: Status; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'confirmed', label: 'Dikonfirmasi' },
  { key: 'paid', label: 'Lunas' },
  { key: 'cancelled', label: 'Dibatalkan' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Menunggu',      color: '#b45309', bg: '#fef3c7' },
  confirmed: { label: 'Dikonfirmasi',  color: '#1d4ed8', bg: '#dbeafe' },
  paid:      { label: 'Lunas',         color: '#15803d', bg: '#dcfce7' },
  cancelled: { label: 'Dibatalkan',    color: '#b91c1c', bg: '#fee2e2' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#64748b', bg: '#f1f5f9' }
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const nights = booking.checkInDate && booking.checkOutDate
    ? calculateNights(booking.checkInDate, booking.checkOutDate)
    : 0
  const total = (booking.villaPrice ?? 0) * Math.max(nights, 0)

  return (
    <Link href={`/dashboard/guest/bookings/${booking.id}`}>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:border-slate-200 transition cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{booking.villaName ?? 'Villa'}</p>
            {booking.villaLocation && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={10} /> {booking.villaLocation}
              </p>
            )}
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
          {booking.checkInDate && booking.checkOutDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(booking.checkInDate)} — {formatDate(booking.checkOutDate)}
              {nights > 0 && <span className="text-slate-400">({nights} malam)</span>}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {booking.bookingCode && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Hash size={10} /> {booking.bookingCode}
              </p>
            )}
            {total > 0 && (
              <p className="text-sm font-bold mt-0.5" style={{ color: '#3A6928' }}>
                {formatCurrency(total)}
              </p>
            )}
          </div>
          <ChevronRight size={16} className="text-slate-300 shrink-0" />
        </div>
      </div>
    </Link>
  )
}

export default function GuestBookingsPage() {
  const [activeTab, setActiveTab] = useState<Status>('all')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-bookings', activeTab],
    queryFn: () => bookingService.getMyBookings(activeTab !== 'all' ? { status: activeTab } : undefined),
  })

  const bookings = data?.data ?? []

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-800">Booking Saya</h1>
        <p className="text-xs text-slate-400">Riwayat dan status pemesanan villa Anda</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition"
            style={activeTab === tab.key
              ? { background: '#5C8A36', color: '#fff' }
              : { background: '#f1f5f9', color: '#64748b' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 size={32} className="animate-spin" style={{ color: '#5C8A36' }} />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center py-12 text-slate-400 gap-2">
          <AlertCircle size={32} className="text-red-300" />
          <p className="text-sm">Gagal memuat booking. Coba lagi.</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <CalendarCheck size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">
            {activeTab === 'all' ? 'Belum ada booking.' : `Tidak ada booking ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()}.`}
          </p>
          <Link href="/villas" className="mt-3 inline-block text-xs font-medium hover:underline" style={{ color: '#5C8A36' }}>
            Cari villa sekarang →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}
    </div>
  )
}
