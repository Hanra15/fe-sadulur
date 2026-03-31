'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Villa } from '@/types'
import { formatCurrency, getImageUrl } from '@/utils'
import { Crosshair, Loader2, RefreshCw } from 'lucide-react'

// Fix Leaflet default icon
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

/** Price-label marker */
function priceIcon(price: number, selected: boolean) {
  const bg = selected ? '#2C4B1A' : '#5C8A36'
  const label = price >= 1_000_000
    ? `${(price / 1_000_000).toFixed(1)}jt`
    : `${(price / 1_000).toFixed(0)}rb`
  return L.divIcon({
    className: '',
    html: `<div style="background:${bg};color:#fff;padding:3px 9px;border-radius:16px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.28);border:2px solid #fff;position:relative;cursor:pointer">
      Rp ${label}
      <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${bg}"></div>
    </div>`,
    iconSize: [72, 28],
    iconAnchor: [36, 34],
    popupAnchor: [0, -38],
  })
}

/** Auto-fit map to all villa positions on first load */
function FitBounds({ villas }: { villas: Villa[] }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current) return
    const coords = villas
      .map(v => [Number(v.lat), Number(v.lng)] as L.LatLngTuple)
      .filter(([lat, lng]) => lat && lng)
    if (!coords.length) return
    fitted.current = true
    if (coords.length === 1) {
      map.setView(coords[0], 14)
    } else {
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 15 })
    }
  }, [villas, map])
  return null
}

/** Detects map move/zoom → notifies parent */
function MoveDetector({ onMoved }: { onMoved: () => void }) {
  const initialized = useRef(false)
  useMapEvents({
    moveend() { if (initialized.current) onMoved(); initialized.current = true },
    zoomend() { if (initialized.current) onMoved(); initialized.current = true },
  })
  return null
}

/** Smoothly re-center map */
function Recenter({ to }: { to: [number, number] | null }) {
  const map = useMap()
  const prev = useRef<string>('')
  useEffect(() => {
    if (!to) return
    const key = to.join(',')
    if (prev.current === key) return
    prev.current = key
    map.setView(to, Math.max(map.getZoom(), 14), { animate: true })
  }, [to, map])
  return null
}

export interface VillaMapViewProps {
  villas: Villa[]
  searchRadius?: number
  onAreaSearch: (lat: number, lng: number, radius: number) => void
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 25]
const DEFAULT_CENTER: [number, number] = [-6.7066, 106.9266] // Puncak Bogor

export default function VillaMapView({ villas, searchRadius = 5, onAreaSearch }: VillaMapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [hasMoved, setHasMoved] = useState(false)
  const [radius, setRadius] = useState(searchRadius)
  const [searching, setSearching] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [myPos, setMyPos] = useState<[number, number] | null>(null)
  const [recenterTo, setRecenterTo] = useState<[number, number] | null>(null)
  const [selectedVillaId, setSelectedVillaId] = useState<number | null>(null)

  const mapped = villas.filter(v => !!(Number(v.lat) && Number(v.lng)))
  const unmapped = villas.length - mapped.length

  async function handleAreaSearch() {
    const map = mapRef.current
    if (!map) return
    const c = map.getCenter()
    setSearching(true)
    setHasMoved(false)
    await onAreaSearch(c.lat, c.lng, radius)
    setSearching(false)
  }

  function handleMyLocation() {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setMyPos(p)
        setRecenterTo(p)
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 8000 },
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-100 flex-wrap">
        <span className="text-xs font-medium text-slate-500">Radius:</span>
        <div className="flex gap-1">
          {RADIUS_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition"
              style={radius === r
                ? { background: '#5C8A36', color: '#fff' }
                : { background: '#f1f5f9', color: '#64748b' }}
            >
              {r} km
            </button>
          ))}
        </div>
        <button
          onClick={handleMyLocation}
          disabled={geoLoading}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition disabled:opacity-50"
        >
          {geoLoading
            ? <Loader2 size={12} className="animate-spin" />
            : <Crosshair size={12} />
          }
          Lokasi Saya
        </button>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: 460 }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds villas={mapped} />
          <MoveDetector onMoved={() => setHasMoved(true)} />
          <Recenter to={recenterTo} />

          {/* My location: dot + radius ring */}
          {myPos && (
            <>
              <Marker
                position={myPos}
                icon={L.divIcon({
                  className: '',
                  html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 3px rgba(59,130,246,0.3)"></div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7],
                })}
              >
                <Popup><span className="text-xs font-medium">Lokasi Saya</span></Popup>
              </Marker>
              <Circle
                center={myPos}
                radius={radius * 1000}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.07, weight: 1.5, dashArray: '6' }}
              />
            </>
          )}

          {/* Villa markers */}
          {mapped.map(v => (
            <Marker
              key={v.id}
              position={[Number(v.lat), Number(v.lng)]}
              icon={priceIcon(v.price, selectedVillaId === v.id)}
              eventHandlers={{ click: () => setSelectedVillaId(v.id) }}
            >
              <Popup minWidth={180} maxWidth={220}>
                <div>
                  {v.images?.length ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(v.images[0])}
                      alt={v.name}
                      style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                    />
                  ) : null}
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 2 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>📍 {v.location}</div>
                  <div style={{ marginBottom: 4 }}>
                    {v.capacity && <span style={{ fontSize: 11, color: '#64748b', marginRight: 8 }}>👥 {v.capacity} tamu</span>}
                    {v.bedrooms && <span style={{ fontSize: 11, color: '#64748b' }}>🛏 {v.bedrooms} kamar</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#5C8A36', marginBottom: 8 }}>
                    {formatCurrency(v.price)}<span style={{ fontWeight: 400, fontSize: 11, color: '#94a3b8' }}>/malam</span>
                  </div>
                  <a
                    href={`/villas/${v.id}`}
                    style={{ display: 'block', background: '#5C8A36', color: '#fff', padding: '5px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}
                  >
                    Lihat Villa →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* "Cari di area ini" floating button */}
        {hasMoved && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
            <button
              onClick={handleAreaSearch}
              disabled={searching}
              className="flex items-center gap-1.5 px-5 py-2 bg-white rounded-full shadow-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-60"
              style={{ color: '#2C4B1A' }}
            >
              {searching
                ? <><Loader2 size={14} className="animate-spin" /> Mencari...</>
                : <><RefreshCw size={14} /> Cari di area ini</>
              }
            </button>
          </div>
        )}

        {/* Count badge */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold shadow" style={{ color: '#2C4B1A' }}>
          {mapped.length} villa di peta
        </div>
      </div>

      {/* Warning for villas without coords */}
      {unmapped > 0 && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
          ⚠ {unmapped} villa tidak memiliki data koordinat dan tidak ditampilkan di peta
        </div>
      )}
    </div>
  )
}
