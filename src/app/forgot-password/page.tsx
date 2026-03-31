'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { authService } from '@/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Terjadi kesalahan. Silakan coba beberapa saat lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
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
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Lupa Password</h1>
          <p className="text-slate-500 text-sm">
            Masukkan email akun Anda untuk mendapatkan tautan reset password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#5C8A36' }} />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Email Terkirim!</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Jika email <span className="font-medium text-slate-700">{email}</span> terdaftar di sistem kami,
                Anda akan menerima tautan reset password dalam beberapa menit.
              </p>
              <p className="text-slate-400 text-xs mt-4">
                Periksa folder spam jika email tidak muncul di kotak masuk.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@contoh.com"
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none transition focus:border-slate-400"
                    autoComplete="email"
                  />
                </div>
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
                  <Mail size={18} />
                )}
                {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition"
          >
            <ArrowLeft size={14} />
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  )
}
