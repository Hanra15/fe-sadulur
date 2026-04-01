'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { livechatService } from '@/services/livechatService'
import { LiveChatSession, LiveChatMessage } from '@/types'
import { MessageSquare, Loader2, Send, X, Bot, User, ShieldCheck } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  bot:     { label: 'Bot',     color: 'bg-blue-100 text-blue-700' },
  waiting: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
  active:  { label: 'Aktif',   color: 'bg-green-100 text-green-700' },
  closed:  { label: 'Selesai', color: 'bg-slate-100 text-slate-600' },
}

export default function AdminLiveChatPage() {
  const qc = useQueryClient()
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('waiting')
  const [replyMsg, setReplyMsg] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['livechat-sessions', filterStatus],
    queryFn: () => livechatService.getSessions({ status: filterStatus === 'all' ? undefined : filterStatus }),
    refetchInterval: 5000,
  })

  const { data: sessionDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['livechat-session', selectedToken],
    queryFn: () => livechatService.getSession(selectedToken!),
    enabled: !!selectedToken,
    refetchInterval: 3000,
  })

  const replyMut = useMutation({
    mutationFn: () => livechatService.adminReply(selectedToken!, replyMsg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['livechat-session', selectedToken] })
      qc.invalidateQueries({ queryKey: ['livechat-sessions'] })
      setReplyMsg('')
    },
  })

  const closeMut = useMutation({
    mutationFn: (token: string) => livechatService.closeSession(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['livechat-sessions'] })
      setSelectedToken(null)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sessionDetail?.messages])

  const sessions: LiveChatSession[] = sessionsData?.data ?? []
  const messages: LiveChatMessage[] = sessionDetail?.messages ?? []
  const currentSession = sessionDetail?.session

  const waitingCount = sessions.filter((s) => s.status === 'waiting').length

  const senderIcon = (type: string) => {
    if (type === 'bot') return <Bot className="w-4 h-4 text-blue-500" />
    if (type === 'admin') return <ShieldCheck className="w-4 h-4 text-purple-600" />
    return <User className="w-4 h-4 text-slate-500" />
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#2C4B1A' }}>
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Live Chat</h1>
            <p className="text-sm text-slate-500">Kelola sesi chat pengunjung</p>
          </div>
        </div>
        {waitingCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
            {waitingCount} menunggu admin
          </span>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'waiting', 'active', 'bot', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={filterStatus === s ? { background: '#2C4B1A' } : undefined}
          >
            {s === 'all' ? 'Semua' : STATUS_LABELS[s]?.label ?? s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '60vh' }}>
        {/* Session list */}
        <div className="lg:col-span-1 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">Tidak ada sesi</div>
          ) : (
            sessions.map((session) => {
              const st = STATUS_LABELS[session.status]
              const isSelected = selectedToken === session.session_token
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedToken(session.session_token)}
                  className={`w-full text-left rounded-2xl border p-3 transition-colors ${isSelected ? 'border-green-500 bg-green-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">
                      {session.visitor_name || 'Pengunjung Anonim'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st?.color}`}>{st?.label}</span>
                  </div>
                  {session.visitor_email && (
                    <p className="text-xs text-slate-500 truncate">{session.visitor_email}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {session.createdAt ? new Date(session.createdAt).toLocaleString('id-ID') : ''}
                  </p>
                </button>
              )
            })
          )}
        </div>

        {/* Chat panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border flex flex-col" style={{ height: '65vh' }}>
          {!selectedToken ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Pilih sesi untuk mulai membalas</p>
              </div>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {currentSession?.visitor_name || 'Pengunjung Anonim'}
                  </p>
                  {currentSession?.visitor_email && (
                    <p className="text-xs text-slate-500">{currentSession.visitor_email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentSession && STATUS_LABELS[currentSession.status] && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABELS[currentSession.status].color}`}>
                      {STATUS_LABELS[currentSession.status].label}
                    </span>
                  )}
                  {currentSession?.status !== 'closed' && (
                    <button
                      onClick={() => { if (confirm('Tutup sesi ini?')) closeMut.mutate(selectedToken) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isVisitor = msg.sender_type === 'visitor'
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isVisitor ? '' : 'flex-row-reverse'}`}>
                      <div className="shrink-0">{senderIcon(msg.sender_type)}</div>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isVisitor ? 'bg-slate-100 text-slate-800' : msg.sender_type === 'bot' ? 'bg-blue-50 text-blue-800' : 'text-white'}`}
                        style={msg.sender_type === 'admin' ? { background: '#2C4B1A' } : undefined}
                      >
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${isVisitor ? 'text-slate-400' : msg.sender_type === 'bot' ? 'text-blue-400' : 'text-green-200'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              {currentSession?.status !== 'closed' && (
                <div className="p-4 border-t flex gap-2">
                  <input
                    value={replyMsg}
                    onChange={(e) => setReplyMsg(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && replyMsg.trim()) { e.preventDefault(); replyMut.mutate() } }}
                    placeholder="Balas sebagai admin..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => replyMut.mutate()}
                    disabled={!replyMsg.trim() || replyMut.isPending}
                    className="p-2 rounded-xl text-white disabled:opacity-50"
                    style={{ background: '#2C4B1A' }}
                  >
                    {replyMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
