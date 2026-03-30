'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import VillaListSection from '@/components/villa/VillaListSection'
import SearchBar from '@/components/villa/SearchBar'
import { SlidersHorizontal } from 'lucide-react'
import { VillaFilters } from '@/types'

function VillasContent() {
  const searchParams = useSearchParams()

  const filters: VillaFilters = {
    search: searchParams.get('search') || undefined,
    check_in: searchParams.get('check_in') || undefined,
    check_out: searchParams.get('check_out') || undefined,
    capacity: searchParams.get('capacity') ? Number(searchParams.get('capacity')) : undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
  }

  return (
    <div>
      {/* Header */}
      <div className="text-white py-12" style={{ background: 'linear-gradient(135deg, #2C4B1A 0%, #5C8A36 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Cari Villa</h1>
          <p className="text-slate-200 mb-6">Temukan penginapan terbaik di Puncak Bogor</p>
          <SearchBar />
        </div>
      </div>

      {/* Filter & Hasil */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
            <SlidersHorizontal size={18} style={{ color: "#5C8A36" }} />
            {filters.search ? `Hasil pencarian: "${filters.search}"` : 'Semua Villa'}
          </h2>
        </div>
        <VillaListSection filters={filters} />
      </div>
    </div>
  )
}

export default function VillasPage() {
  return (
    <Suspense>
      <VillasContent />
    </Suspense>
  )
}
