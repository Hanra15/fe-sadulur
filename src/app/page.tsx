import SearchBar from '@/components/villa/SearchBar'
import VillaListSection from '@/components/villa/VillaListSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ArticlesSection from '@/components/home/ArticlesSection'
import { Shield, MapPin, Star, Clock, ArrowRight, CheckCircle, Users, Home } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ========================
          HERO
      ======================== */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a3010 0%, #2C4B1A 40%, #3A6928 70%, #5C8A36 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 rounded-full blur-3xl animate-floatSlow"
          style={{ background: '#A8D87A', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 opacity-10 rounded-full blur-3xl animate-float"
          style={{ background: '#A8D87A', transform: 'translate(-30%, 30%)', animationDelay: '2s' }} />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 animate-fadeInDown backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            #1 Platform Villa di Puncak Bogor
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-5 animate-fadeInUp">
            Liburan Seru di{' '}
            <span className="text-shimmer">Puncak Bogor</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-8 animate-fadeInUp delay-200">
            Temukan villa & penginapan terbaik dekat Taman Safari. Udara segar, pemandangan hijau, kenangan tak terlupakan.
          </p>

          <div className="flex justify-center mb-10 animate-scaleIn delay-300">
            <SearchBar />
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 animate-fadeIn delay-500">
            {[
              { value: '50+', label: 'Villa Pilihan' },
              { value: '5K+', label: 'Tamu Puas' },
              { value: '4.9★', label: 'Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ========================
          KEUNGGULAN
      ======================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 animate-fadeIn" style={{ color: '#5C8A36' }}>
            Kenapa Villa Sadulur?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 animate-fadeInUp delay-100">
            Pengalaman Menginap yang Berbeda
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto animate-fadeInUp delay-200">
            Aman, nyaman, dan berkesan — kami hadir untuk membuat liburanmu sempurna.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            {
              icon: <Shield size={28} style={{ color: '#5C8A36' }} />,
              title: 'Terpercaya',
              desc: 'Semua villa telah terverifikasi oleh tim kami.',
              bg: '#EEF5E6',
            },
            {
              icon: <MapPin size={28} style={{ color: '#3b82f6' }} />,
              title: 'Lokasi Strategis',
              desc: 'Dekat Taman Safari, wisata alam, dan kuliner Puncak.',
              bg: '#eff6ff',
            },
            {
              icon: <Star size={28} style={{ color: '#f59e0b' }} />,
              title: 'Kualitas Terbaik',
              desc: 'Fasilitas lengkap dengan harga terjangkau.',
              bg: '#fffbeb',
            },
            {
              icon: <Clock size={28} style={{ color: '#8b5cf6' }} />,
              title: 'Booking Mudah',
              desc: 'Proses pemesanan cepat, konfirmasi instan.',
              bg: '#f5f3ff',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeInUp group cursor-default"
              style={{ backgroundColor: item.bg, animationDelay: `${i * 0.1 + 0.2}s` }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================
          HOW IT WORKS
      ======================== */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #EEF5E6 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 animate-fadeIn" style={{ color: '#5C8A36' }}>
              Cara Kerja
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 animate-fadeInUp delay-100">
              Booking Villa dalam 3 Langkah
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line desktop */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 opacity-20" style={{ background: '#5C8A36' }} />

            {[
              { step: '01', icon: <MapPin size={22} />, title: 'Cari Villa', desc: 'Temukan villa sesuai budget, kapasitas, dan lokasi favoritmu di Puncak Bogor.' },
              { step: '02', icon: <CheckCircle size={22} />, title: 'Pilih & Booking', desc: 'Isi data pemesanan dan konfirmasi dengan mudah, tanpa perlu daftar terlebih dahulu.' },
              { step: '03', icon: <Home size={22} />, title: 'Nikmati Liburan', desc: 'Check-in sesuai jadwal dan nikmati pengalaman menginap yang tak terlupakan.' },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition animate-fadeInUp"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white"
                  style={{ background: 'linear-gradient(135deg, #2C4B1A, #5C8A36)' }}
                >
                  {item.icon}
                </div>
                <div className="absolute top-4 right-5 text-5xl font-black opacity-5 text-slate-800 select-none">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          VILLA PILIHAN
      ======================== */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div className="animate-slideInLeft">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#5C8A36' }}>
                Rekomendasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Villa Pilihan</h2>
              <p className="text-slate-500 mt-1 text-sm">Terpopuler di kawasan Puncak Bogor</p>
            </div>
            <Link
              href="/villas"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:gap-3 transition-all duration-200"
              style={{ color: '#5C8A36' }}
            >
              Lihat semua <ArrowRight size={15} />
            </Link>
          </div>

          <VillaListSection limit={6} />

          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/villas"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border transition hover:shadow-md"
              style={{ borderColor: '#5C8A36', color: '#5C8A36' }}
            >
              Lihat Semua Villa <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================
          STATS BANNER
      ======================== */}
      <section className="text-white py-12" style={{ background: 'linear-gradient(135deg, #2C4B1A 0%, #3A6928 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Home size={22} />, value: '50+', label: 'Villa Aktif' },
              { icon: <Users size={22} />, value: '5.000+', label: 'Tamu Puas' },
              { icon: <Star size={22} />, value: '4.9', label: 'Rating Rata-rata' },
              { icon: <CheckCircle size={22} />, value: '100%', label: 'Villa Terverifikasi' },
            ].map((s, i) => (
              <div key={i} className="animate-countUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-center mb-2 opacity-70">{s.icon}</div>
                <div className="text-3xl font-black mb-1">{s.value}</div>
                <div className="text-slate-300 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================
          TESTIMONI
      ======================== */}
      <TestimonialsSection />

      {/* ========================
          ARTIKEL
      ======================== */}
      <ArticlesSection />

      {/* ========================
          CTA
      ======================== */}
      <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #1a3010 0%, #2C4B1A 40%, #5C8A36 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -top-16 -right-16 w-56 h-56 opacity-10 rounded-full" style={{ background: '#A8D87A', filter: 'blur(40px)' }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 opacity-10 rounded-full" style={{ background: '#A8D87A', filter: 'blur(40px)' }} />

          <div className="relative">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 text-green-300">
              Mulai Sekarang
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 animate-fadeInUp">
              Siap Liburan ke Puncak Bogor?
            </h2>
            <p className="text-slate-300 mb-10 max-w-xl mx-auto animate-fadeInUp delay-100">
              Booking villa impianmu sekarang dan ciptakan momen tak terlupakan bersama orang-orang tersayang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scaleIn delay-200">
              <Link
                href="/villas"
                className="relative inline-flex items-center gap-2 bg-white font-bold px-8 py-3.5 rounded-full transition hover:scale-105 hover:shadow-xl duration-200"
                style={{ color: '#2C4B1A' }}
              >
                Cari Villa Sekarang <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition duration-200"
              >
                Tentang Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}


