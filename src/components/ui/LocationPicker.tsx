'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, Crosshair, Loader2, X } from 'lucide-react'

// Fix default Leaflet marker icon for webpack
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export interface LocationPickerProps {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}

const DEFAULT_CENTER: [number, number] = [-6.9175, 107.6191] // Bandung
const DEFAULT_ZOOM = 11

/** Listens to map click events */
function ClickHandler({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/** Smoothly re-centers the map whenever `pos` changes */
function Recenter({ pos }: { pos: [number, number] | null }) {
  const map = useMap()
  const prev = useRef<[number, number] | null>(null)
  useEffect(() => {
    if (!pos) return
    if (prev.current?.[0] === pos[0] && prev.current?.[1] === pos[1]) return
    prev.current = pos
    map.setView(pos, Math.max(map.getZoom(), 15), { animate: true })
  }, [pos, map])
  return null
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const hasInitial = lat !== undefined && lng !== undefined
  const initialPos: [number, number] | null = hasInitial ? [lat!, lng!] : null

  const [markerPos, setMarkerPos] = useState<[number, number] | null>(initialPos)
  const [recenterTo, setRecenterTo] = useState<[number, number] | null>(initialPos)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Sync if parent changes lat/lng externally (e.g. opening edit modal with existing values)
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      const pos: [number, number] = [lat, lng]
      setMarkerPos(pos)
      setRecenterTo(pos)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // only on mount

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMove = useCallback((newLat: number, newLng: number) => {
    const pos: [number, number] = [newLat, newLng]
    setMarkerPos(pos)
    onChange(newLat, newLng)
  }, [onChange])

  /** Nominatim geo-search (debounced 450ms) */
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); setShowDropdown(false); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&countrycodes=id`
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'id', 'User-Agent': 'villa-sadulur-admin/1.0' },
        })
        const data: NominatimResult[] = await res.json()
        setResults(data)
        setShowDropdown(data.length > 0)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 450)
  }

  function handleSelectResult(r: NominatimResult) {
    const pos: [number, number] = [parseFloat(r.lat), parseFloat(r.lon)]
    setMarkerPos(pos)
    setRecenterTo(pos)
    onChange(pos[0], pos[1])
    setQuery(r.display_name.split(',').slice(0, 2).join(','))
    setShowDropdown(false)
    setResults([])
  }

  function handleClearSearch() {
    setQuery('')
    setResults([])
    setShowDropdown(false)
  }

  function handleMyLocation() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        const p: [number, number] = [latitude, longitude]
        setMarkerPos(p)
        setRecenterTo(p)
        onChange(latitude, longitude)
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 8000 },
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Search bar */}
      <div className="p-2 bg-white border-b border-slate-100">
        <div className="flex gap-2">
          <div className="relative flex-1" ref={searchRef}>
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-7 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-purple-400 bg-white"
              placeholder="Cari lokasi (nama tempat, desa, kota)..."
              value={query}
              onChange={handleSearchChange}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
            />
            {searching && (
              <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
            )}
            {!searching && query && (
              <button onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X size={13} />
              </button>
            )}
            {/* Dropdown results */}
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-xl z-[9999] max-h-48 overflow-y-auto">
                {results.map(r => (
                  <button
                    key={r.place_id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 hover:text-purple-700 transition border-b border-slate-50 last:border-0"
                    onClick={() => handleSelectResult(r)}
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleMyLocation}
            disabled={geoLoading}
            title="Gunakan lokasi saya"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition disabled:opacity-50 flex items-center gap-1 text-xs whitespace-nowrap"
          >
            {geoLoading
              ? <Loader2 size={12} className="animate-spin" />
              : <Crosshair size={12} />
            }
            <span className="hidden sm:inline">Lokasi Saya</span>
          </button>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: 280 }}>
        <MapContainer
          center={markerPos ?? DEFAULT_CENTER}
          zoom={markerPos ? 15 : DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMove={handleMove} />
          <Recenter pos={recenterTo} />
          {markerPos && (
            <Marker
              position={markerPos}
              draggable
              eventHandlers={{
                dragend(e) {
                  const m = e.target as L.Marker
                  const pos = m.getLatLng()
                  handleMove(pos.lat, pos.lng)
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordinate display */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        {markerPos ? (
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-medium text-slate-400">Koordinat:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
              {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Klik peta atau cari lokasi untuk menentukan titik koordinat</span>
        )}
      </div>
    </div>
  )
}
