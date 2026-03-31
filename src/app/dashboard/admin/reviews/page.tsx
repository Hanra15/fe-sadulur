'use client'

import { useEffect, useState, useCallback } from 'react'
import { reviewService } from '@/services/reviewService'
import { Review } from '@/types'
import { formatDate } from '@/utils'
import {
  Star, Trash2, X, ChevronLeft, ChevronRight, Search,
} from 'lucide-react'

const LIMIT = 15

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={12} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [filterRating, setFilterRating] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [detail, setDetail] = useState<Review | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadReviews = useCallback(async (p = 1, r = filterRating) => {
    setLoading(true)
    try {
      const res = await reviewService.getAll({ page: p, limit: LIMIT, rating: r ? Number(r) : undefined })
      setReviews(res.data)
      setTotalPages(res.pagination?.totalPages ?? 1)
      setTotal(res.pagination?.total ?? res.data.length)
      setPage(p)
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [filterRating])

  useEffect(() => { loadReviews(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleRatingFilter(r: string) {
    setFilterRating(r)
    loadReviews(1, r)
  }

  async function openDetail(rv: Review) {
    setDetail(rv)
    setDetailLoading(true)
    try {
      const res = await reviewService.getById(rv.id)
      setDetail(res.data)
    } catch {
      // keep basic data
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await reviewService.delete(deleteTarget.id)
      setDeleteTarget(null)
      loadReviews(page)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const filteredReviews = search
    ? reviews.filter(r =>
        r.reviewer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.villa?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase())
      )
    : reviews

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Manajemen Ulasan</h1>
          <p className="text-xs text-slate-400">{total} ulasan terdaftar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400"
            placeholder="Cari reviewer, villa, komentar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[{ v: '', l: 'Semua' }, ...([5,4,3,2,1].map(n => ({ v: String(n), l: `${n} ⭐` })))].map(r => (
            <button
              key={r.v}
              onClick={() => handleRatingFilter(r.v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition
                ${filterRating === r.v ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">Reviewer</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Villa</th>
                <th className="text-center px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Komentar</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Tanggal</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Memuat...</td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Tidak ada ulasan</td></tr>
              ) : filteredReviews.map(rv => (
                <tr key={rv.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{rv.reviewer?.name ?? '-'}</div>
                      <div className="text-xs text-slate-400">{rv.reviewer?.email ?? ''}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm hidden sm:table-cell">{rv.villa?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <StarRating rating={rv.rating} />
                      <span className="text-xs text-slate-400">{rv.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell max-w-[200px]">
                    <span className="line-clamp-2">{rv.comment}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                    {rv.created_at ? formatDate(rv.created_at) : rv.createdAt ? formatDate(rv.createdAt) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openDetail(rv)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition text-xs font-medium"
                        title="Lihat detail"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => setDeleteTarget(rv)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => loadReviews(page - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={14} /></button>
              <button disabled={page >= totalPages} onClick={() => loadReviews(page + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star size={15} className="text-amber-400 fill-amber-400" />
                <h2 className="font-bold text-slate-800 text-sm">Detail Ulasan</h2>
              </div>
              <button onClick={() => setDetail(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            {detailLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Reviewer" value={detail.reviewer?.name ?? '-'} />
                  <InfoRow label="Email" value={detail.reviewer?.email ?? '-'} />
                  {detail.reviewer?.phone && <InfoRow label="Telepon" value={detail.reviewer.phone} />}
                  <InfoRow label="Villa" value={detail.villa?.name ?? '-'} />
                  {detail.villa?.location && <InfoRow label="Lokasi" value={detail.villa.location} />}
                  <InfoRow label="Tanggal" value={detail.created_at ? formatDate(detail.created_at) : detail.createdAt ? formatDate(detail.createdAt) : '-'} />
                </div>
                <div>
                  <StarRating rating={detail.rating} />
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1 font-medium">Komentar</p>
                  <p className="text-sm text-slate-700">{detail.comment}</p>
                </div>
              </div>
            )}
            <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setDeleteTarget(detail); setDetail(null) }} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition">Hapus Ulasan</button>
              <button onClick={() => setDetail(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Hapus Ulasan?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Ulasan dari <span className="font-semibold text-slate-700">{deleteTarget.reviewer?.name ?? 'pengguna'}</span> untuk villa{' '}
              <span className="font-semibold text-slate-700">{deleteTarget.villa?.name ?? ''}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700 break-all">{value}</p>
    </div>
  )
}
