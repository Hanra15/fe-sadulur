'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Search, CalendarCheck, MessageCircle } from 'lucide-react'

export default function GuestDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div>
      {/* Greeting */}
      <div className="rounded-2xl p-5 text-white mb-5 animate-fadeInDown" style={{ background: 'linear-gradient(135deg, #3A6928 0%, #5C8A36 100%)' }}>
        <p className="text-slate-200 text-xs">Selamat datang kembali,</p>
        <h1 className="text-xl font-bold mt-0.5">{user.name}</h1>
        <p className="text-slate-200 text-xs mt-0.5">{user.email}</p>
      </div>

      {/* Quick Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { href: '/villas', icon: Search, label: 'Cari Villa', desc: 'Temukan penginapan impianmu', color: '#5C8A36' },
          { href: '/dashboard/guest/bookings', icon: CalendarCheck, label: 'Booking Saya', desc: 'Lihat riwayat pemesanan', color: '#3b82f6' },
          { href: '/dashboard/guest/messages', icon: MessageCircle, label: 'Pesan', desc: 'Chat dengan pengelola', color: '#8b5cf6' },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition text-center animate-fadeInUp"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <item.icon size={26} style={{ color: item.color }} />
            <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
            <span className="text-xs text-slate-400">{item.desc}</span>
          </Link>
        ))}
      </div>

      {/* Recent Bookings Placeholder */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fadeIn delay-300">
        <h2 className="font-semibold text-slate-700 mb-4 text-sm">Booking Terbaru</h2>
        <div className="text-center py-8 text-slate-400 text-sm">
          <CalendarCheck size={36} className="mx-auto mb-2 text-slate-200" />
          Belum ada booking.{' '}
          <Link href="/villas" className="hover:underline font-medium" style={{ color: '#5C8A36' }}>
            Cari villa sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}
