import { Villa } from '@/types'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://villa-sadulur.my.id/api')
  .replace(/\/api$/, '')

export function getImageUrl(path: string): string {
  if (!path) return '/images/villa-placeholder.jpg'
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getVillaThumbnail(villa: Villa): string {
  if (villa.images && villa.images.length > 0) return getImageUrl(villa.images[0])
  return '/images/villa-placeholder.jpg'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
