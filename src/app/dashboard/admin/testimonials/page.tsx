'use client'

import { useEffect, useState, useCallback } from 'react'
import { testimonialService } from '@/services/testimonialService'
import { Testimonial } from '@/types'
import { getImageUrl } from '@/utils'
import Image from 'next/image'
import {
  Plus, Pencil, Trash2, X, Loader2, Star, ToggleLeft, ToggleRight,
  MessageSquareQuote, CheckCircle,
} from 'lucide-react'

type FormState = {
  name: string
  position: string
  message: string
  rating: number
  sort_order: number
  is_active: boolean
  photo: File | null
}

const emptyForm: FormState = {
  name: '',
  position: '',
  message: '',
  rating: 5,
  sort_order: 0,
  is_active: true,
  photo: null,
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            size={20}
            className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
          />
        </button>
      ))}
    </div>
  )
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await testimonialService.getAll(true)
      setItems(res.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  function openAdd() {
    setEditItem(null)
    setForm(emptyForm)
    setPhotoPreview(null)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditItem(t)
    setForm({
      name: t.name,
      position: t.position ?? '',
      message: t.message,
      rating: t.rating,
      sort_order: t.sort_order,
      is_active: t.is_active,
      photo: null,
    })
    setPhotoPreview(t.photo ? getImageUrl(t.photo) : null)
    setFormError('')
    setModalOpen(true)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({ ...f, photo: file }))
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('position', form.position)
      fd.append('message', form.message)
      fd.append('rating', String(form.rating))
      fd.append('sort_order', String(form.sort_order))
      fd.append('is_active', String(form.is_active))
      if (form.photo) fd.append('photo', form.photo)

      if (editItem) {
        await testimonialService.update(editItem.id, fd)
      } else {
        await testimonialService.create(fd)
      }

      setModalOpen(false)
      setSuccessMsg(editItem ? 'Testimoni berhasil diperbarui.' : 'Testimoni berhasil ditambahkan.')
      setTimeout(() => setSuccessMsg(''), 3000)
      loadItems()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal menyimpan testimoni.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(t: Testimonial) {
    setTogglingId(t.id)
    try {
      await testimonialService.toggle(t.id)
      loadItems()
    } catch {
      // ignore
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await testimonialService.delete(deleteTarget.id)
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
          <MessageSquareQuote size={24} style={{ color: '#5C8A36' }} />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Testimoni</h1>
            <p className="text-xs text-slate-500">Kelola testimoni yang ditampilkan di halaman utama</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#5C8A36' }}
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#5C8A36' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-400 py-20 text-sm">Belum ada testimoni.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-12">Foto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Nama / Jabatan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Urutan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      {t.photo ? (
                        <Image
                          src={getImageUrl(t.photo)}
                          alt={t.name}
                          width={36}
                          height={36}
                          unoptimized
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: 'linear-gradient(135deg, #3A6928, #5C8A36)' }}
                        >
                          {t.name[0]?.toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.position || '—'}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={12} className={n <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{t.sort_order}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(t)}
                        disabled={togglingId === t.id}
                        title={t.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        className="flex items-center gap-1.5 text-xs font-medium transition"
                      >
                        {togglingId === t.id ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : t.is_active ? (
                          <ToggleRight size={20} style={{ color: '#5C8A36' }} />
                        ) : (
                          <ToggleLeft size={20} className="text-slate-300" />
                        )}
                        <span className={t.is_active ? 'text-green-700' : 'text-slate-400'}>
                          {t.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                {editItem ? 'Edit Testimoni' : 'Tambah Testimoni'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              {/* Photo upload */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-2">Foto</label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      width={56}
                      height={56}
                      unoptimized
                      className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ background: 'linear-gradient(135deg, #3A6928, #5C8A36)' }}
                    >
                      {form.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="text-xs text-slate-500"
                    />
                    <p className="text-xs text-slate-400 mt-0.5">Max 2MB · JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Nama *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Nama tamu"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                />
              </div>

              {/* Position */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Jabatan / Kota</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  placeholder="cth: Jakarta"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Ulasan *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                  rows={3}
                  placeholder="Tulis ulasan tamu..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition resize-none"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-2">Rating</label>
                <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Urutan Tampil</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  min={0}
                  className="w-24 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                />
                <p className="text-xs text-slate-400 mt-0.5">Angka lebih kecil tampil lebih dulu</p>
              </div>

              {/* is_active */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500">Status</label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className="flex items-center gap-1.5 text-sm font-medium transition"
                >
                  {form.is_active ? (
                    <ToggleRight size={22} style={{ color: '#5C8A36' }} />
                  ) : (
                    <ToggleLeft size={22} className="text-slate-300" />
                  )}
                  <span className={form.is_active ? 'text-green-700' : 'text-slate-400'}>
                    {form.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </button>
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
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2 shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Hapus Testimoni</h3>
                <p className="text-sm text-slate-500">
                  Hapus testimoni dari <span className="font-medium text-slate-700">{deleteTarget.name}</span>? Tindakan ini tidak dapat dibatalkan.
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
