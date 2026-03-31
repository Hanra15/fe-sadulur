'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import SearchBar from '@/components/villa/SearchBar'
import VillaCard from '@/components/villa/VillaCard'
import { villaService } from '@/services/villaService'
import { VillaFilters } from '@/types'
import { AlertCircle, LayoutGrid, Loader2, Map, MapPin, X } from 'lucide-react'

const VillaMapView = dynamic(() => import('@/components/villa/VillaMapView'), {
  ssr: false,
  loading: () => <div className="h-[460px] rounded-2xl bg-slate-100 animate-pulse" />,
})

function VillasContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [minInput, setMinInput] = useState(searchParams.get('min_price') ?? '')
  const [maxInput, setMaxInput] = useState(searchParams.get('max_price') ?? '')

  const filters: VillaFilters = {
    search: searchParams.get('search') || undefined,
    check_in: searchParams.get('check_in') || undefined,
    check_out: searchParams.get('check_out') || undefined,
    capacity: searchParams.get('capacity') ? Number(searchParams.get('capacity')) : undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    lat: searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined,
    lng: searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined,
    radius: searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined,
  }

  const hasGeoSearch = !!(filters.lat && filters.lng)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['villas', filters],
    queryFn: () => villaService.getAll(filters),
  })

  const villas = data?.data ?? []

  function updateUrl(extra: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, v)
      else params.delete(k)
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  function applyBudget() {
    updateUrl({
      min_price: minInput || undefined,
      max_price: maxInput || undefined,
    })
  }

  function clearGeo() {
    updateUrl({ lat: undefined, lng: undefined, radius: undefined })
  }

  function handleAreaSearch(lat: number, lng: number, radius: number) {
    updateUrl({ lat: String(lat), lng: String(lng), radius: String(radius) })
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3 mb-6 flex flex-wrap items-center gap-3">
          {/* Budget */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Budget/malam (Rp):</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minInput}
              onChange={e => setMinInput(e.target.value)}
              onBlur={applyBudget}
              onKeyDown={e => e.key === 'Enter' && applyBudget()}
              className="w-28 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-green-400"
            />
            <span className="text-slate-400 text-xs">—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxInput}
              onChange={e => setMaxInput(e.target.value)}
              onBlur={applyBudget}
              onKeyDown={e => e.key === 'Enter' && applyBudget()}
              className="w-28 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-green-400"
            />
          </div>

          {/* Geo search active badge */}
          {hasGeoSearch && (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-medium">
              <MapPin size={11} />
              Radius {filters.radius} km dari titik peta
              <button onClick={clearGeo} className="ml-0.5 hover:text-green-900 transition">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1 min-w-[1px]" />

          {/* View mode toggle */}
          <div className="flex gap-0.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={viewMode === 'grid' ? { background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#1e293b' } : { color: '#94a3b8' }}
            >
              <LayoutGrid size={13} /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={viewMode === 'map' ? { background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#1e293b' } : { color: '#94a3b8' }}
            >
              <Map size={13} /> Peta
            </button>
          </div>
        </div>

        {/* Result heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-700">
            {hasGeoSearch
              ? `Villa dalam radius ${filters.radius} km`
              : filters.search
                ? `Hasil: "${filters.search}"`
                : 'Semua Villa'
            }
            {!isLoading && (
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({villas.length} villa)
              </span>
            )}
          </h2>
        </div>

        {/* Map view */}
        {viewMode === 'map' && (
          <div className="mb-8">
            <VillaMapView
              villas={villas}
              searchRadius={filters.radius ?? 5}
              onAreaSearch={handleAreaSearch}
            />
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={36} className="animate-spin" style={{ color: '#5C8A36' }} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-16 text-slate-500 gap-2">
            <AlertCircle size={36} className="text-red-400" />
            <p>Gagal memuat data villa. Silakan coba lagi.</p>
          </div>
        ) : villas.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg mb-2">Villa tidak ditemukan</p>
            <p className="text-sm text-slate-400">
              {hasGeoSearch
                ? 'Coba perluas radius atau cari di area lain'
                : 'Coba ubah kata kunci atau filter pencarian Anda'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {villas.map(villa => <VillaCard key={villa.id} villa={villa} />)}
          </div>
        )}
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
