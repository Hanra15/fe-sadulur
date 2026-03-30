'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Role } from '@/types'
import { Users, Building2, ShieldCheck } from 'lucide-react'

const roles: { role: Role; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    role: 'guest',
    label: 'Pengunjung',
    desc: 'Cari dan booking villa favoritmu',
    icon: <Users size={32} />,
    color: 'from-emerald-500 to-teal-400',
  },
  {
    role: 'owner',
    label: 'Pengelola Villa',
    desc: 'Kelola villa dan booking masuk',
    icon: <Building2 size={32} />,
    color: 'from-blue-500 to-indigo-400',
  },
  {
    role: 'admin',
    label: 'Super Admin',
    desc: 'Kontrol penuh atas aplikasi',
    icon: <ShieldCheck size={32} />,
    color: 'from-purple-500 to-violet-400',
  },
]

export default function LoginPage() {
  const { login, isLoggedIn, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === 'admin') router.push('/dashboard/admin')
      else if (user.role === 'owner') router.push('/dashboard/owner')
      else router.push('/dashboard/guest')
    }
  }, [isLoggedIn, user, router])

  const handleLogin = (role: Role) => {
    login(role)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Masuk ke <span className="text-emerald-600">Villa Sadulur</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Pilih role untuk masuk.{' '}
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-xs font-medium">
              Mode Demo — Autentikasi API segera tersedia
            </span>
          </p>
        </div>

        <div className="space-y-4">
          {roles.map(({ role, label, desc, icon, color }) => (
            <button
              key={role}
              onClick={() => handleLogin(role)}
              className={`w-full flex items-center gap-5 bg-gradient-to-r ${color} text-white rounded-2xl px-6 py-5 shadow hover:shadow-lg hover:scale-[1.01] transition-all`}
            >
              <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
              <div className="text-left">
                <div className="font-bold text-lg">{label}</div>
                <div className="text-white/80 text-sm">{desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Login statis digunakan selama sistem autentikasi backend masih dalam pengembangan.
        </p>
      </div>
    </div>
  )
}
