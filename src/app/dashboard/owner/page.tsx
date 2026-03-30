'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle, Building2, CalendarCheck, MessageCircle, LogOut } from 'lucide-react'

export default function OwnerDashboard() {
  const { user, isLoggedIn, isOwner, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (!isOwner) router.push('/login')
  }, [isLoggedIn, isOwner, router])

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-400 rounded-2xl p-6 text-white mb-8 flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm">Dashboard Pengelola</p>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-blue-100 text-sm mt-1">{user.email}</p>
        </div>
        <div className="p-4 bg-white/20 rounded-full">
          <Building2 size={36} />
        </div>
      </div>

      {/* Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/owner/villas/new" className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition text-center">
          <PlusCircle size={28} style={{ color: "#5C8A36" }} />
          <span className="font-semibold text-slate-700">Posting Villa</span>
          <span className="text-xs text-slate-400">Tambah villa baru</span>
        </Link>
        <Link href="/dashboard/owner/villas" className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition text-center">
          <Building2 size={28} className="text-blue-500" />
          <span className="font-semibold text-slate-700">Villa Saya</span>
          <span className="text-xs text-slate-400">Kelola daftar villa</span>
        </Link>
        <Link href="/dashboard/owner/bookings" className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition text-center">
          <CalendarCheck size={28} className="text-indigo-500" />
          <span className="font-semibold text-slate-700">Booking Masuk</span>
          <span className="text-xs text-slate-400">Lihat pemesanan tamu</span>
        </Link>
        <Link href="/dashboard/owner/messages" className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition text-center">
          <MessageCircle size={28} className="text-purple-500" />
          <span className="font-semibold text-slate-700">Pesan</span>
          <span className="text-xs text-slate-400">Chat dengan tamu</span>
        </Link>
      </div>

      {/* Villa placeholder */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Villa Terdaftar</h2>
        <div className="text-center py-10 text-slate-400 text-sm">
          <Building2 size={40} className="mx-auto mb-2 text-slate-200" />
          Belum ada villa. <Link href="/dashboard/owner/villas/new" className="text-blue-600 hover:underline">Posting villa pertamamu</Link>
        </div>
      </div>

      <button onClick={logout} className="mt-6 flex items-center gap-2 text-red-500 hover:text-red-700 transition text-sm">
        <LogOut size={15} /> Keluar
      </button>
    </div>
  )
}
