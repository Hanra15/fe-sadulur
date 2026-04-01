'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, LucideIcon } from 'lucide-react'

export interface DashboardNavItem {
  href: string
  icon: LucideIcon
  label: string
  exact?: boolean
}

interface DashboardShellProps {
  children: React.ReactNode
  navItems: DashboardNavItem[]
  headerLabel: string
  headerBg: string
  headerIcon: LucideIcon
  userName: string
  userEmail: string
  onLogout: () => void
}

export default function DashboardShell({
  children, navItems, headerLabel, headerBg, headerIcon: HeaderIcon,
  userName, userEmail, onLogout,
}: DashboardShellProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 pb-24 md:pb-6">
      {/* Mobile: horizontal scrollable pill nav */}
      <nav className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition min-h-[40px] ${
              isActive(item.href, item.exact)
                ? 'text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 active:bg-slate-50'
            }`}
            style={isActive(item.href, item.exact) ? { background: headerBg } : {}}
          >
            <item.icon size={14} />
            {item.label}
          </Link>
        ))}
        <button
          onClick={onLogout}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-red-200 text-red-500 min-h-[40px]"
        >
          <LogOut size={14} /> Keluar
        </button>
      </nav>

      {/* Desktop: sidebar + content */}
      <div className="flex gap-5 items-start">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-48 lg:w-52 shrink-0 sticky top-20">
          {/* Profile card */}
          <div
            className="rounded-2xl p-4 text-white mb-3"
            style={{ background: headerBg }}
          >
            <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center mb-2">
              <HeaderIcon size={20} />
            </div>
            <div className="font-semibold text-sm leading-tight truncate">{userName}</div>
            <div className="text-xs opacity-75 truncate mt-0.5">{userEmail}</div>
            <div className="text-xs opacity-60 mt-1">{headerLabel}</div>
          </div>

          {/* Nav links */}
          <div className="bg-white rounded-2xl border border-slate-100 p-2 mb-2">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition mb-0.5 ${
                  isActive(item.href, item.exact)
                    ? 'font-semibold text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                style={isActive(item.href, item.exact) ? { background: headerBg } : {}}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={14} /> Keluar
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
