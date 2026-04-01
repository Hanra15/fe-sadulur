'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { faqService } from '@/services/faqService'
import { Faq } from '@/types'
import {
  Plus, Pencil, Trash2, X, Loader2, HelpCircle,
  CheckCircle, XCircle, ChevronUp, ChevronDown,
} from 'lucide-react'

type FormState = {
  question: string
  answer: string
  category: string
  order_index: number
  is_active: boolean
}

const emptyForm: FormState = {
  question: '',
  answer: '',
  category: '',
  order_index: 0,
  is_active: true,
}

export default function AdminFaqsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [filterCategory, setFilterCategory] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => faqService.getAll({ all: true }),
  })

  const faqs: Faq[] = data?.data ?? []
  const categories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)))
  const filtered = filterCategory ? faqs.filter((f) => f.category === filterCategory) : faqs

  const createMut = useMutation({
    mutationFn: faqService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); closeForm() },
    onError: () => setError('Gagal menyimpan FAQ'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<FormState> }) =>
      faqService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); closeForm() },
    onError: () => setError('Gagal memperbarui FAQ'),
  })

  const toggleMut = useMutation({
    mutationFn: faqService.toggle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  })

  const deleteMut = useMutation({
    mutationFn: faqService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
    onError: () => setError('Gagal menghapus FAQ'),
  })

  const moveOrder = useMutation({
    mutationFn: faqService.reorder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  })

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, order_index: faqs.length + 1 })
    setError('')
    setShowForm(true)
  }

  function openEdit(faq: Faq) {
    setEditing(faq)
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? '',
      order_index: faq.order_index,
      is_active: faq.is_active,
    })
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Pertanyaan dan jawaban wajib diisi')
      return
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, payload: form })
    } else {
      createMut.mutate(form)
    }
  }

  function handleMoveUp(faq: Faq) {
    const sorted = [...filtered].sort((a, b) => a.order_index - b.order_index)
    const idx = sorted.findIndex((f) => f.id === faq.id)
    if (idx <= 0) return
    const prev = sorted[idx - 1]
    moveOrder.mutate([
      { id: faq.id, order_index: prev.order_index },
      { id: prev.id, order_index: faq.order_index },
    ])
  }

  function handleMoveDown(faq: Faq) {
    const sorted = [...filtered].sort((a, b) => a.order_index - b.order_index)
    const idx = sorted.findIndex((f) => f.id === faq.id)
    if (idx >= sorted.length - 1) return
    const next = sorted[idx + 1]
    moveOrder.mutate([
      { id: faq.id, order_index: next.order_index },
      { id: next.id, order_index: faq.order_index },
    ])
  }

  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#2C4B1A' }}>
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">FAQ</h1>
            <p className="text-sm text-slate-500">Kelola pertanyaan yang sering diajukan</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: '#2C4B1A' }}
        >
          <Plus className="w-4 h-4" /> Tambah FAQ
        </button>
      </div>

      {/* Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filterCategory ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={!filterCategory ? { background: '#2C4B1A' } : undefined}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCategory === cat ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              style={filterCategory === cat ? { background: '#2C4B1A' } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-slate-800">{editing ? 'Edit FAQ' : 'Tambah FAQ'}</h2>
              <button onClick={closeForm}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pertanyaan *</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tulis pertanyaan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jawaban *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tulis jawaban lengkap..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="mis. Booking, Pembayaran"
                    list="cat-list"
                  />
                  <datalist id="cat-list">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Urutan</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-green-700"
                />
                <span className="text-sm text-slate-700">Aktif (tampil di halaman publik)</span>
              </label>
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
                  {editing ? 'Simpan Perubahan' : 'Tambah FAQ'}
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
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Belum ada FAQ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...filtered].sort((a, b) => a.order_index - b.order_index).map((faq, idx, arr) => (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl border p-4 flex gap-4 ${!faq.is_active ? 'opacity-60' : ''}`}
            >
              {/* Order controls */}
              <div className="flex flex-col gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(faq)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-xs text-center text-slate-400 font-mono">{faq.order_index}</span>
                <button
                  disabled={idx === arr.length - 1}
                  onClick={() => handleMoveDown(faq)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{faq.question}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {faq.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{faq.category}</span>
                    )}
                    <button
                      onClick={() => toggleMut.mutate(faq.id)}
                      title={faq.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      className="p-1.5 rounded-lg hover:bg-slate-100"
                    >
                      {faq.is_active
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-slate-400" />
                      }
                    </button>
                    <button onClick={() => openEdit(faq)} className="p-1.5 rounded-lg hover:bg-slate-100">
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Hapus FAQ ini?')) deleteMut.mutate(faq.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
