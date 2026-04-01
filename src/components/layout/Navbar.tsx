'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRef, useState } from 'react'
import {
  Menu, X, Home, Search, User, LogOut, LayoutDashboard,
  Info, Phone, BookOpen, HelpCircle, LifeBuoy, ChevronDown,
  Newspaper, MapPin, MessageSquare,
} from 'lucide-react'

// ─── Dropdown data ───────────────────────────────────────────────
const EXPLORE_ITEMS = [
  { href: '/blog',    icon: Newspaper,    label: 'Blog',          desc: 'Artikel & tips liburan'  },
  { href: '/about',   icon: Info,         label: 'Tentang Kami',  desc: 'Sejarah & misi kami'     },
  { href: '/contact', icon: Phone,        label: 'Kontak',        desc: 'Hubungi tim kami'         },
]

const HELP_ITEMS = [
  { href: '/faq',     icon: HelpCircle,   label: 'FAQ',              desc: 'Pertanyaan yang sering ditanyakan' },
  { href: '/support', icon: LifeBuoy,     label: 'Tiket Dukungan',   desc: 'Laporkan masalah atau pertanyaan' },
]

// ─── Desktop dropdown ─────────────────────────────────────────────
function NavDropdown({
  label,
  items,
}: {
  label: string
  items: { href: string; icon: React.ElementType; label: string; desc: string }[]
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition py-2 select-none"
        onClick={() => setOpen(v => !v)}
      >
        {label}
        <ChevronDown
          size={14}
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 py-2"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Caret */}
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-slate-100 rotate-45" />
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition group"
              onClick={() => setOpen(false)}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition" style={{ background: '#EEF5E6' }}>
                <item.icon size={15} style={{ color: '#5C8A36' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mobile accordion section ─────────────────────────────────────
function MobileSection({
  label,
  items,
  onClose,
}: {
  label: string
  items: { href: string; icon: React.ElementType; label: string; desc: string }[]
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 py-2"
        onClick={() => setOpen(v => !v)}
      >
        {label}
        <ChevronDown size={14} className="transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="mt-1 ml-1 space-y-1 border-l-2 border-slate-100 pl-3">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 py-2 text-sm text-slate-600"
              onClick={onClose}
            >
              <item.icon size={14} style={{ color: '#5C8A36' }} />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Navbar ──────────────────────────────────────────────────
export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)

  const dashboardHref = !user
    ? '/login'
    : user.role === 'admin'
      ? '/dashboard/admin'
      : user.role === 'owner'
        ? '/dashboard/owner'
        : '/dashboard/guest'

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/images/logo-vilasad.png"
              alt="Villa Sadulur"
              width={38}
              height={38}
              className="rounded-full object-contain"
              priority
            />
            <div className="leading-tight hidden sm:block">
              <span className="text-base font-extrabold" style={{ color: '#2C4B1A' }}>VILLA </span>
              <span className="text-base font-extrabold" style={{ color: '#5C8A36' }}>SADULUR</span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
            >
              <Home size={15} /> Beranda
            </Link>

            <Link
              href="/villas"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition text-white"
              style={{ background: '#5C8A36' }}
            >
              <Search size={15} /> Cari Villa
            </Link>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <NavDropdown label="Jelajahi" items={EXPLORE_ITEMS} />
            <NavDropdown label="Bantuan" items={HELP_ITEMS} />
          </div>

          {/* ── Auth section ── */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition"
                  style={{ borderColor: '#5C8A36', color: '#5C8A36' }}
                >
                  <User size={14} /> Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white transition"
                  style={{ background: '#5C8A36' }}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle removed — handled by MobileBottomNav */}
        </div>
      </div>

      {/* Mobile overlay menu removed — navigation handled by MobileBottomNav */}
    </nav>
  )
}
