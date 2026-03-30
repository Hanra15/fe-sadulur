import Image from 'next/image'
import { MapPin, Users, Star, Shield, Clock, Heart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tentang Kami — Villa Sadulur',
  description:
    'Kenali lebih dekat Villa Sadulur, platform booking villa & penginapan terbaik di kawasan Puncak Bogor dekat Taman Safari.',
}

const values = [
  {
    icon: <Shield size={28} style={{ color: '#5C8A36' }} />,
    title: 'Terpercaya',
    desc: 'Setiap villa telah melalui proses verifikasi ketat oleh tim kami untuk memastikan kenyamanan dan keamanan tamu.',
  },
  {
    icon: <Heart size={28} style={{ color: '#5C8A36' }} />,
    title: 'Ramah Keluarga',
    desc: 'Kami mengutamakan pengalaman menginap yang menyenangkan bagi seluruh anggota keluarga, dari anak-anak hingga lansia.',
  },
  {
    icon: <Star size={28} style={{ color: '#5C8A36' }} />,
    title: 'Kualitas Terjamin',
    desc: 'Standar kebersihan dan fasilitas dijaga secara konsisten agar setiap kunjungan terasa seperti rumah kedua.',
  },
  {
    icon: <Clock size={28} style={{ color: '#5C8A36' }} />,
    title: 'Responsif 24 Jam',
    desc: 'Tim kami siap membantu kapan saja — dari proses booking hingga check-out — agar liburanmu berjalan lancar.',
  },
]

const team = [
  { name: 'Andi Rahmat', role: 'Pendiri & CEO', initials: 'AR' },
  { name: 'Siti Nurhaliza', role: 'Manajer Operasional', initials: 'SN' },
  { name: 'Budi Prasetyo', role: 'Manajer Properti', initials: 'BP' },
  { name: 'Dewi Anggraini', role: 'Customer Relations', initials: 'DA' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="text-white py-16"
        style={{ background: 'linear-gradient(135deg, #2C4B1A 0%, #5C8A36 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo-vilasad.png"
              alt="Villa Sadulur"
              width={80}
              height={80}
              className="rounded-full bg-white/10 p-1"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Tentang Kami</h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Villa Sadulur adalah platform booking villa & penginapan terbaik di kawasan Puncak Bogor,
            dekat Taman Safari. Kami hadir untuk memudahkan Anda menemukan tempat menginap yang sempurna.
          </p>
        </div>
      </section>

      {/* Kisah Kami */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Kisah Villa Sadulur</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Berawal dari kecintaan terhadap keindahan alam Puncak Bogor, Villa Sadulur didirikan
              dengan misi sederhana: menghubungkan keluarga Indonesia dengan penginapan terbaik di
              salah satu destinasi wisata paling populer di Jawa Barat.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Sejak berdiri, kami telah membantu ribuan keluarga menikmati liburan berkesan di
              kawasan Puncak. Setiap villa dalam jaringan kami dipilih dengan teliti,
              memastikan standar kenyamanan, kebersihan, dan fasilitas yang memuaskan.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Dengan lokasi strategis dekat Taman Safari, kebun teh, dan berbagai destinasi wisata
              alam, Villa Sadulur adalah pilihan utama untuk liburan keluarga yang tak terlupakan.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '50+', label: 'Villa Terdaftar' },
              { value: '5.000+', label: 'Tamu Puas' },
              { value: '4.8★', label: 'Rating Rata-rata' },
              { value: '3 Thn', label: 'Pengalaman' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100"
              >
                <div className="text-3xl font-extrabold mb-1" style={{ color: '#5C8A36' }}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nilai-nilai */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Nilai-Nilai Kami</h2>
            <p className="text-slate-500">Prinsip yang kami pegang dalam setiap langkah pelayanan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-md transition"
              >
                <div className="flex justify-center mb-3">{v.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lokasi */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Lokasi Kami</h2>
            <div className="flex items-start gap-3 mb-4">
              <MapPin size={20} className="mt-1 shrink-0" style={{ color: '#5C8A36' }} />
              <div>
                <p className="font-semibold text-slate-700">Kawasan Puncak Bogor</p>
                <p className="text-slate-500 text-sm mt-1">
                  Jl. Raya Puncak, Cisarua, Bogor, Jawa Barat 16750
                </p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              Terletak di jantung kawasan Puncak, seluruh villa kami berada dalam radius dekat
              dengan Taman Safari Indonesia, Kebun Raya Bogor, Curug Cilember, dan berbagai
              destinasi wisata populer lainnya.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 h-64">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63360.45824849822!2d106.91!3d-6.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69b5d5c44ca427%3A0x8a82b28f9ef59a14!2sPuncak%2C%20Cisarua%2C%20Bogor%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Villa Sadulur"
            />
          </div>
        </div>
      </section>

      {/* Tim */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Tim Kami</h2>
            <p className="text-slate-500">Orang-orang berdedikasi di balik Villa Sadulur</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3"
                  style={{ backgroundColor: '#5C8A36' }}
                >
                  {member.initials}
                </div>
                <p className="font-semibold text-slate-800 text-sm">{member.name}</p>
                <p className="text-xs text-slate-400 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="text-white py-14"
        style={{ background: 'linear-gradient(135deg, #3A6928 0%, #5C8A36 100%)' }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Siap Liburan Bareng Keluarga?</h2>
          <p className="text-slate-200 mb-6">
            Temukan villa impianmu dan buat kenangan indah bersama orang-orang tersayang.
          </p>
          <a
            href="/villas"
            className="bg-white font-bold px-8 py-3 rounded-full transition inline-block"
            style={{ color: '#3A6928' }}
          >
            Cari Villa Sekarang
          </a>
        </div>
      </section>
    </div>
  )
}
