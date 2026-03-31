'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { authService } from '@/services/authService'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid'>('checking')
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenState('invalid')
      return
    }
    authService
      .verifyResetToken(token)
      .then((res) => setTokenState(res.valid ? 'valid' : 'invalid'))
      .catch(() => setTokenState('invalid'))
  }, [token])

  const validatePassword = (pw: string) => {
    if (pw.length < 8) return 'Password minimal 8 karakter'
    if (!/[A-Z]/.test(pw)) return 'Password harus mengandung minimal 1 huruf kapital'
    if (!/[0-9]/.test(pw)) return 'Password harus mengandung minimal 1 angka'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const pwError = validatePassword(form.password)
    if (pwError) {
      setError(pwError)
      return
    }
    if (form.password !== form.confirm) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, form.password)
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal mereset password. Token mungkin sudah kedaluwarsa.'
      setError(msg)
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
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h1>
          <p className="text-slate-500 text-sm">Buat password baru untuk akun Anda</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {tokenState === 'checking' && (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin mx-auto" style={{ color: '#5C8A36' }} />
              <p className="text-slate-500 text-sm mt-3">Memverifikasi token...</p>
            </div>
          )}

          {tokenState === 'invalid' && (
            <div className="text-center py-4">
              <XCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Tautan Tidak Valid</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Tautan reset password sudah kedaluwarsa atau tidak valid.
                Silakan minta tautan baru.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-2.5 rounded-xl transition"
                style={{ backgroundColor: '#5C8A36' }}
              >
                Minta Tautan Baru
              </Link>
            </div>
          )}

          {tokenState === 'valid' && !success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500">
                Password harus mengandung: minimal 8 karakter, 1 huruf kapital, dan 1 angka.
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-slate-400"
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
                <label className="text-xs font-medium text-slate-500 block mb-1">Konfirmasi Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-slate-400"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 mt-1"
                style={{ backgroundColor: '#5C8A36' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                {loading ? 'Menyimpan...' : 'Reset Password'}
              </button>
            </form>
          )}

          {success && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#5C8A36' }} />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Password Berhasil Direset!</h2>
              <p className="text-slate-500 text-sm">
                Password Anda telah diperbarui. Anda akan diarahkan ke halaman login...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-2.5 rounded-xl transition mt-6"
                style={{ backgroundColor: '#5C8A36' }}
              >
                Masuk Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#5C8A36' }} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
