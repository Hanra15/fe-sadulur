'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportService } from '@/services/supportService'
import { SupportMessage } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Loader2, Send, User, ShieldCheck, TicketCheck } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700' },
  closed:      { label: 'Closed',      color: 'bg-slate-100 text-slate-600' },
}

export default function SupportTrackPage() {
  const { ticketCode } = useParams<{ ticketCode: string }>()
  const qc = useQueryClient()
  const [replyMsg, setReplyMsg] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [showReplyForm, setShowReplyForm] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['support-ticket', ticketCode],
    queryFn: () => supportService.getByCode(ticketCode),
    refetchInterval: 15000,
  })

  const ticket = data?.data
  const messages: SupportMessage[] = ticket?.messages ?? []
  const publicMessages = messages.filter((m) => !m.is_internal)

  const replyMut = useMutation({
    mutationFn: () => supportService.reply(ticketCode, { message: replyMsg }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-ticket', ticketCode] })
      setReplyMsg('')
      setShowReplyForm(false)
    },
  })

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  )

  if (error || !ticket) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <TicketCheck className="w-12 h-12 mx-auto text-slate-300" />
        <p className="text-slate-500">Tiket tidak ditemukan</p>
        <Link href="/support" className="text-sm underline" style={{ color: '#2C4B1A' }}>Kembali ke Halaman Bantuan</Link>
      </div>
    </div>
  )

  const st = STATUS_LABELS[ticket.status]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Back */}
        <Link href="/support" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        {/* Ticket info */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-slate-500">{ticket.ticket_code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st?.color}`}>{st?.label}</span>
              </div>
              <h1 className="text-lg font-bold text-slate-800">{ticket.subject}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {ticket.name} · {ticket.email} · <span className="capitalize">{ticket.category}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Messages thread */}
        <div className="space-y-3">
          {publicMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Belum ada percakapan</div>
          ) : (
            publicMessages.map((msg) => {
              const isAdmin = msg.sender_role === 'admin'
              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-4 ${isAdmin ? 'ml-6' : 'mr-6'}`}
                  style={{ background: isAdmin ? '#f0f7e8' : '#f8fafc', border: '1px solid', borderColor: isAdmin ? '#d1f0b8' : '#e2e8f0' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isAdmin
                      ? <ShieldCheck className="w-4 h-4 text-green-700" />
                      : <User className="w-4 h-4 text-slate-500" />
                    }
                    <span className="text-xs font-medium text-slate-700">{msg.sender_name}</span>
                    {isAdmin && <span className="text-xs font-medium text-green-700">Tim Sadulur</span>}
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(msg.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              )
            })
          )}
        </div>

        {/* Reply */}
        {ticket.status !== 'closed' && (
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h3 className="font-medium text-slate-800 text-sm">Tambah Balasan</h3>
            {!showReplyForm ? (
              <button
                onClick={() => setShowReplyForm(true)}
                className="w-full py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
              >
                Tulis balasan...
              </button>
            ) : (
              <div className="space-y-3">
                {/* Name/email only needed if not logged in - keep simple */}
                <textarea
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  rows={4}
                  placeholder="Tulis pesan balasan Anda..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowReplyForm(false); setReplyMsg('') }}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => replyMut.mutate()}
                    disabled={!replyMsg.trim() || replyMut.isPending}
                    className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: '#2C4B1A' }}
                  >
                    {replyMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Kirim
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
