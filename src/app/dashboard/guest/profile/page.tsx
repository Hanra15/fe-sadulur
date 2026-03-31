'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { User, Save, Loader2, CheckCircle } from 'lucide-react'

export default function GuestProfilePage() {
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Nama tidak boleh kosong'); return }
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-md">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-800">Profil Saya</h1>
        <p className="text-xs text-slate-400">Kelola informasi akun Anda</p>
      </div>

      {/* Avatar block */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full text-white flex items-center justify-center text-xl font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #3A6928, #5C8A36)' }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-700">{user.name}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
          <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h2 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
          <User size={14} style={{ color: '#5C8A36' }} /> Edit Profil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 font-medium">Nama Lengkap <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm mt-1 outline-none focus:border-green-400"
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-slate-100 rounded-lg px-3 py-2.5 text-sm mt-1 bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-300 mt-0.5">Email tidak dapat diubah</p>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-medium">No. HP</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm mt-1 outline-none focus:border-green-400"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {saved && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
              <CheckCircle size={13} /> Profil berhasil diperbarui
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
            style={{ background: '#5C8A36' }}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" />Menyimpan...</> : <><Save size={14} />Simpan Perubahan</>}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mt-4">
        <h2 className="font-semibold text-slate-700 text-sm mb-3">Info Akun</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Member sejak</span>
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status akun</span>
            <span className="text-green-600 font-medium">Aktif</span>
          </div>
        </div>
      </div>
    </div>
  )
}
