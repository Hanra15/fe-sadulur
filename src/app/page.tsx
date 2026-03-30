import SearchBar from '@/components/villa/SearchBar'
import VillaListSection from '@/components/villa/VillaListSection'
import { Shield, MapPin, Star, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            Liburan Seru di{' '}
            <span className="text-amber-300">Puncak Bogor</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Temukan villa & penginapan terbaik dekat Taman Safari. Nikmati udara segar, pemandangan hijau, dan pengalaman tak terlupakan bersama keluarga.
          </p>
          <div className="flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-3">
          Kenapa Memilih Villa Sadulur?
        </h2>
        <p className="text-slate-500 text-center mb-10">Pengalaman menginap yang aman, nyaman, dan berkesan</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Shield className="text-emerald-500" size={32} />, title: 'Terpercaya', desc: 'Semua villa telah terverifikasi oleh tim Villa Sadulur.' },
            { icon: <MapPin className="text-emerald-500" size={32} />, title: 'Lokasi Strategis', desc: 'Dekat Taman Safari, wisata alam, dan kuliner Puncak Bogor.' },
            { icon: <Star className="text-emerald-500" size={32} />, title: 'Kualitas Terbaik', desc: 'Fasilitas lengkap dengan harga terjangkau untuk semua kalangan.' },
            { icon: <Clock className="text-emerald-500" size={32} />, title: 'Booking Mudah', desc: 'Proses pemesanan cepat, konfirmasi instan, 24 jam.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition">
              <div className="flex justify-center mb-3">{item.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daftar Villa */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Villa Pilihan</h2>
              <p className="text-slate-500 mt-1">Villa terpopuler di kawasan Puncak Bogor</p>
            </div>
            <a href="/villas" className="text-emerald-600 hover:underline text-sm font-medium hidden sm:block">
              Lihat semua →
            </a>
          </div>
          <VillaListSection limit={6} />
          <div className="text-center mt-8 sm:hidden">
            <a href="/villas" className="inline-block border border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full text-sm font-medium transition">
              Lihat Semua Villa
            </a>
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-3">Kata Mereka</h2>
        <p className="text-slate-500 text-center mb-10">Pengalaman tamu yang pernah menginap di Villa Sadulur</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Rina Supriati', review: 'Villa-nya bersih dan nyaman banget! Anak-anak senang main di sekitar villa. Sangat recommended buat keluarga!', rating: 5 },
            { name: 'Budi Santoso', review: 'Lokasi strategis dekat Taman Safari, jalannya gampang. Pengelola juga responsif dan ramah. Pasti balik lagi!', rating: 5 },
            { name: 'Dewi Kurnia', review: 'Booking gampang banget lewat aplikasi, harga juga transparan. Pemandangannya luar biasa, udara segerrrr banget.', rating: 4 },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm mb-4 italic">&ldquo;{t.review}&rdquo;</p>
              <p className="text-slate-800 font-semibold text-sm">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Siap Liburan ke Puncak Bogor?</h2>
          <p className="text-emerald-100 mb-8">Booking villa impianmu sekarang dan nikmati momen tak terlupakan bersama orang-orang tersayang.</p>
          <a href="/villas" className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-3 rounded-full transition inline-block">
            Cari Villa Sekarang
          </a>
        </div>
      </section>
    </div>
  )
}

