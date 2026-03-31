'use client'

import { useEffect, useState, useCallback } from 'react'
import { bookingService, BookingStatus } from '@/services/bookingService'
import { Booking } from '@/types'
import { formatCurrency, formatDate } from '@/utils'
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  X, CalendarCheck, Trash2, Eye,
} from 'lucide-react'

const STATUS_TABS: { value: string; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'paid', label: 'Lunas' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  paid:      'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', confirmed: 'Dikonfirmasi', paid: 'Lunas', cancelled: 'Dibatalkan',
}

const LIMIT = 10

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterStatus, setFilterStatus] = useState('')

  const [detail, setDetail] = useState<Booking | null>(null)
  const [updating, setUpdating] = useState<string | number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadBookings = useCallback(async (p = 1, s = filterStatus) => {
    setLoading(true)
    try {
      const res = await bookingService.getAllBookings({
        page: p, limit: LIMIT,
        ...(s ? { status: s } : {}),
      })
      // getAllBookings returns ApiResponse (not paginated), handle both shapes
      const data = res.data ?? []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pagination = (res as any).pagination
      setBookings(Array.isArray(data) ? data : [])
      setTotalPages(pagination?.totalPages ?? 1)
      setTotal(pagination?.total ?? data.length)
      setPage(p)
    } catch { setBookings([]) } finally { setLoading(false) }
  }, [filterStatus])

  useEffect(() => { loadBookings(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabChange(s: string) {
    setFilterStatus(s)
    loadBookings(1, s)
  }

  async function handleStatus(id: string | number, status: BookingStatus) {
    setUpdating(id)
    try {
      await bookingService.updateStatus(id, status)
      setDetail(prev => prev ? { ...prev, status } : prev)
      loadBookings(page, filterStatus)
    } catch {} finally { setUpdating(null) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await bookingService.delete(deleteTarget.id)
      setDeleteTarget(null)
      loadBookings(page, filterStatus)
    } catch {} finally { setDeleting(false) }
  }

  function nightCount(b: Booking) {
    if (!b.checkInDate || !b.checkOutDate) return null
    const diff = new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()
    return Math.ceil(diff / 86400000)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-800">Booking Masuk</h1>
        <p className="text-xs text-slate-400">{total} total booking</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => handleTabChange(t.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition
              ${filterStatus === t.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">Tamu</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Villa</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Check-in</th>
                <th className="text-right px-4 py-3 hidden lg:table-cell">Total</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Memuat...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Tidak ada booking</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 text-sm">{b.customerName}</div>
                    <div className="text-xs text-slate-400">{b.customerPhone}</div>
                    {b.bookingCode && <div className="text-xs text-slate-300 font-mono">{b.bookingCode}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{b.villaName ?? `Villa #${b.villa_id}`}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                    {b.checkInDate ? formatDate(b.checkInDate) : '—'}
                    {nightCount(b) && <div className="text-slate-300">{nightCount(b)} malam</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700 text-sm hidden lg:table-cell">
                    {b.totalPrice ? formatCurrency(b.totalPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[b.status]}`}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setDetail(b)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition" title="Detail"><Eye size={13} /></button>
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatus(b.id, 'confirmed')} disabled={updating === b.id} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition disabled:opacity-40" title="Konfirmasi">
                            <CheckCircle2 size={13} />
                          </button>
                          <button onClick={() => handleStatus(b.id, 'cancelled')} disabled={updating === b.id} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-40" title="Tolak">
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => handleStatus(b.id, 'cancelled')} disabled={updating === b.id} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-40" title="Batalkan">
                          <XCircle size={13} />
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition" title="Hapus"><Trash2 size={13} /></button>
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
              <button disabled={page <= 1} onClick={() => loadBookings(page - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={14} /></button>
              <button disabled={page >= totalPages} onClick={() => loadBookings(page + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={14} /></button>
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
                <CalendarCheck size={15} className="text-blue-500" />
                <h2 className="font-bold text-slate-800 text-sm">Detail Booking</h2>
              </div>
              <button onClick={() => setDetail(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Kode Booking" value={detail.bookingCode ?? `#${detail.id}`} />
                <InfoRow label="Status">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[detail.status]}`}>
                    {STATUS_LABEL[detail.status]}
                  </span>
                </InfoRow>
                <InfoRow label="Tamu" value={detail.customerName} />
                <InfoRow label="Telepon" value={detail.customerPhone} />
                {detail.customerEmail && <InfoRow label="Email" value={detail.customerEmail} />}
                <InfoRow label="Villa" value={detail.villaName ?? `Villa #${detail.villa_id}`} />
                {detail.villaLocation && <InfoRow label="Lokasi" value={detail.villaLocation} />}
                <InfoRow label="Check-in" value={detail.checkInDate ? formatDate(detail.checkInDate) : '—'} />
                <InfoRow label="Check-out" value={detail.checkOutDate ? formatDate(detail.checkOutDate) : '—'} />
                {nightCount(detail) && <InfoRow label="Durasi" value={`${nightCount(detail)} malam`} />}
                {detail.totalPrice && <InfoRow label="Total Harga" value={formatCurrency(detail.totalPrice)} />}
                {detail.createdAt && <InfoRow label="Dipesan" value={formatDate(detail.createdAt)} />}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
              {detail.status === 'pending' && (
                <>
                  <button onClick={() => handleStatus(detail.id, 'confirmed')} disabled={!!updating}
                    className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-1">
                    <CheckCircle2 size={14} /> Konfirmasi
                  </button>
                  <button onClick={() => handleStatus(detail.id, 'cancelled')} disabled={!!updating}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition flex items-center justify-center gap-1">
                    <XCircle size={14} /> Tolak
                  </button>
                </>
              )}
              {detail.status === 'confirmed' && (
                <button onClick={() => handleStatus(detail.id, 'cancelled')} disabled={!!updating}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition">
                  Batalkan Booking
                </button>
              )}
              <button onClick={() => setDetail(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Hapus Booking?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Booking dari <span className="font-semibold text-slate-700">{deleteTarget.customerName}</span> akan dihapus permanen.
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

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      {children ?? <p className="text-sm font-medium text-slate-700 break-all">{value}</p>}
    </div>
  )
}
