'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { livechatService } from '@/services/livechatService'
import { LiveChatMessage } from '@/types'
import { MessageCircle, X, Send, Loader2, Bot, User, MinusCircle } from 'lucide-react'

const LC_TOKEN_KEY = 'vs_lc_token'
const POLL_INTERVAL = 3000

type ChatStatus = 'bot' | 'waiting' | 'active' | 'closed' | 'idle'

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<ChatStatus>('idle')
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [starting, setStarting] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [showGreeting, setShowGreeting] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // load token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(LC_TOKEN_KEY)
      if (saved) setToken(saved)
    }
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Polling when session is active/waiting
  const fetchSession = useCallback(async () => {
    if (!token) return
    try {
      const res = await livechatService.getSession(token)
      setMessages(res.messages)
      setSessionStatus(res.session.status as ChatStatus)
      if (res.session.status === 'closed') {
        stopPolling()
      }
    } catch {
      // session expired or not found
      stopPolling()
    }
  }, [token])

  function startPolling() {
    stopPolling()
    pollRef.current = setInterval(fetchSession, POLL_INTERVAL)
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  useEffect(() => {
    if (token && (sessionStatus === 'active' || sessionStatus === 'waiting')) {
      startPolling()
    } else {
      stopPolling()
    }
    return () => stopPolling()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sessionStatus])

  // Load existing session on open
  useEffect(() => {
    if (open && token && sessionStatus === 'idle') {
      fetchSession()
    }
  }, [open, token, sessionStatus, fetchSession])

  async function handleStartSession() {
    setStarting(true)
    try {
      const res = await livechatService.startSession({
        visitor_name: visitorName || undefined,
        visitor_email: visitorEmail || undefined,
      })
      const t = res.session_token
      setToken(t)
      localStorage.setItem(LC_TOKEN_KEY, t)
      setMessages(res.messages)
      setSessionStatus(res.session_status as ChatStatus)
      setShowGreeting(false)
    } catch {
      // ignore
    } finally {
      setStarting(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || !token || sending) return
    const msg = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await livechatService.sendMessage(token, msg)
      setMessages((prev) => {
        const next = [...prev, res.visitorMessage]
        if (res.botReply) next.push(res.botReply)
        return next
      })
      setSessionStatus(res.sessionStatus as ChatStatus)
    } catch {
      // show local fallback
    } finally {
      setSending(false)
    }
  }

  async function handleClose() {
    if (!token) return
    await livechatService.closeSession(token).catch(() => {})
    stopPolling()
    setToken(null)
    setMessages([])
    setSessionStatus('idle')
    setShowGreeting(true)
    localStorage.removeItem(LC_TOKEN_KEY)
  }

  const hasSession = !!token && sessionStatus !== 'idle'

  const senderIcon = (type: string) => {
    if (type === 'bot') return <Bot className="w-3.5 h-3.5 text-blue-500 shrink-0" />
    if (type === 'admin') return <div className="w-3.5 h-3.5 rounded-full bg-green-700 shrink-0" />
    return <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-36 md:bottom-24 right-4 z-50 w-80 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          style={{ height: '460px', background: '#fff', border: '1px solid #e2e8f0' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#2C4B1A' }}>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Sadulur Assistant</p>
                <p className="text-green-300 text-xs">
                  {sessionStatus === 'active' ? 'Admin aktif' : sessionStatus === 'waiting' ? 'Menghubungkan ke admin...' : 'Bot otomatis'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasSession && (
                <button onClick={handleClose} title="Akhiri sesi" className="p-1 text-green-300 hover:text-white">
                  <MinusCircle className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-green-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status bar */}
          {sessionStatus === 'waiting' && (
            <div className="px-4 py-2 text-xs text-center text-amber-700 bg-amber-50 border-b border-amber-100">
              Pesan Anda sudah dikirim ke admin. Mohon tunggu sebentar...
            </div>
          )}
          {sessionStatus === 'closed' && (
            <div className="px-4 py-2 text-xs text-center text-slate-500 bg-slate-50 border-b">
              Sesi telah berakhir.{' '}
              <button onClick={() => { setToken(null); setSessionStatus('idle'); setMessages([]); setShowGreeting(true); localStorage.removeItem(LC_TOKEN_KEY) }} className="underline">
                Mulai sesi baru
              </button>
            </div>
          )}

          {/* Greeting / Start */}
          {!hasSession && showGreeting ? (
            <div className="flex-1 flex flex-col items-center justify-center p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#f0f7e8' }}>
                <Bot className="w-6 h-6" style={{ color: '#2C4B1A' }} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Halo! 👋</p>
                <p className="text-sm text-slate-500 mt-1">Kami siap membantu Anda. Mulai percakapan sekarang.</p>
              </div>
              <div className="w-full space-y-2">
                <input
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Nama Anda (opsional)"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="Email Anda (opsional)"
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleStartSession}
                disabled={starting}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#2C4B1A' }}
              >
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Mulai Chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg, idx) => {
                  const isVisitor = msg.sender_type === 'visitor'
                  return (
                    <div key={msg.id ?? idx} className={`flex gap-1.5 ${isVisitor ? 'flex-row-reverse' : ''}`}>
                      {senderIcon(msg.sender_type)}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${isVisitor ? 'text-white' : msg.sender_type === 'bot' ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-800'}`}
                        style={isVisitor ? { background: '#2C4B1A' } : undefined}
                      >
                        <p>{msg.message}</p>
                        <p className={`text-[10px] mt-0.5 ${isVisitor ? 'text-green-300' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {sessionStatus !== 'closed' && (
                <div className="p-3 border-t flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Ketik pesan..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="p-2 rounded-xl text-white disabled:opacity-50"
                    style={{ background: '#2C4B1A' }}
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 w-13 h-13 rounded-full text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ background: '#2C4B1A', width: '52px', height: '52px' }}
        aria-label="Live chat"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
        {!open && sessionStatus === 'waiting' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
        )}
      </button>
    </>
  )
}
