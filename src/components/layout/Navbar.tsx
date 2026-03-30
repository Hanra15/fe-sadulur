'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Menu, X, Home, Search, User, LogOut, LayoutDashboard, Info, Phone } from 'lucide-react'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const getDashboardHref = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/dashboard/admin'
    if (user.role === 'owner') return '/dashboard/owner'
    return '/dashboard/guest'
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo-vilasad.png"
              alt="Villa Sadulur"
              width={40}
              height={40}
              className="rounded-full object-contain"
              priority
            />
            <div className="leading-tight">
              <span className="text-lg font-extrabold" style={{ color: '#2C4B1A' }}>VILLA{' '}</span>
              <span className="text-lg font-extrabold" style={{ color: '#5C8A36' }}>SADULUR</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-600 hover:text-brand-primary flex items-center gap-1 transition" style={{ ['--tw-text-opacity' as string]: '1' }}>
              <Home size={16} /> Beranda
            </Link>
            <Link href="/villas" className="text-slate-600 flex items-center gap-1 transition hover:text-brand-primary">
              <Search size={16} /> Cari Villa
            </Link>
            <Link href="/about" className="text-slate-600 flex items-center gap-1 transition hover:text-brand-primary">
              <Info size={16} /> Tentang
            </Link>
            <Link href="/contact" className="text-slate-600 flex items-center gap-1 transition hover:text-brand-primary">
              <Phone size={16} /> Kontak
            </Link>
            {isLoggedIn ? (
              <>
                <Link href={getDashboardHref()} className="text-slate-600 flex items-center gap-1 transition hover:text-brand-primary">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-1.5 rounded-full text-sm font-medium transition"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-white px-5 py-1.5 rounded-full text-sm font-semibold transition"
                style={{ backgroundColor: '#5C8A36' }}
              >
                <User size={15} /> Masuk
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4 shadow-md">
          <Link href="/" className="text-slate-700 transition" style={{ color: '#2C4B1A' }} onClick={() => setMenuOpen(false)}>Beranda</Link>
          <Link href="/villas" className="text-slate-700 transition" onClick={() => setMenuOpen(false)}>Cari Villa</Link>
          <Link href="/about" className="text-slate-700 transition" onClick={() => setMenuOpen(false)}>Tentang Kami</Link>
          <Link href="/contact" className="text-slate-700 transition" onClick={() => setMenuOpen(false)}>Kontak</Link>
          {isLoggedIn ? (
            <>
              <Link href={getDashboardHref()} className="text-slate-700 transition" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-left text-red-600">Keluar</button>
            </>
          ) : (
            <Link href="/login" className="font-semibold" style={{ color: '#5C8A36' }} onClick={() => setMenuOpen(false)}>Masuk</Link>
          )}
        </div>
      )}
    </nav>
  )
}
