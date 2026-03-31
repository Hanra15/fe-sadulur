'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { bookingService } from '@/services/bookingService'
import { Booking } from '@/types'
import { formatCurrency, calculateNights } from '@/utils'
import Link from 'next/link'
import { Search, CalendarCheck, MessageCircle, ChevronRight, Hash, Loader2, UserCircle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Menunggu', color: '#b45309', bg: '#fef3c7' },
  confirmed: { label: 'Dikonfirmasi', color: '#1d4ed8', bg: '#dbeafe' },
  paid:      { label: 'Lunas', color: '#15803d', bg: '#dcfce7' },
  cancelled: { label: 'Dibatalkan', color: '#b91c1c', bg: '#fee2e2' },
}

function BookingMiniCard({ booking }: { booking: Booking }) {
  const nights = booking.checkInDate && booking.checkOutDate
    ? calculateNights(booking.checkInDate, booking.checkOutDate) : 0
  const total = (booking.villaPrice ?? 0) * Math.max(nights, 0)
  const cfg = STATUS_CONFIG[booking.status] ?? { label: booking.status, color: '#64748b', bg: '#f1f5f9' }

  return (
    <Link href={`/dashboard/guest/bookings/${booking.id}`}>
      <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-xl px-1 transition">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
          <CalendarCheck size={16} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{booking.villaName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {booking.bookingCode && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Hash size={9} />{booking.bookingCode}
              </span>
            )}
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full text-[10px]" style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {total > 0 && <p className="text-xs font-bold" style={{ color: '#3A6928' }}>{formatCurrency(total)}</p>}
          <ChevronRight size={14} className="text-slate-300 ml-auto mt-0.5" />
        </div>
      </div>
    </Link>
  )
}

export default function GuestDashboard() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', 'all'],
    queryFn: () => bookingService.getMyBookings(),
  })

  if (!user) return null

  const bookings = data?.data ?? []
  const recent = bookings.slice(0, 4)
  const counts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    paid: bookings.filter(b => b.status === 'paid').length,
  }

  return (
    <div>
      {/* Greeting */}
      <div className="rounded-2xl p-5 text-white mb-5" style={{ background: 'linear-gradient(135deg, #3A6928 0%, #5C8A36 100%)' }}>
        <p className="text-slate-200 text-xs">Selamat datang kembali,</p>
        <h1 className="text-xl font-bold mt-0.5">{user.name}</h1>
        <p className="text-slate-200 text-xs mt-0.5">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Total', value: counts.total, color: '#64748b' },
          { label: 'Menunggu', value: counts.pending, color: '#b45309' },
          { label: 'Konfirmasi', value: counts.confirmed, color: '#1d4ed8' },
          { label: 'Lunas', value: counts.paid, color: '#15803d' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{isLoading ? '–' : s.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick menu */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { href: '/villas', icon: Search, label: 'Cari Villa', desc: 'Temukan penginapan', color: '#5C8A36' },
          { href: '/dashboard/guest/bookings', icon: CalendarCheck, label: 'Booking Saya', desc: 'Lihat riwayat', color: '#3b82f6' },
          { href: '/dashboard/guest/messages', icon: MessageCircle, label: 'Pesan', desc: 'Chat pengelola', color: '#8b5cf6' },
          { href: '/dashboard/guest/profile', icon: UserCircle, label: 'Profil', desc: 'Edit akun saya', color: '#f59e0b' },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition text-center"
          >
            <item.icon size={24} style={{ color: item.color }} />
            <span className="font-semibold text-slate-700 text-xs">{item.label}</span>
            <span className="text-[10px] text-slate-400">{item.desc}</span>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700 text-sm">Booking Terbaru</h2>
          <Link href="/dashboard/guest/bookings" className="text-xs hover:underline" style={{ color: '#5C8A36' }}>
            Lihat semua →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin" style={{ color: '#5C8A36' }} />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <CalendarCheck size={36} className="mx-auto mb-2 text-slate-200" />
            Belum ada booking.{' '}
            <Link href="/villas" className="hover:underline font-medium" style={{ color: '#5C8A36' }}>
              Cari villa sekarang
            </Link>
          </div>
        ) : (
          <div>
            {recent.map(b => <BookingMiniCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
