'use client'

import { useState } from 'react'
import { Villa } from '@/types'
import { calculateNights, formatCurrency } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { bookingService } from '@/services/bookingService'
import { Calendar, Users, CheckCircle, Loader2 } from 'lucide-react'

interface Props {
  villa: Villa
  onCancel: () => void
}

export default function BookingForm({ villa, onCancel }: Props) {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    guest_name: user?.name || '',
    guest_email: user?.email || '',
    guest_phone: user?.phone || '',
    check_in: '',
    check_out: '',
    guests: 1,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingCode, setBookingCode] = useState('')

  const nights = form.check_in && form.check_out ? calculateNights(form.check_in, form.check_out) : 0
  const total = nights > 0 ? nights * villa.price : 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'guests' ? Number(value) : value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      router.push(`/login?redirect=/villas/${villa.slug ?? villa.id}`)
      return
    }
    if (nights <= 0) {
      setError('Pilih tanggal check-in dan check-out yang valid')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await bookingService.create({
        villa_slug: villa.slug ?? String(villa.id),
        customerName: form.guest_name,
        customerPhone: form.guest_phone,
        customerEmail: form.guest_email || undefined,
        checkInDate: form.check_in,
        checkOutDate: form.check_out,
        numberOfGuests: form.guests,
      })
      setBookingCode(res.data?.bookingCode ?? '')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Gagal membuat booking. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (bookingCode) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={40} className="mx-auto mb-2" style={{ color: '#5C8A36' }} />
        <p className="font-semibold text-slate-700">Booking berhasil!</p>
        <div className="mt-2 mb-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 inline-block">
          <p className="text-xs text-slate-400">Kode Booking</p>
          <p className="font-mono font-bold text-base tracking-widest" style={{ color: '#3A6928' }}>{bookingCode}</p>
        </div>
        <p className="text-xs text-slate-400">Pengelola akan menghubungi Anda segera.</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm hover:bg-slate-50">Tutup</button>
          <button onClick={() => router.push('/dashboard/guest/bookings')} className="flex-1 text-white py-2 rounded-xl text-sm font-semibold" style={{ background: '#5C8A36' }}>Lihat Booking</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 font-medium">Nama Lengkap</label>
        <input
          name="guest_name"
          value={form.guest_name}
          onChange={handleChange}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-brand-primary"
          placeholder="Nama lengkap"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Email</label>
        <input
          name="guest_email"
          type="email"
          value={form.guest_email}
          onChange={handleChange}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-brand-primary"
          placeholder="email@contoh.com"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">No. HP <span className="text-red-400">*</span></label>
        <input
          name="guest_phone"
          value={form.guest_phone}
          onChange={handleChange}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-brand-primary"
          placeholder="08xxxxxxxxxx"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-500 font-medium flex items-center gap-1"><Calendar size={11} /> Check-in</label>
          <input
            name="check_in"
            type="date"
            value={form.check_in}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm mt-1 outline-none focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium flex items-center gap-1"><Calendar size={11} /> Check-out</label>
          <input
            name="check_out"
            type="date"
            value={form.check_out}
            onChange={handleChange}
            required
            min={form.check_in || new Date().toISOString().split('T')[0]}
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm mt-1 outline-none focus:border-brand-primary"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium flex items-center gap-1"><Users size={11} /> Jumlah Tamu</label>
        <input
          name="guests"
          type="number"
          min={1}
          max={villa.capacity || 20}
          value={form.guests}
          onChange={handleChange}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-brand-primary"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Catatan (opsional)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-brand-primary resize-none"
          placeholder="Permintaan khusus..."
        />
      </div>

      {/* Total */}
      {nights > 0 && (
        <div className="rounded-xl p-3 text-sm text-slate-600 border" style={{ backgroundColor: '#EEF5E6', borderColor: '#c6dfa8' }}>
          <div className="flex justify-between">
            <span>{formatCurrency(villa.price)} × {nights} malam</span>
            <span className="font-bold" style={{ color: '#3A6928' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">Batal</button>
        <button type="submit" disabled={loading} className="flex-1 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60" style={{ backgroundColor: '#5C8A36' }}>
          {loading ? <><Loader2 size={14} className="animate-spin" />Memproses...</> : 'Pesan'}
        </button>
      </div>
    </form>
  )
}
