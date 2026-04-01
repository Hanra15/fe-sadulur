'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home, Search, CalendarCheck, MessageSquare, Menu, X,
  LogOut, Info, Phone, HelpCircle, LifeBuoy, Newspaper,
  LayoutDashboard, User,
} from 'lucide-react'

const MORE_ITEMS = [
  { href: '/blog',    icon: Newspaper,  label: 'Blog',       desc: 'Artikel & tips liburan' },
  { href: '/about',   icon: Info,       label: 'Tentang',    desc: 'Sejarah & misi kami' },
  { href: '/contact', icon: Phone,      label: 'Kontak',     desc: 'Hubungi tim kami' },
  { href: '/faq',     icon: HelpCircle, label: 'FAQ',        desc: 'Pertanyaan umum' },
  { href: '/support', icon: LifeBuoy,   label: 'Dukungan',   desc: 'Laporkan masalah' },
]

export default function MobileBottomNav() {
  const { user, isLoggedIn, logout } = useAuth()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const closeDrawer = () => setDrawerOpen(false)

  const dashboardHref = !user
    ? '/login'
    : user.role === 'admin'
      ? '/dashboard/admin'
      : user.role === 'owner'
        ? '/dashboard/owner'
        : '/dashboard/guest'

  const bookingsHref = isLoggedIn
    ? (user?.role === 'guest' ? '/dashboard/guest/bookings' : dashboardHref)
    : '/login'

  const messagesHref = isLoggedIn
    ? (user?.role === 'guest' ? '/dashboard/guest/messages' : dashboardHref)
    : '/login'

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const NAV_ITEMS = [
    { href: '/',          icon: Home,          label: 'Beranda',  exact: true  },
    { href: '/villas',    icon: Search,        label: 'Cari Villa', exact: false },
    { href: bookingsHref, icon: CalendarCheck, label: 'Booking',  exact: false },
    { href: messagesHref, icon: MessageSquare, label: 'Pesan',    exact: false },
  ]

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeDrawer}
        />
      )}

      {/* ── Slide-up drawer ──────────────────────────────── */}
      <div
        className={`md:hidden fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          bottom: 0,
          paddingBottom: 'calc(var(--mobile-nav-h) + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 pt-2 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Menu Lainnya</h3>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition touch-min flex items-center justify-center"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Grid of quick links */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {MORE_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-slate-600 transition active:scale-95"
                style={{ background: '#EEF5E6' }}
                onClick={closeDrawer}
              >
                <item.icon size={20} style={{ color: '#5C8A36' }} />
                <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="h-px bg-slate-100 mb-4" />

          {/* Auth section */}
          {isLoggedIn ? (
            <div className="space-y-2">
              <Link
                href={dashboardHref}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-700 bg-slate-50 transition active:bg-slate-100"
                onClick={closeDrawer}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EEF5E6' }}>
                  <LayoutDashboard size={16} style={{ color: '#5C8A36' }} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Dashboard</div>
                  <div className="text-xs text-slate-400 mt-0.5">{user?.name}</div>
                </div>
              </Link>
              <button
                onClick={() => { logout(); closeDrawer() }}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-sm font-medium text-red-500 bg-red-50 transition active:bg-red-100"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-100">
                  <LogOut size={16} className="text-red-500" />
                </div>
                <span className="font-semibold">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="text-center py-3.5 rounded-2xl text-sm font-semibold border-2 transition active:scale-95"
                style={{ borderColor: '#5C8A36', color: '#5C8A36' }}
                onClick={closeDrawer}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-center py-3.5 rounded-2xl text-sm font-semibold text-white transition active:scale-95"
                style={{ background: '#5C8A36' }}
                onClick={closeDrawer}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed bottom nav bar ─────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-150 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          height: 'calc(var(--mobile-nav-h) + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="flex h-16">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition active:scale-90"
              >
                {active && (
                  <span
                    className="absolute top-0 w-8 h-0.5 rounded-b-full"
                    style={{ background: '#5C8A36' }}
                  />
                )}
                <item.icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? '#5C8A36' : '#94a3b8' }}
                />
                <span
                  className="font-medium leading-none"
                  style={{
                    fontSize: '10px',
                    color: active ? '#5C8A36' : '#94a3b8',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* Menu / More button */}
          <button
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition active:scale-90"
            onClick={() => setDrawerOpen(v => !v)}
            aria-label="Menu lainnya"
          >
            {drawerOpen && (
              <span
                className="absolute top-0 w-8 h-0.5 rounded-b-full"
                style={{ background: '#5C8A36' }}
              />
            )}
            {isLoggedIn ? (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: drawerOpen ? '#5C8A36' : '#94a3b8' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? <User size={14} />}
              </div>
            ) : (
              <Menu
                size={22}
                strokeWidth={drawerOpen ? 2.5 : 1.8}
                style={{ color: drawerOpen ? '#5C8A36' : '#94a3b8' }}
              />
            )}
            <span
              className="font-medium leading-none"
              style={{
                fontSize: '10px',
                color: drawerOpen ? '#5C8A36' : '#94a3b8',
              }}
            >
              {isLoggedIn ? (user?.name?.split(' ')[0] ?? 'Profil') : 'Menu'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
