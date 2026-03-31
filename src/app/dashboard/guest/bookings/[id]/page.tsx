'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { bookingService } from '@/services/bookingService'
import { paymentService } from '@/services/paymentService'
import { reviewService } from '@/services/reviewService'
import { formatCurrency, formatDate, calculateNights } from '@/utils'
import {
  ArrowLeft, AlertCircle, Loader2, Hash, MapPin, Calendar,
  CreditCard, Star, CheckCircle, Users, BadgeCheck
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Menunggu Konfirmasi', color: '#b45309', bg: '#fef3c7' },
  confirmed: { label: 'Dikonfirmasi',        color: '#1d4ed8', bg: '#dbeafe' },
  paid:      { label: 'Lunas',               color: '#15803d', bg: '#dcfce7' },
  cancelled: { label: 'Dibatalkan',          color: '#b91c1c', bg: '#fee2e2' },
}

const PAYMENT_METHODS = [
  { value: 'transfer_bca',     label: 'Transfer BCA' },
  { value: 'transfer_mandiri', label: 'Transfer Mandiri' },
  { value: 'transfer_bri',     label: 'Transfer BRI' },
  { value: 'transfer_bni',     label: 'Transfer BNI' },
  { value: 'dana',             label: 'DANA' },
  { value: 'gopay',            label: 'GoPay' },
  { value: 'ovo',              label: 'OVO' },
]

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <Star
            size={28}
            className={`transition ${(hover || value) >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
          />
        </button>
      ))}
    </div>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  // Payment form state
  const [method, setMethod] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const [payDone, setPayDone] = useState(false)

  // Review form state
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewDone, setReviewDone] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getById(id),
  })

  const { data: paymentData } = useQuery({
    queryKey: ['payment-booking', id],
    queryFn: () => paymentService.getByBookingId(id),
  })

  const booking = data?.data
  const payment = paymentData?.data

  const nights = booking?.checkInDate && booking?.checkOutDate
    ? calculateNights(booking.checkInDate, booking.checkOutDate)
    : 0
  const total = (booking?.villaPrice ?? 0) * Math.max(nights, 0)

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!method) { setPayError('Pilih metode pembayaran'); return }
    if (!booking) return
    setPayLoading(true)
    setPayError('')
    try {
      await paymentService.create({ booking_id: booking.id, amount: total, method })
      setPayDone(true)
      refetch()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPayError(msg || 'Gagal membuat pembayaran')
    } finally {
      setPayLoading(false)
    }
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setReviewError('Pilih bintang rating'); return }
    if (!booking?.villa_id) return
    setReviewLoading(true)
    setReviewError('')
    try {
      await reviewService.create({ villa_id: booking.villa_id, rating, comment })
      setReviewDone(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setReviewError(msg || 'Gagal mengirim ulasan')
    } finally {
      setReviewLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin" style={{ color: '#5C8A36' }} />
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="flex flex-col items-center py-12 text-slate-400 gap-2">
        <AlertCircle size={32} className="text-red-300" />
        <p className="text-sm">Booking tidak ditemukan.</p>
        <button onClick={() => router.back()} className="text-xs hover:underline" style={{ color: '#5C8A36' }}>← Kembali</button>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[booking.status] ?? { label: booking.status, color: '#64748b', bg: '#f1f5f9' }
  const canPay = (booking.status === 'pending' || booking.status === 'confirmed') && !payDone && payment?.status !== 'paid'
  const canReview = booking.status === 'paid' && !!booking.villa_id && !reviewDone

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition text-sm mb-5">
        <ArrowLeft size={15} /> Kembali
      </button>

      {/* Booking info card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden mb-4">
        {/* Status header */}
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Kode Booking</p>
            <p className="font-mono font-bold text-base tracking-widest" style={{ color: '#3A6928' }}>
              {booking.bookingCode ?? `#${booking.id}`}
            </p>
          </div>
          <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Villa</p>
            <p className="font-semibold text-slate-800">{booking.villaName}</p>
            {booking.villaLocation && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {booking.villaLocation}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {booking.checkInDate && (
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-0.5"><Calendar size={10} /> Check-in</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(booking.checkInDate)}</p>
              </div>
            )}
            {booking.checkOutDate && (
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-0.5"><Calendar size={10} /> Check-out</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(booking.checkOutDate)}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {booking.numberOfGuests && (
              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-0.5"><Users size={10} /> Tamu</p>
                <p className="text-sm font-medium text-slate-700">{booking.numberOfGuests} orang</p>
              </div>
            )}
            {nights > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Durasi</p>
                <p className="text-sm font-medium text-slate-700">{nights} malam</p>
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{formatCurrency(booking.villaPrice ?? 0)} × {nights} malam</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span style={{ color: '#3A6928' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment status block */}
      {payment && payment.status === 'paid' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <BadgeCheck size={22} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700">Pembayaran Lunas</p>
            <p className="text-xs text-green-600 mt-0.5">
              {formatCurrency(payment.amount)} via {payment.method ?? '-'}
              {payment.paid_at && ` · ${formatDate(payment.paid_at)}`}
            </p>
          </div>
        </div>
      )}

      {payment && payment.status === 'pending' && !payDone && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <CreditCard size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Menunggu Verifikasi Pembayaran</p>
            <p className="text-xs text-amber-600 mt-0.5">{formatCurrency(payment.amount)} via {payment.method ?? '-'}</p>
          </div>
        </div>
      )}

      {/* Payment form */}
      {canPay && payment?.status !== 'pending' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4">
          <h2 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <CreditCard size={15} style={{ color: '#5C8A36' }} /> Lakukan Pembayaran
          </h2>

          {payDone ? (
            <div className="text-center py-4">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-sm font-semibold text-green-700">Pembayaran berhasil dikirim!</p>
              <p className="text-xs text-slate-400 mt-1">Menunggu konfirmasi dari pengelola.</p>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-2">Total yang harus dibayar:</p>
                <p className="text-xl font-bold" style={{ color: '#3A6928' }}>{formatCurrency(total)}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Metode Pembayaran</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-green-400"
                >
                  <option value="">-- Pilih metode --</option>
                  {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {payError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{payError}</p>}
              <button
                type="submit"
                disabled={payLoading}
                className="w-full text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{ background: '#5C8A36' }}
              >
                {payLoading ? <><Loader2 size={14} className="animate-spin" />Memproses...</> : 'Konfirmasi Pembayaran'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Cancelled info */}
      {booking.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm font-semibold text-red-600">Booking ini telah dibatalkan</p>
          <p className="text-xs text-red-400 mt-1">Jika ada pertanyaan, hubungi pengelola.</p>
        </div>
      )}

      {/* Review section */}
      {canReview && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4">
          <h2 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <Star size={15} style={{ color: '#f59e0b' }} /> Beri Ulasan
          </h2>

          {reviewDone ? (
            <div className="text-center py-4">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-sm font-semibold text-green-700">Terima kasih atas ulasan Anda!</p>
            </div>
          ) : (
            <form onSubmit={handleReview} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-2">Rating</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Komentar (opsional)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan pengalaman Anda..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-green-400 resize-none"
                />
              </div>
              {reviewError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{reviewError}</p>}
              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{ background: '#f59e0b' }}
              >
                {reviewLoading ? <><Loader2 size={14} className="animate-spin" />Mengirim...</> : 'Kirim Ulasan'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Contact owner */}
      {booking.villaName && (
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Butuh bantuan?{' '}
            <a href="/dashboard/guest/messages" className="hover:underline font-medium" style={{ color: '#5C8A36' }}>
              Hubungi pengelola
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
