'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LayoutDashboard, Building2, CalendarCheck, MessageCircle, PlusCircle } from 'lucide-react'
import DashboardShell, { DashboardNavItem } from '@/components/layout/DashboardShell'

const navItems: DashboardNavItem[] = [
  { href: '/dashboard/owner', icon: LayoutDashboard, label: 'Beranda', exact: true },
  { href: '/dashboard/owner/villas', icon: Building2, label: 'Villa Saya' },
  { href: '/dashboard/owner/villas/add', icon: PlusCircle, label: 'Tambah Villa' },
  { href: '/dashboard/owner/bookings', icon: CalendarCheck, label: 'Booking' },
  { href: '/dashboard/owner/messages', icon: MessageCircle, label: 'Pesan' },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isOwner, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (!isOwner) router.push('/login')
  }, [isLoggedIn, isOwner, router])

  if (!user) return null

  return (
    <DashboardShell
      navItems={navItems}
      headerLabel="Pengelola Villa"
      headerBg="linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)"
      headerIcon={Building2}
      userName={user.name}
      userEmail={user.email}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  )
}
