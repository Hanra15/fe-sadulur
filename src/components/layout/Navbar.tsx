'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Menu, X, Home, Search, User, LogOut, LayoutDashboard } from 'lucide-react'

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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600">Villa</span>
            <span className="text-2xl font-bold text-slate-800">Sadulur</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition">
              <Home size={16} /> Beranda
            </Link>
            <Link href="/villas" className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition">
              <Search size={16} /> Cari Villa
            </Link>
            {isLoggedIn ? (
              <>
                <Link href={getDashboardHref()} className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition">
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
                className="flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-1.5 rounded-full text-sm font-medium transition"
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
          <Link href="/" className="text-slate-700 hover:text-emerald-600 transition" onClick={() => setMenuOpen(false)}>Beranda</Link>
          <Link href="/villas" className="text-slate-700 hover:text-emerald-600 transition" onClick={() => setMenuOpen(false)}>Cari Villa</Link>
          {isLoggedIn ? (
            <>
              <Link href={getDashboardHref()} className="text-slate-700 hover:text-emerald-600 transition" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-left text-red-600">Keluar</button>
            </>
          ) : (
            <Link href="/login" className="text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>Masuk</Link>
          )}
        </div>
      )}
    </nav>
  )
}
