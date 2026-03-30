'use client'

import { useEffect, useState, useCallback } from 'react'
import { bookingService, BookingStatus } from '@/services/bookingService'
import { Booking } from '@/types'
import { formatDate, formatCurrency } from '@/utils'
import { Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: '', label: 'Semua Status', color: '' },
  { value: 'pending', label: 'Menunggu', color: 'bg-amber-50 text-amber-700' },
  { value: 'confirmed', label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-700' },
  { value: 'paid', label: 'Dibayar', color: 'bg-green-50 text-green-700' },
  { value: 'cancelled', label: 'Dibatalkan', color: 'bg-red-50 text-red-600' },
]

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(s => s.value === status)
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt?.color ?? 'bg-slate-100 text-slate-600'}`}>
      {opt?.label ?? status}
    </span>
  )
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterStatus, setFilterStatus] = useState('')

  const [updatingId, setUpdatingId] = useState<string | number | null>(null)
  const [deleteId, setDeleteId] = useState<string | number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const LIMIT = 15

  const loadBookings = useCallback(async (p = 1, status = filterStatus) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: p, limit: LIMIT }
      if (status) params.status = status
      const res = await bookingService.getAllBookings(params)
      setBookings((res as never as { data: Booking[] }).data)
      const pg = (res as never as { pagination?: { total: number; totalPages: number }; total?: number }).pagination
      setTotalPages(pg?.totalPages ?? 1)
      setTotal(pg?.total ?? (res as never as { total?: number }).total ?? 0)
      setPage(p)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { loadBookings(1) }, []) // eslint-disable-line

  async function handleStatusChange(id: string | number, status: BookingStatus) {
    setUpdatingId(id)
    try {
      await bookingService.updateStatus(id, status)
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b))
    } catch { /* ignore */ }
    finally { setUpdatingId(null) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await bookingService.delete(deleteId)
      setDeleteId(null)
      loadBookings(page)
    } catch { /* ignore */ }
    finally { setDeleting(false) }
  }

  function handleFilter(status: string) {
    setFilterStatus(status)
    loadBookings(1, status)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Semua Booking</h1>
          <p className="text-xs text-slate-400">{total} booking ditemukan</p>
        </div>
        <button onClick={() => loadBookings(page)} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => handleFilter(s.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              filterStatus === s.value
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">Kode / Tamu</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Villa</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Check-in</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Harga</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Memuat...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Tidak ada booking</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{b.customerName}</div>
                    <div className="text-xs text-slate-400">{b.bookingCode ?? `#${b.id}`}</div>
                    <div className="text-xs text-slate-400 md:hidden">{b.villaName}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600 max-w-[130px] truncate">{b.villaName ?? '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
                    {b.checkInDate ? formatDate(b.checkInDate) : '—'}
                    {b.checkOutDate && <div>{formatDate(b.checkOutDate)}</div>}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell text-slate-700 font-medium">
                    {b.villaPrice ? formatCurrency(b.villaPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={e => handleStatusChange(b.id, e.target.value as BookingStatus)}
                        className="text-xs border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-purple-400 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.filter(s => s.value).map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition">
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
              <button disabled={page <= 1} onClick={() => loadBookings(page - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page >= totalPages} onClick={() => loadBookings(page + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Hapus Booking?</h3>
            <p className="text-sm text-slate-500 mb-5">Data booking ini akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Batal</button>
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
