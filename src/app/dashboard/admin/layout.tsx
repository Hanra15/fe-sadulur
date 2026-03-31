'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard, Users, Building2, CalendarCheck,
  CreditCard, BarChart3, ShieldCheck,
} from 'lucide-react'
import DashboardShell, { DashboardNavItem } from '@/components/layout/DashboardShell'

const navItems: DashboardNavItem[] = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/dashboard/admin/villas', icon: Building2, label: 'Villa' },
  { href: '/dashboard/admin/bookings', icon: CalendarCheck, label: 'Booking' },
  { href: '/dashboard/admin/payments', icon: CreditCard, label: 'Pembayaran' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Pengguna' },
  { href: '/dashboard/admin/reports', icon: BarChart3, label: 'Laporan' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (!isAdmin) router.push('/login')
  }, [isLoggedIn, isAdmin, router])

  if (!user) return null

  return (
    <DashboardShell
      navItems={navItems}
      headerLabel="Super Admin"
      headerBg="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
      headerIcon={ShieldCheck}
      userName={user.name}
      userEmail={user.email}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  )
}
