import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LiveChatWidgetWrapper from '@/components/livechat/LiveChatWidgetWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Villa Sadulur — Penginapan & Villa Terbaik di Puncak Bogor',
  description:
    'Temukan villa & penginapan terbaik di Puncak Bogor dekat Taman Safari. Booking mudah, harga terjangkau, fasilitas lengkap.',
  keywords: 'villa puncak bogor, penginapan puncak, villa dekat taman safari, booking villa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <LiveChatWidgetWrapper />
        </Providers>
      </body>
    </html>
  )
}

