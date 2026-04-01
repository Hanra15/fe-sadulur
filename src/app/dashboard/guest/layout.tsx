'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Search, CalendarCheck, MessageCircle, User, UserCircle, TicketCheck } from 'lucide-react'
import DashboardShell, { DashboardNavItem } from '@/components/layout/DashboardShell'

const navItems: DashboardNavItem[] = [
  { href: '/dashboard/guest', icon: UserCircle, label: 'Beranda', exact: true },
  { href: '/villas', icon: Search, label: 'Cari Villa' },
  { href: '/dashboard/guest/bookings', icon: CalendarCheck, label: 'Booking Saya' },
  { href: '/dashboard/guest/messages', icon: MessageCircle, label: 'Pesan' },
  { href: '/dashboard/guest/support', icon: TicketCheck, label: 'Dukungan' },
  { href: '/dashboard/guest/profile', icon: User, label: 'Profil' },
]

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isGuest, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
    else if (!isGuest) router.push('/login')
  }, [isLoggedIn, isGuest, router])

  if (!user) return null

  return (
    <DashboardShell
      navItems={navItems}
      headerLabel="Pengunjung"
      headerBg="linear-gradient(135deg, #3A6928 0%, #5C8A36 100%)"
      headerIcon={User}
      userName={user.name}
      userEmail={user.email}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  )
}
