'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { PlusCircle, Building2, CalendarCheck, MessageCircle } from 'lucide-react'

export default function OwnerDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div>
      {/* Greeting */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-400 rounded-2xl p-5 text-white mb-5 animate-fadeInDown">
        <p className="text-blue-100 text-xs">Dashboard Pengelola</p>
        <h1 className="text-xl font-bold mt-0.5">{user.name}</h1>
        <p className="text-blue-100 text-xs mt-0.5">{user.email}</p>
      </div>

      {/* Quick Menu */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { href: '/dashboard/owner/villas/add', icon: PlusCircle, label: 'Posting Villa', desc: 'Tambah villa baru', color: '#5C8A36' },
          { href: '/dashboard/owner/villas', icon: Building2, label: 'Villa Saya', desc: 'Kelola daftar villa', color: '#3b82f6' },
          { href: '/dashboard/owner/bookings', icon: CalendarCheck, label: 'Booking', desc: 'Lihat pemesanan', color: '#6366f1' },
          { href: '/dashboard/owner/messages', icon: MessageCircle, label: 'Pesan', desc: 'Chat dengan tamu', color: '#8b5cf6' },
        ].map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-1.5 hover:shadow-md transition text-center animate-fadeInUp"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <item.icon size={24} style={{ color: item.color }} />
            <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
            <span className="text-xs text-slate-400">{item.desc}</span>
          </Link>
        ))}
      </div>

      {/* Villa placeholder */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fadeIn delay-400">
        <h2 className="font-semibold text-slate-700 mb-4 text-sm">Villa Terdaftar</h2>
        <div className="text-center py-8 text-slate-400 text-sm">
          <Building2 size={36} className="mx-auto mb-2 text-slate-200" />
          Belum ada villa.{' '}
          <Link href="/dashboard/owner/villas/add" className="text-blue-600 hover:underline font-medium">
            Posting villa pertamamu
          </Link>
        </div>
      </div>
    </div>
  )
}
