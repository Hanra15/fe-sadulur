'use client'

import { useState } from 'react'
import { Villa } from '@/types'
import { calculateNights, formatCurrency } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, Users, CheckCircle } from 'lucide-react'

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
  const [submitted, setSubmitted] = useState(false)

  const nights = form.check_in && form.check_out ? calculateNights(form.check_in, form.check_out) : 0
  const total = nights > 0 ? nights * villa.price : 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'guests' ? Number(value) : value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    // TODO: Integrasikan dengan bookingService.create() saat API tersedia
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={40} className="text-emerald-500 mx-auto mb-2" />
        <p className="font-semibold text-slate-700">Booking berhasil dikirim!</p>
        <p className="text-xs text-slate-400 mt-1">Tim pengelola akan segera menghubungi Anda.</p>
        <button onClick={onCancel} className="mt-4 text-emerald-600 text-sm hover:underline">Tutup</button>
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
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-emerald-400"
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
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-emerald-400"
          placeholder="email@contoh.com"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">No. HP</label>
        <input
          name="guest_phone"
          value={form.guest_phone}
          onChange={handleChange}
          required
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-emerald-400"
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
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm mt-1 outline-none focus:border-emerald-400"
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
            className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm mt-1 outline-none focus:border-emerald-400"
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
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-emerald-400"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500 font-medium">Catatan (opsional)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-emerald-400 resize-none"
          placeholder="Permintaan khusus..."
        />
      </div>

      {/* Total */}
      {nights > 0 && (
        <div className="bg-emerald-50 rounded-xl p-3 text-sm text-slate-600 border border-emerald-100">
          <div className="flex justify-between">
            <span>{formatCurrency(villa.price)} × {nights} malam</span>
            <span className="font-bold text-emerald-700">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">Batal</button>
        <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition">Pesan</button>
      </div>
    </form>
  )
}
