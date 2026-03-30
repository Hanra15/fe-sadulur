'use client'

import { useQuery } from '@tanstack/react-query'
import { villaService } from '@/services/villaService'
import VillaCard from './VillaCard'
import { VillaFilters } from '@/types'
import { Loader2, AlertCircle } from 'lucide-react'

interface Props {
  filters?: VillaFilters
  limit?: number
}

export default function VillaListSection({ filters, limit }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['villas', filters],
    queryFn: () => villaService.getAll(filters),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={36} className="animate-spin" style={{ color: '#5C8A36' }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-16 text-slate-500 gap-2">
        <AlertCircle size={36} className="text-red-400" />
        <p>Gagal memuat data villa. Silakan coba lagi.</p>
      </div>
    )
  }

  const villas = data?.data ?? []
  const displayed = limit ? villas.slice(0, limit) : villas

  if (displayed.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p>Belum ada villa tersedia saat ini.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayed.map((villa) => (
        <VillaCard key={villa.id} villa={villa} />
      ))}
    </div>
  )
}
