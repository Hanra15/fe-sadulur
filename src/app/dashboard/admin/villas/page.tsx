'use client'

import { useEffect, useState } from 'react'
import { villaService, VillaFormPayload } from '@/services/villaService'
import { Villa } from '@/types'
import { formatCurrency, getVillaThumbnail } from '@/utils'
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import Image from 'next/image'
import ImageUploader, { UploadedImage } from '@/components/ui/ImageUploader'

const EMPTY_FORM: VillaFormPayload = {
  name: '', location: '', description: '', price: 0,
  priceWeekend: undefined, capacity: 1, bedrooms: 1, bathrooms: 1,
  whatsapp: '', facilities: [], available: true,
  lat: undefined, lng: undefined,
  imageUrls: [], imageFiles: [],
}

export default function AdminVillasPage() {
  const [villas, setVillas] = useState<Villa[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [editVilla, setEditVilla] = useState<Villa | null>(null)
  const [form, setForm] = useState<VillaFormPayload>(EMPTY_FORM)
  const [facilitiesInput, setFacilitiesInput] = useState('')
  // New-upload images (local File objects + previews)
  const [newImages, setNewImages] = useState<UploadedImage[]>([])
  // Existing server image URLs to keep
  const [keepUrls, setKeepUrls] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const LIMIT = 10

  async function loadVillas(p = 1) {
    setLoading(true)
    try {
      const res = await villaService.getAll({ page: p, limit: LIMIT } as never)
      setVillas(res.data)
      const pg = res.pagination
      setTotalPages(pg?.totalPages ?? 1)
      setTotal(pg?.total ?? res.data.length)
      setPage(p)
    } catch {
      setVillas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVillas(1) }, [])

  function openAdd() {
    setEditVilla(null)
    setForm(EMPTY_FORM)
    setFacilitiesInput('')
    setNewImages([])
    setKeepUrls([])
    setError('')
    setShowModal(true)
  }

  function openEdit(v: Villa) {
    setEditVilla(v)
    setForm({
      name: v.name, location: v.location, description: v.description,
      price: v.price, priceWeekend: v.priceWeekend, capacity: v.capacity,
      bedrooms: v.bedrooms ?? 1, bathrooms: v.bathrooms ?? 1,
      whatsapp: v.whatsapp ?? '', facilities: v.facilities ?? [],
      available: v.available, lat: v.lat, lng: v.lng,
      imageUrls: v.images ?? [],
      imageFiles: [],
    })
    setFacilitiesInput((v.facilities ?? []).join(', '))
    setKeepUrls(v.images ?? [])
    setNewImages([])
    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name || !form.location) { setError('Nama dan Lokasi wajib diisi'); return }
    setSaving(true); setError('')
    const payload: VillaFormPayload = {
      ...form,
      facilities: facilitiesInput.split(',').map(s => s.trim()).filter(Boolean),
      imageUrls: keepUrls,
      imageFiles: newImages.map(i => i.file),
    }
    try {
      if (editVilla) {
        await villaService.update(editVilla.id, payload)
      } else {
        await villaService.create(payload)
      }
      setShowModal(false)
      loadVillas(page)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err?.response?.data?.message ?? 'Gagal menyimpan data villa')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await villaService.delete(deleteId)
      setDeleteId(null)
      loadVillas(page)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const setField = <K extends keyof VillaFormPayload>(k: K, v: VillaFormPayload[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Manajemen Villa</h1>
          <p className="text-xs text-slate-400">{total} villa terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition">
          <Plus size={15} /> Tambah Villa
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">Villa</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Lokasi</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Harga/Malam</th>
                <th className="text-center px-4 py-3 hidden md:table-cell">Kapasitas</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Memuat...</td></tr>
              ) : villas.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Belum ada villa</td></tr>
              ) : villas.map(v => (
                <tr key={v.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
                        {v.images?.length ? (
                          <Image src={getVillaThumbnail(v)} alt={v.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><ImageOff size={14} className="text-slate-300" /></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 truncate max-w-[140px]">{v.name}</div>
                        <div className="text-xs text-slate-400">ID #{v.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-[140px] truncate">{v.location}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell font-medium text-slate-700">{formatCurrency(v.price)}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell text-slate-600">{v.capacity} orang</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {v.available ? 'Tersedia' : 'Tutup'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => loadVillas(page - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page >= totalPages} onClick={() => loadVillas(page + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editVilla ? 'Edit Villa' : 'Tambah Villa Baru'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}

              <div className="grid grid-cols-1 gap-3">
                <FormField label="Nama Villa*">
                  <input className="input-base" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Contoh: Villa Bukit Indah" />
                </FormField>
                <FormField label="Lokasi*">
                  <input className="input-base" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Contoh: Puncak, Bogor" />
                </FormField>
                <FormField label="Deskripsi">
                  <textarea className="input-base" rows={3} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Deskripsi villa..." />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Harga/Malam (Rp)*">
                    <input type="number" className="input-base" value={form.price} onChange={e => setField('price', Number(e.target.value))} min={0} />
                  </FormField>
                  <FormField label="Harga Weekend (Rp)">
                    <input type="number" className="input-base" value={form.priceWeekend ?? ''} onChange={e => setField('priceWeekend', e.target.value ? Number(e.target.value) : undefined)} min={0} />
                  </FormField>
                  <FormField label="Kapasitas*">
                    <input type="number" className="input-base" value={form.capacity} onChange={e => setField('capacity', Number(e.target.value))} min={1} />
                  </FormField>
                  <FormField label="Kamar Tidur">
                    <input type="number" className="input-base" value={form.bedrooms ?? ''} onChange={e => setField('bedrooms', Number(e.target.value))} min={0} />
                  </FormField>
                  <FormField label="Kamar Mandi">
                    <input type="number" className="input-base" value={form.bathrooms ?? ''} onChange={e => setField('bathrooms', Number(e.target.value))} min={0} />
                  </FormField>
                  <FormField label="No. WhatsApp">
                    <input className="input-base" value={form.whatsapp ?? ''} onChange={e => setField('whatsapp', e.target.value)} placeholder="628xxxxxxxx" />
                  </FormField>
                  <FormField label="Latitude">
                    <input type="number" step="any" className="input-base" value={form.lat ?? ''} onChange={e => setField('lat', e.target.value ? Number(e.target.value) : undefined)} />
                  </FormField>
                  <FormField label="Longitude">
                    <input type="number" step="any" className="input-base" value={form.lng ?? ''} onChange={e => setField('lng', e.target.value ? Number(e.target.value) : undefined)} />
                  </FormField>
                </div>

                <FormField label="Fasilitas (pisahkan koma)">
                  <input className="input-base" value={facilitiesInput} onChange={e => setFacilitiesInput(e.target.value)} placeholder="Kolam renang, WiFi, Dapur" />
                </FormField>
                {/* Image upload section */}
                <FormField label="Foto Villa (maks. 10 gambar)">
                  <ImageUploader
                    images={newImages}
                    onChange={setNewImages}
                    existingUrls={keepUrls}
                    onRemoveExisting={url => setKeepUrls(prev => prev.filter(u => u !== url))}
                    maxImages={10}
                  />
                </FormField>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="avail" checked={form.available} onChange={e => setField('available', e.target.checked)} className="w-4 h-4 accent-purple-600" />
                  <label htmlFor="avail" className="text-sm text-slate-700">Villa tersedia untuk booking</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Hapus Villa?</h3>
            <p className="text-sm text-slate-500 mb-5">Data villa dan gambarnya akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input-base {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.625rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus { border-color: #9333ea; box-shadow: 0 0 0 2px rgba(147,51,234,0.1); }
      `}</style>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
