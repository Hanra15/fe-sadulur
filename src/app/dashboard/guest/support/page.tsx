'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportService } from '@/services/supportService'
import { SupportTicket } from '@/types'
import Link from 'next/link'
import {
  TicketCheck, Plus, Loader2, ChevronRight, Send, X, CheckCircle,
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: '#1d4ed8', bg: '#dbeafe' },
  in_progress: { label: 'In Progress', color: '#b45309', bg: '#fef3c7' },
  resolved:    { label: 'Resolved',    color: '#15803d', bg: '#dcfce7' },
  closed:      { label: 'Selesai',     color: '#64748b', bg: '#f1f5f9' },
}

type FormState = {
  name: string
  email: string
  subject: string
  message: string
  category: string
  priority: string
}

const emptyForm: FormState = { name: '', email: '', subject: '', message: '', category: 'other', priority: 'medium' }

export default function GuestSupportPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const [successCode, setSuccessCode] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['guest-support'],
    queryFn: () => supportService.getAll({ limit: 50 }),
  })

  const createMut = useMutation({
    mutationFn: () => supportService.create(form),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['guest-support'] })
      setSuccessCode(res.ticket_code)
      setForm(emptyForm)
      setShowForm(false)
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

  const tickets: SupportTicket[] = data?.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#2C4B1A' }}>
            <TicketCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tiket Dukungan</h1>
            <p className="text-sm text-slate-500">Kelola permintaan bantuan Anda</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setSuccessCode('') }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90"
          style={{ background: '#2C4B1A' }}
        >
          <Plus className="w-4 h-4" /> Tiket Baru
        </button>
      </div>

      {/* Success banner */}
      {successCode && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Tiket berhasil dibuat!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Kode tiket Anda: <span className="font-mono font-bold">{successCode}</span>
            </p>
            <Link href={`/support/${successCode}`} className="text-xs underline text-green-700 mt-1 block">
              Lihat detail tiket
            </Link>
          </div>
          <button onClick={() => setSuccessCode('')} className="ml-auto">
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {/* New ticket form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-slate-800">Tiket Dukungan Baru</h2>
              <button onClick={() => { setShowForm(false); setError('') }}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
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
                  placeholder="Ringkasan masalah"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    <option value="booking">Booking</option>
                    <option value="payment">Pembayaran</option>
                    <option value="villa">Villa</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
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
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Jelaskan masalah Anda..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setError('') }} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#2C4B1A' }}
                >
                  {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <TicketCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Belum ada tiket dukungan</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: '#2C4B1A' }}
          >
            Buat Tiket Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] ?? { label: ticket.status, color: '#64748b', bg: '#f1f5f9' }
            return (
              <Link key={ticket.ticket_code} href={`/support/${ticket.ticket_code}`}>
                <div className="bg-white rounded-2xl border p-4 flex items-center gap-4 hover:shadow-sm transition cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{ticket.ticket_code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 text-sm truncate">{ticket.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{ticket.category} · {ticket.priority}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('id-ID') : ''}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
