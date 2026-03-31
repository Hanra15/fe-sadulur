'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { chatService } from '@/services/chatService'
import { userService } from '@/services/userService'
import { Chat } from '@/types'
import { Send, MessageCircle, X, ArrowLeft } from 'lucide-react'

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
  otherName: string
  villaId?: number
  villaName?: string
  messages: RawMessage[]
  lastMsg: RawMessage
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'Baru saja'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function OwnerMessagesPage() {
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

      // Group by (otherId, villa_id) into conversations
      const map = new Map<string, RawMessage[]>()
      raw.forEach(m => {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
        const key = `${otherId}:${m.villa_id ?? 0}`
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(m)
      })

      // Fetch user names for unique other IDs
      const uniqueIds = [...new Set([...map.keys()].map(k => Number(k.split(':')[0])))]
      const nameMap: Record<number, string> = {}
      await Promise.allSettled(
        uniqueIds.map(async id => {
          try {
            const r = await userService.getById(id)
            nameMap[id] = r.data?.name ?? `Pengguna #${id}`
          } catch {
            nameMap[id] = `Pengguna #${id}`
          }
        })
      )

      const convs: Conversation[] = []
      map.forEach((msgs, key) => {
        const [oId, vId] = key.split(':').map(Number)
        const sorted = [...msgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        convs.push({
          otherId: oId,
          otherName: nameMap[oId] ?? `Pengguna #${oId}`,
          villaId: vId || undefined,
          messages: sorted,
          lastMsg: sorted[sorted.length - 1],
        })
      })
      convs.sort((a, b) => new Date(b.lastMsg.timestamp).getTime() - new Date(a.lastMsg.timestamp).getTime())
      setConversations(convs)

      // Update active if open
      setActive(prev => {
        if (!prev) return null
        const updated = convs.find(c => c.otherId === prev.otherId && c.villaId === prev.villaId)
        return updated ?? prev
      })
    } catch {} finally { setLoading(false) }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receiver_id: active.otherId,
        message: replyText.trim(),
        ...(active.villaId ? { villa_id: active.villaId } : {}),
      } as never)
      setReplyText('')
      await loadChats()
    } catch {} finally { setSending(false) }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const myId = user?.id

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-800">Pesan</h1>
        <p className="text-xs text-slate-400">Chat dengan tamu villa</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ minHeight: 480 }}>
        <div className="flex h-full" style={{ minHeight: 480 }}>
          {/* Conversation list */}
          <div className={`border-r border-slate-100 flex flex-col ${active ? 'hidden sm:flex sm:w-64 lg:w-72' : 'w-full sm:w-64 lg:w-72'}`}>
            <div className="px-4 py-3 border-b border-slate-50">
              <span className="text-xs font-semibold text-slate-500">PERCAKAPAN</span>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">Memuat...</div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageCircle size={32} className="text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Belum ada percakapan</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {conversations.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(c)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${active?.otherId === c.otherId && active?.villaId === c.villaId ? 'bg-blue-50/60' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs">
                        {c.otherName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-slate-700 text-xs truncate">{c.otherName}</span>
                          <span className="text-slate-300 text-[10px] shrink-0">{timeAgo(c.lastMsg.timestamp)}</span>
                        </div>
                        {c.villaId && <div className="text-[10px] text-blue-500 truncate">Villa #{c.villaId}</div>}
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
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs">
                  {active.otherName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-700 text-sm">{active.otherName}</div>
                  {active.villaId && <div className="text-xs text-blue-500">Villa #{active.villaId}</div>}
                </div>
                <button onClick={() => setActive(null)} className="hidden sm:block ml-auto p-1.5 rounded-lg text-slate-300 hover:text-slate-500">
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 360 }}>
                {active.messages.map(m => {
                  const isMine = String(m.sender_id) === String(myId)
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                      }`}>
                        <p>{m.message}</p>
                        <p className={`text-[10px] mt-0.5 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                          {timeAgo(m.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply box */}
              <div className="p-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"
                    rows={2}
                    placeholder="Ketik pesan..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-300 mt-1">Enter untuk kirim, Shift+Enter untuk baris baru</p>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex flex-1 items-center justify-center flex-col gap-2 text-slate-400">
              <MessageCircle size={40} className="text-slate-200" />
              <p className="text-sm">Pilih percakapan untuk membaca pesan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
