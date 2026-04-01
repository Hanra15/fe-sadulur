'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supportService } from '@/services/supportService'
import Link from 'next/link'
import { TicketCheck, Send, Loader2, CheckCircle, Search } from 'lucide-react'

type FormState = {
  name: string
  email: string
  subject: string
  message: string
  category: string
  priority: string
}

const emptyForm: FormState = { name: '', email: '', subject: '', message: '', category: 'other', priority: 'medium' }

export default function SupportPage() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const [trackCode, setTrackCode] = useState('')
  const [successCode, setSuccessCode] = useState('')

  const createMut = useMutation({
    mutationFn: () => supportService.create(form),
    onSuccess: (res) => {
      setSuccessCode(res.ticket_code)
      setForm(emptyForm)
      setError('')
    },
    onError: () => setError('Gagal mengirim tiket. Silakan coba lagi.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Semua field wajib diisi')
      return
    }
    setError('')
    createMut.mutate()
  }

  function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (trackCode.trim()) {
      window.location.href = `/support/${trackCode.trim().toUpperCase()}`
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-16 text-center" style={{ background: 'linear-gradient(135deg, #2C4B1A 0%, #3A6928 100%)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <TicketCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Pusat Bantuan</h1>
          <p className="text-green-200 text-lg">Kirim tiket dukungan atau lacak tiket yang sudah ada</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {successCode ? (
            <div className="bg-white rounded-2xl border p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Tiket Berhasil Dibuat!</h2>
              <p className="text-slate-600">Simpan kode tiket berikut untuk melacak status bantuan Anda:</p>
              <div className="bg-slate-50 rounded-xl py-4 px-6 inline-block">
                <p className="font-mono text-xl font-bold text-slate-800">{successCode}</p>
              </div>
              <p className="text-sm text-slate-500">Tim kami akan membalas secepatnya melalui email.</p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setSuccessCode('')}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  Kirim Tiket Lain
                </button>
                <Link
                  href={`/support/${successCode}`}
                  className="px-5 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90"
                  style={{ background: '#2C4B1A' }}
                >
                  Lihat Tiket
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="font-semibold text-slate-800 mb-5">Buat Tiket Dukungan</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subjek *</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ringkasan masalah Anda"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="booking">Booking</option>
                      <option value="payment">Pembayaran</option>
                      <option value="villa">Villa</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pesan *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Jelaskan masalah atau pertanyaan Anda secara detail..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#2C4B1A' }}
                >
                  {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Kirim Tiket
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Track ticket */}
          <div className="bg-white rounded-2xl border p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <Search className="w-4 h-4" /> Lacak Tiket
            </h3>
            <form onSubmit={handleTrack} className="space-y-3">
              <input
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="Kode tiket (TKT-XXXXXX-XXXX)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl text-white text-sm font-medium"
                style={{ background: '#3A6928' }}
              >
                Lacak
              </button>
            </form>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Tautan Berguna</h3>
            <Link href="/faq" className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-700 transition-colors">
              <TicketCheck className="w-4 h-4" /> FAQ — Pertanyaan Umum
            </Link>
            <Link href="/villas" className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-700 transition-colors">
              <TicketCheck className="w-4 h-4" /> Cari Villa
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
