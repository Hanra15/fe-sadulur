import Link from 'next/link'
import { MapPin, Star, Users, BedDouble } from 'lucide-react'
import { Villa } from '@/types'
import { formatCurrency, getVillaThumbnail, getImageUrl } from '@/utils'
import Image from 'next/image'

interface VillaCardProps {
  villa: Villa
}

export default function VillaCard({ villa }: VillaCardProps) {
  const thumbnail = getVillaThumbnail(villa)

  return (
    <Link href={`/villas/${villa.slug ?? villa.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 border border-slate-100">
        {/* Gambar */}
        <div className="relative h-52 overflow-hidden bg-slate-200">
          <Image
            src={thumbnail}
            alt={villa.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {villa.rating && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              {villa.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-800 text-base truncate transition" style={{ color: undefined }}
            onMouseEnter={e => (e.currentTarget.style.color = '#5C8A36')}
            onMouseLeave={e => (e.currentTarget.style.color = '')}>
            {villa.name}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
            <MapPin size={13} className="shrink-0" style={{ color: '#5C8A36' }} />
            <span className="truncate">{villa.location}</span>
          </div>

          {/* Fasilitas singkat */}
          <div className="flex items-center gap-3 mt-2 text-slate-500 text-xs">
            {villa.capacity && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {villa.capacity} tamu
              </span>
            )}
            {villa.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble size={12} /> {villa.bedrooms} kamar
              </span>
            )}
          </div>

          {/* Harga */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-base" style={{ color: '#5C8A36' }}>
                {formatCurrency(villa.price)}
              </span>
              <span className="text-slate-400 text-xs"> / malam</span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              villa.available
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-red-50 text-red-500 border-red-100'
            }`}>
              {villa.available ? 'Tersedia' : 'Penuh'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
