'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const { register, isLoggedIn, user, isLoading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      router.push('/dashboard/guest')
    }
  }, [isLoggedIn, isLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal mendaftar. Coba lagi atau gunakan email lain.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#5C8A36' }} />
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image
              src="/images/logo-vilasad.png"
              alt="Villa Sadulur"
              width={48}
              height={48}
              className="rounded-full"
            />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Buat Akun Baru</h1>
          <p className="text-slate-500 text-sm">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#5C8A36' }}>
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Nama Lengkap *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Nama lengkap Anda"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="email@contoh.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">No. HP</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Min. 6 karakter"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-slate-400"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Konfirmasi Password *</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
                placeholder="Ulangi password Anda"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 mt-1"
              style={{ backgroundColor: '#5C8A36' }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UserPlus size={18} />
              )}
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Dengan mendaftar, Anda menyetujui{' '}
          <span className="underline cursor-pointer">Syarat & Ketentuan</span> kami.
        </p>
      </div>
    </div>
  )
}
