'use client'

import { useEffect, useState, useCallback } from 'react'
import { articleService } from '@/services/articleService'
import { Article } from '@/types'
import { getImageUrl } from '@/utils'
import Image from 'next/image'
import {
  Plus, Pencil, Trash2, X, Loader2, FileText, CheckCircle,
  Eye, EyeOff, Search,
} from 'lucide-react'

type FormState = {
  title: string
  excerpt: string
  content: string
  status: 'published' | 'draft'
  cover_image: File | null
}

const emptyForm: FormState = {
  title: '',
  excerpt: '',
  content: '',
  status: 'draft',
  cover_image: null,
}

function StatusBadge({ status }: { status: 'published' | 'draft' }) {
  return status === 'published' ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <Eye size={10} /> Terbit
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
      <EyeOff size={10} /> Draf
    </span>
  )
}

export default function AdminArticlesPage() {
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'published' | 'draft' | ''>('')

  const [saving, setSaving] = useState(false)
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Article | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await articleService.getAll({
        status: filterStatus || undefined,
        search: search || undefined,
        limit: 50,
      })
      setItems(res.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search])

  useEffect(() => { loadItems() }, [loadItems])

  function openAdd() {
    setEditItem(null)
    setForm(emptyForm)
    setCoverPreview(null)
    setFormError('')
    setModalOpen(true)
  }

  async function openEdit(a: Article) {
    setFormError('')
    setCoverPreview(a.cover_image ? getImageUrl(a.cover_image) : null)
    // Fetch full content
    try {
      const res = await articleService.getBySlug(a.slug)
      const full = res.data
      setEditItem(full)
      setForm({
        title: full.title,
        excerpt: full.excerpt ?? '',
        content: full.content ?? '',
        status: full.status,
        cover_image: null,
      })
    } catch {
      setEditItem(a)
      setForm({
        title: a.title,
        excerpt: a.excerpt ?? '',
        content: a.content ?? '',
        status: a.status,
        cover_image: null,
      })
    }
    setModalOpen(true)
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({ ...f, cover_image: file }))
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('excerpt', form.excerpt)
      fd.append('content', form.content)
      fd.append('status', form.status)
      if (form.cover_image) fd.append('cover_image', form.cover_image)

      if (editItem) {
        await articleService.update(editItem.slug, fd)
      } else {
        await articleService.create(fd)
      }

      setModalOpen(false)
      setSuccessMsg(editItem ? 'Artikel berhasil diperbarui.' : 'Artikel berhasil ditambahkan.')
      setTimeout(() => setSuccessMsg(''), 3000)
      loadItems()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal menyimpan artikel.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish(a: Article) {
    setTogglingSlug(a.slug)
    try {
      const newStatus = a.status === 'published' ? 'draft' : 'published'
      await articleService.togglePublish(a.slug, newStatus)
      loadItems()
    } catch {
      // ignore
    } finally {
      setTogglingSlug(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await articleService.delete(deleteTarget.slug)
      setDeleteTarget(null)
      loadItems()
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={24} style={{ color: '#5C8A36' }} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Artikel</h1>
            <p className="text-xs text-slate-500">Kelola artikel dan publikasi konten blog</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#5C8A36' }}
        >
          <Plus size={16} /> Tulis Artikel
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul artikel..."
            className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-slate-400 transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'published' | 'draft' | '')}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400 transition bg-white"
        >
          <option value="">Semua Status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draf</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#5C8A36' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-400 py-20 text-sm">Belum ada artikel.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-16">Cover</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Judul</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Penulis</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Terbit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      {a.cover_image ? (
                        <Image
                          src={getImageUrl(a.cover_image)}
                          alt={a.title}
                          width={48}
                          height={36}
                          unoptimized
                          className="w-12 h-9 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <FileText size={16} className="text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 line-clamp-1">{a.title}</div>
                      <div className="text-xs text-slate-400 font-mono">{a.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublish(a)}
                        disabled={togglingSlug === a.slug}
                        title={a.status === 'published' ? 'Jadikan Draf' : 'Terbitkan'}
                        className="transition hover:opacity-75"
                      >
                        {togglingSlug === a.slug ? (
                          <Loader2 size={14} className="animate-spin text-slate-400" />
                        ) : (
                          <StatusBadge status={a.status} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">
                      {a.author?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="font-semibold text-slate-800">
                {editItem ? 'Edit Artikel' : 'Tulis Artikel'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              {/* Cover image */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-2">Cover Artikel</label>
                {coverPreview && (
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    width={400}
                    height={150}
                    unoptimized
                    className="w-full h-36 object-cover rounded-xl mb-2 border border-slate-200"
                  />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverChange}
                  className="text-xs text-slate-500"
                />
                <p className="text-xs text-slate-400 mt-0.5">Max 5MB · JPG, PNG, WebP</p>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Judul *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="Judul artikel..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Ringkasan</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  placeholder="Deskripsi singkat artikel (opsional)..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Konten *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  required
                  rows={10}
                  placeholder="Tulis konten artikel di sini..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition resize-y"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-2">Status Publikasi</label>
                <div className="flex gap-3">
                  {(['draft', 'published'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border transition ${
                        form.status === s
                          ? 'border-transparent text-white'
                          : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                      }`}
                      style={form.status === s ? { backgroundColor: '#5C8A36' } : {}}
                    >
                      {s === 'published' ? <Eye size={13} /> : <EyeOff size={13} />}
                      {s === 'published' ? 'Terbitkan' : 'Simpan Draf'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
                  style={{ backgroundColor: '#5C8A36' }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? 'Menyimpan...' : 'Simpan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2 shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Hapus Artikel</h3>
                <p className="text-sm text-slate-500">
                  Hapus artikel <span className="font-medium text-slate-700">&quot;{deleteTarget.title}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 text-sm"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : null}
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
