'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { livechatService } from '@/services/livechatService'
import { BotKnowledge } from '@/types'
import {
  Bot, Plus, Pencil, Trash2, X, Loader2, Search,
  CheckCircle, XCircle, Zap,
} from 'lucide-react'

type FormState = {
  intent: string
  keywords: string
  response: string
  order_index: number
  is_active: boolean
}

const emptyForm: FormState = { intent: '', keywords: '', response: '', order_index: 0, is_active: true }

export default function AdminBotKnowledgePage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BotKnowledge | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const [testMsg, setTestMsg] = useState('')
  const [testResult, setTestResult] = useState<{ intent: string; response: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['bot-knowledge'],
    queryFn: livechatService.getKnowledge,
  })

  const items: BotKnowledge[] = data?.data ?? []
  const filtered = search ? items.filter((k) => k.intent.toLowerCase().includes(search.toLowerCase()) || k.keywords.toLowerCase().includes(search.toLowerCase())) : items

  const createMut = useMutation({
    mutationFn: livechatService.createKnowledge,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-knowledge'] }); closeForm() },
    onError: () => setError('Gagal menyimpan'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<FormState> }) =>
      livechatService.updateKnowledge(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bot-knowledge'] }); closeForm() },
    onError: () => setError('Gagal memperbarui'),
  })

  const deleteMut = useMutation({
    mutationFn: livechatService.deleteKnowledge,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bot-knowledge'] }),
  })

  const toggleMut = useMutation({
    mutationFn: (item: BotKnowledge) =>
      livechatService.updateKnowledge(item.id, { is_active: !item.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bot-knowledge'] }),
  })

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, order_index: items.length + 1 })
    setError('')
    setShowForm(true)
  }

  function openEdit(item: BotKnowledge) {
    setEditing(item)
    setForm({ intent: item.intent, keywords: item.keywords, response: item.response, order_index: item.order_index, is_active: item.is_active })
    setError('')
    setShowForm(true)
  }

  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm); setError('') }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.intent.trim() || !form.keywords.trim() || !form.response.trim()) {
      setError('Intent, keywords, dan respons wajib diisi')
      return
    }
    if (editing) updateMut.mutate({ id: editing.id, payload: form })
    else createMut.mutate(form)
  }

  async function handleTest() {
    if (!testMsg.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await livechatService.testBot(testMsg)
      setTestResult(res)
    } finally {
      setTesting(false)
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#2C4B1A' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Bot Knowledge Base</h1>
            <p className="text-sm text-slate-500">Kelola pengetahuan bot percakapan</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90"
          style={{ background: '#2C4B1A' }}
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Test Bot */}
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-medium text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Uji Bot
        </h3>
        <div className="flex gap-2">
          <input
            value={testMsg}
            onChange={(e) => setTestMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTest() }}
            placeholder="Ketik pesan untuk diuji..."
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleTest}
            disabled={testing || !testMsg.trim()}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
            style={{ background: '#3A6928' }}
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Uji'}
          </button>
        </div>
        {testResult && (
          <div className="mt-3 p-3 bg-green-50 rounded-xl text-sm">
            <p className="text-xs font-medium text-green-700 mb-1">Intent: {testResult.intent}</p>
            <p className="text-slate-700">{testResult.response}</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari intent atau keyword..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-slate-800">{editing ? 'Edit Knowledge' : 'Tambah Knowledge'}</h2>
              <button onClick={closeForm}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Intent *</label>
                <input
                  value={form.intent}
                  onChange={(e) => setForm({ ...form, intent: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="mis. cek_harga, cara_booking"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keywords *</label>
                <input
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="kata kunci dipisah koma: harga, tarif, biaya"
                />
                <p className="text-xs text-slate-400 mt-1">Pisahkan dengan koma</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Respons Bot *</label>
                <textarea
                  value={form.response}
                  onChange={(e) => setForm({ ...form, response: e.target.value })}
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Respons yang akan dikirim bot..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Urutan</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 accent-green-700"
                    />
                    <span className="text-sm text-slate-700">Aktif</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#2C4B1A' }}
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Belum ada knowledge base</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 ${!item.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-green-700">{item.intent}</span>
                    {!item.is_active && <span className="text-xs text-slate-400">(nonaktif)</span>}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    <span className="font-medium">Keywords:</span> {item.keywords}
                  </p>
                  <p className="text-sm text-slate-700 line-clamp-2">{item.response}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleMut.mutate(item)}
                    title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    className="p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {item.is_active
                      ? <CheckCircle className="w-4 h-4 text-green-600" />
                      : <XCircle className="w-4 h-4 text-slate-400" />
                    }
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Hapus knowledge ini?')) deleteMut.mutate(item.id) }}
                    className="p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
