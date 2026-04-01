'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportService } from '@/services/supportService'
import { SupportMessage } from '@/types'
import {
  ArrowLeft, Loader2, Send, Lock, User, ShieldCheck,
} from 'lucide-react'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']
const PRIORITY_OPTIONS = ['low', 'medium', 'high']
const STATUS_LABELS: Record<string, string> = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' }
const PRIORITY_LABELS: Record<string, string> = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' }

export default function AdminSupportDetailPage() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const [replyMsg, setReplyMsg] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newPriority, setNewPriority] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support', ticketCode],
    queryFn: () => supportService.getByCode(ticketCode),
    refetchInterval: 10000,
  })

  const ticket = data?.data
  const messages: SupportMessage[] = ticket?.messages ?? []

  const replyMut = useMutation({
    mutationFn: () => supportService.reply(ticketCode, { message: replyMsg, is_internal: isInternal }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-support', ticketCode] })
      setReplyMsg('')
    },
  })

  const updateMut = useMutation({
    mutationFn: () => supportService.update(ticketCode, {
      status: newStatus || undefined,
      priority: newPriority || undefined,
      note: noteText || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-support', ticketCode] })
      qc.invalidateQueries({ queryKey: ['admin-support'] })
      setNoteText('')
      setNewStatus('')
      setNewPriority('')
    },
  })

  const statusColor: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700', closed: 'bg-slate-100 text-slate-600',
  }
  const priorityColor: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-700',
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  )
  if (!ticket) return <p className="text-center py-20 text-slate-400">Tiket tidak ditemukan</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">{ticket.subject}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[ticket.status]}`}>
              {STATUS_LABELS[ticket.status]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[ticket.priority]}`}>
              {PRIORITY_LABELS[ticket.priority]}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {ticket.ticket_code} · {ticket.name} &lt;{ticket.email}&gt; · {ticket.category}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            {messages.map((msg) => {
              const isAdmin = msg.sender_role === 'admin'
              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-4 ${msg.is_internal ? 'border-2 border-dashed border-amber-300 bg-amber-50' : isAdmin ? 'ml-8' : 'mr-8'}`}
                  style={!msg.is_internal && isAdmin ? { background: '#f0f7e8' } : !msg.is_internal ? { background: '#f8fafc' } : undefined}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isAdmin
                      ? <ShieldCheck className="w-4 h-4 text-purple-600" />
                      : <User className="w-4 h-4 text-slate-500" />
                    }
                    <span className="text-xs font-medium text-slate-700">{msg.sender_name}</span>
                    {msg.is_internal && (
                      <span className="flex items-center gap-1 text-xs text-amber-700">
                        <Lock className="w-3 h-3" /> Catatan Internal
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(msg.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              )
            })}
          </div>

          {/* Reply */}
          {ticket.status !== 'closed' && (
            <div className="bg-white rounded-2xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-slate-800 text-sm">Balas Tiket</h3>
                <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-3.5 h-3.5 accent-amber-500"
                  />
                  <span className="text-xs text-slate-600">Catatan Internal</span>
                </label>
              </div>
              <textarea
                value={replyMsg}
                onChange={(e) => setReplyMsg(e.target.value)}
                rows={3}
                placeholder="Tulis balasan..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => replyMut.mutate()}
                disabled={!replyMsg.trim() || replyMut.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: '#2C4B1A' }}
              >
                {replyMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Kirim
              </button>
            </div>
          )}
        </div>

        {/* Sidebar — Update Status */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border p-4 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Perbarui Tiket</h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Status</label>
              <select
                value={newStatus || ticket.status}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Prioritas</label>
              <select
                value={newPriority || ticket.priority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Catatan Internal (opsional)</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                placeholder="Tambahkan catatan internal..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={() => updateMut.mutate()}
              disabled={updateMut.isPending}
              className="w-full py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#3A6928' }}
            >
              {updateMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan
            </button>
          </div>

          {/* Ticket Info */}
          <div className="bg-white rounded-2xl border p-4 space-y-2 text-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Info Tiket</h3>
            <div className="flex justify-between">
              <span className="text-slate-500">Kode</span>
              <span className="font-mono text-slate-700">{ticket.ticket_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kategori</span>
              <span className="text-slate-700 capitalize">{ticket.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pengirim</span>
              <span className="text-slate-700">{ticket.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-700 truncate max-w-[140px]">{ticket.email}</span>
            </div>
            {ticket.handler && (
              <div className="flex justify-between">
                <span className="text-slate-500">Ditangani</span>
                <span className="text-slate-700">{ticket.handler.name}</span>
              </div>
            )}
            {ticket.resolved_at && (
              <div className="flex justify-between">
                <span className="text-slate-500">Diselesaikan</span>
                <span className="text-slate-700">{new Date(ticket.resolved_at).toLocaleDateString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Dibuat</span>
              <span className="text-slate-700">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('id-ID') : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
