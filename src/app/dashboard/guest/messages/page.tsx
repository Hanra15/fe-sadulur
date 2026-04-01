'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { chatService } from '@/services/chatService'
import { Send, MessageCircle, ArrowLeft, X } from 'lucide-react'

interface RawMessage {
  id: number
  sender_id: number
  receiver_id: number
  villa_id?: number
  booking_id?: number
  message: string
  timestamp: string
}

interface Conversation {
  otherId: number
  otherLabel: string
  villaId?: number
  messages: RawMessage[]
  lastMsg: RawMessage
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60_000) return 'Baru saja'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} mnt lalu`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} jam lalu`
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function GuestMessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Conversation | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadChats = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await chatService.getMyChats()
      const raw = (res.data ?? []) as unknown as RawMessage[]

      const map = new Map<string, RawMessage[]>()
      raw.forEach(m => {
        const otherId = m.sender_id === Number(user.id) ? m.receiver_id : m.sender_id
        const key = `${otherId}:${m.villa_id ?? 0}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(m)
      })

      const convs: Conversation[] = []
      map.forEach((msgs, key) => {
        const [oId, vId] = key.split(':').map(Number)
        const sorted = [...msgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        convs.push({
          otherId: oId,
          otherLabel: vId ? `Pengelola Villa #${vId}` : `Pengelola #${oId}`,
          villaId: vId || undefined,
          messages: sorted,
          lastMsg: sorted[sorted.length - 1],
        })
      })
      convs.sort((a, b) => new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime())
      setConversations(convs)

      setActive(prev => {
        if (!prev) return null
        const updated = convs.find(c => c.otherId === prev.otherId && c.villaId === prev.villaId)
        return updated ?? prev
      })
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadChats() }, [loadChats])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length])

  async function handleSend() {
    if (!active || !replyText.trim() || !user) return
    setSending(true)
    try {
      await chatService.sendMessage({
        receiver_id: active.otherId,
        message: replyText.trim(),
        ...(active.villaId ? { villa_id: active.villaId } : {}),
      })
      setReplyText('')
      await loadChats()
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const myId = Number(user?.id)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-800">Pesan</h1>
        <p className="text-xs text-slate-400">Chat dengan pengelola villa</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ minHeight: 480 }}>
        <div className="flex h-full" style={{ minHeight: 480 }}>
          {/* Conversation list */}
          <div className={`border-r border-slate-100 flex flex-col ${active ? 'hidden sm:flex sm:w-64 lg:w-72' : 'w-full sm:w-64 lg:w-72'}`}>
            <div className="px-4 py-3 border-b border-slate-50">
              <span className="text-xs font-semibold text-slate-500 tracking-wide">PERCAKAPAN</span>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">Memuat...</div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageCircle size={32} className="text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Belum ada percakapan</p>
                <p className="text-xs text-slate-300 mt-1">Mulai chat dari halaman villa</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {conversations.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(c)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${active?.otherId === c.otherId && active?.villaId === c.villaId ? 'bg-green-50/60' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white" style={{ background: '#5C8A36' }}>
                        {c.otherLabel.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-slate-700 text-xs truncate">{c.otherLabel}</span>
                          <span className="text-slate-300 text-[10px] shrink-0">{timeAgo(c.lastMsg.timestamp)}</span>
                        </div>
                        <div className="text-xs text-slate-400 truncate">{c.lastMsg.message}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat area */}
          {active ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                <button onClick={() => setActive(null)} className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                  <ArrowLeft size={16} />
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white" style={{ background: '#5C8A36' }}>
                  {active.otherLabel.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-700 text-sm">{active.otherLabel}</div>
                  {active.villaId && <div className="text-xs text-slate-400">Villa #{active.villaId}</div>}
                </div>
                <button onClick={() => setActive(null)} className="hidden sm:block ml-auto p-1.5 rounded-lg text-slate-300 hover:text-slate-500">
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 360 }}>
                {active.messages.map(m => {
                  const isMine = m.sender_id === myId
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'rounded-tr-sm text-white' : 'rounded-tl-sm text-slate-700 bg-slate-100'}`}
                        style={isMine ? { background: '#5C8A36' } : {}}
                      >
                        <p className="leading-relaxed">{m.message}</p>
                        <p className={`text-[10px] mt-0.5 ${isMine ? 'text-green-100 text-right' : 'text-slate-400'}`}>
                          {timeAgo(m.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan..."
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="p-2.5 rounded-xl text-white disabled:opacity-40 transition"
                  style={{ background: '#5C8A36' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center">
              <div className="text-center text-slate-300">
                <MessageCircle size={40} className="mx-auto mb-2" />
                <p className="text-sm">Pilih percakapan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
