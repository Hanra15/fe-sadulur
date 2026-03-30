'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Search, CalendarCheck, MessageCircle, User, LogOut } from 'lucide-react'

export default function GuestDashboard() {
  const { user, isLoggedIn, isGuest, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (!isGuest) router.push('/login')
  }, [isLoggedIn, isGuest, router])

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl p-6 text-white mb-8 flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm">Selamat datang kembali,</p>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-emerald-100 text-sm mt-1">{user.email}</p>
        </div>
        <div className="p-4 bg-white/20 rounded-full">
          <User size={36} />
        </div>
      </div>

      {/* Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/villas" className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition text-center">
          <Search size={28} className="text-emerald-500" />
          <span className="font-semibold text-slate-700">Cari Villa</span>
          <span className="text-xs text-slate-400">Temukan penginapan impianmu</span>
        </Link>
        <Link href="/dashboard/guest/bookings" className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition text-center">
          <CalendarCheck size={28} className="text-blue-500" />
          <span className="font-semibold text-slate-700">Booking Saya</span>
          <span className="text-xs text-slate-400">Lihat riwayat pemesanan</span>
        </Link>
        <Link href="/dashboard/guest/messages" className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition text-center">
          <MessageCircle size={28} className="text-purple-500" />
          <span className="font-semibold text-slate-700">Pesan</span>
          <span className="text-xs text-slate-400">Chat dengan pengelola villa</span>
        </Link>
      </div>

      {/* Recent Bookings Placeholder */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Booking Terbaru</h2>
        <div className="text-center py-10 text-slate-400 text-sm">
          <CalendarCheck size={40} className="mx-auto mb-2 text-slate-200" />
          Belum ada booking. <Link href="/villas" className="text-emerald-600 hover:underline">Cari villa sekarang</Link>
        </div>
      </div>

      <button onClick={logout} className="mt-6 flex items-center gap-2 text-red-500 hover:text-red-700 transition text-sm">
        <LogOut size={15} /> Keluar
      </button>
    </div>
  )
}
