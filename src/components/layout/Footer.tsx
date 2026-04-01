import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="text-slate-200 mt-16" style={{ backgroundColor: '#2C4B1A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/images/logo-vilasad.png"
                alt="Villa Sadulur"
                width={48}
                height={48}
                className="rounded-full object-contain bg-white p-0.5"
              />
              <div className="leading-tight">
                <div className="text-xl font-extrabold text-white">VILLA <span style={{ color: '#A8D87A' }}>SADULUR</span></div>
                <div className="text-xs text-slate-400">Puncak Bogor Booking Service</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Penginapan & villa terbaik di kawasan Puncak Bogor, dekat Taman Safari. Nikmati pengalaman menginap yang nyaman dan berkesan bersama keluarga.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="transition text-sm" style={{ color: '#A8D87A' }}>Instagram</a>
              <a href="#" aria-label="Facebook" className="transition text-sm" style={{ color: '#A8D87A' }}>Facebook</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/" className="transition hover:text-white">Beranda</Link></li>
              <li><Link href="/villas" className="transition hover:text-white">Daftar Villa</Link></li>
              <li><Link href="/about" className="transition hover:text-white">Tentang Kami</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Kontak</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: '#A8D87A' }} />
                Kawasan Puncak Bogor, dekat Taman Safari, Jawa Barat
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" style={{ color: '#A8D87A' }} />
                +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" style={{ color: '#A8D87A' }} />
                info@villa-sadulur.my.id
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 md:mt-10 pt-5 md:pt-6 pb-mobile-nav md:pb-0 text-center text-sm text-slate-500" style={{ borderColor: '#3A6928' }}>
          © {new Date().getFullYear()} Villa Sadulur Group. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
