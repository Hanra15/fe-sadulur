'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react'

const contactInfo = [
  {
    icon: <MapPin size={22} style={{ color: '#5C8A36' }} />,
    title: 'Alamat',
    lines: ['Jl. Raya Puncak, Cisarua', 'Bogor, Jawa Barat 16750'],
  },
  {
    icon: <Phone size={22} style={{ color: '#5C8A36' }} />,
    title: 'Telepon',
    lines: ['+62 812-3456-7890', '+62 21-8765-4321'],
  },
  {
    icon: <Mail size={22} style={{ color: '#5C8A36' }} />,
    title: 'Email',
    lines: ['info@villa-sadulur.my.id', 'booking@villa-sadulur.my.id'],
  },
  {
    icon: <Clock size={22} style={{ color: '#5C8A36' }} />,
    title: 'Jam Operasional',
    lines: ['Senin – Jumat: 08.00 – 20.00', 'Sabtu – Minggu: 07.00 – 21.00'],
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulasi pengiriman pesan (ganti dengan API call saat backend siap)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="text-white py-16"
        style={{ background: 'linear-gradient(135deg, #2C4B1A 0%, #5C8A36 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Hubungi Kami</h1>
          <p className="text-lg text-slate-200 max-w-xl mx-auto">
            Ada pertanyaan, saran, atau butuh bantuan? Tim kami siap membantu Anda kapan saja.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-10">

          {/* Info Kontak */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Informasi Kontak</h2>
            <p className="text-slate-500 text-sm mb-2">
              Hubungi kami melalui salah satu kanal di bawah ini atau kirim pesan langsung.
            </p>

            {contactInfo.map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm mb-1">{item.title}</p>
                  {item.lines.map((l, j) => (
                    <p key={j} className="text-slate-500 text-sm">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Villa%20Sadulur%2C%20saya%20ingin%20bertanya..."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-2xl transition mt-2"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={20} />
              Chat WhatsApp Sekarang
            </a>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle size={52} className="mx-auto mb-4" style={{ color: '#5C8A36' }} />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Pesan Terkirim!</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Terima kasih telah menghubungi kami. Tim kami akan membalas dalam 1×24 jam.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#5C8A36' }}
                  >
                    Kirim pesan lain
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Kirim Pesan</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Nama Lengkap *</label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Nama Anda"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition"
                          style={{ ['--tw-ring-color' as string]: '#5C8A3640' }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Email *</label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="email@contoh.com"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">No. HP</label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="08xxxxxxxxxx"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Subjek *</label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          required
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition bg-white"
                        >
                          <option value="">Pilih subjek</option>
                          <option value="booking">Pertanyaan Booking</option>
                          <option value="villa">Informasi Villa</option>
                          <option value="keluhan">Keluhan / Saran</option>
                          <option value="kerjasama">Kerja Sama</option>
                          <option value="lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Pesan *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tulis pesan Anda di sini..."
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                      style={{ backgroundColor: '#5C8A36' }}
                    >
                      {loading ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Send size={16} />
                      )}
                      {loading ? 'Mengirim...' : 'Kirim Pesan'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Maps */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Temukan Kami di Peta</h2>
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63360.45824849822!2d106.91!3d-6.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69b5d5c44ca427%3A0x8a82b28f9ef59a14!2sPuncak%2C%20Cisarua%2C%20Bogor%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Lokasi Villa Sadulur"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
