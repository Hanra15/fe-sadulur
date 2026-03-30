import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold mb-3">
              <span className="text-emerald-400">Villa</span>
              <span className="text-white"> Sadulur</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Penginapan & villa terbaik di kawasan Puncak Bogor, dekat Taman Safari. Nikmati pengalaman menginap yang nyaman dan berkesan bersama keluarga.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="hover:text-emerald-400 transition text-sm">Instagram</a>
              <a href="#" aria-label="Facebook" className="hover:text-emerald-400 transition text-sm">Facebook</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-emerald-400 transition">Beranda</Link></li>
              <li><Link href="/villas" className="hover:text-emerald-400 transition">Daftar Villa</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition">Kontak</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-emerald-400 shrink-0" />
                Kawasan Puncak Bogor, dekat Taman Safari, Jawa Barat
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-emerald-400 shrink-0" />
                +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                info@villa-sadulur.my.id
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Villa Sadulur Group. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
