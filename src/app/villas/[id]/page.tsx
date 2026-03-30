'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { villaService } from '@/services/villaService'
import { formatCurrency, getImageUrl } from '@/utils'
import { MapPin, Star, Users, BedDouble, Bath, Wifi, Car, Loader2, AlertCircle, ArrowLeft, Expand } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import BookingForm from '@/components/booking/BookingForm'
import ImageLightbox from '@/components/villa/ImageLightbox'

export default function VillaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [showBooking, setShowBooking] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['villa', id],
    queryFn: () => villaService.getById(id),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center py-20 text-slate-500 gap-3">
        <AlertCircle size={40} className="text-red-400" />
        <p>Villa tidak ditemukan atau terjadi kesalahan.</p>
        <Link href="/villas" className="text-emerald-600 hover:underline text-sm">← Kembali ke daftar villa</Link>
      </div>
    )
  }

  const villa = data.data
  const allImages = villa.images?.map(getImageUrl) ?? []
  const thumbnail = allImages[0] ?? '/images/villa-placeholder.jpg'

  const facilityIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi size={16} />,
    parkir: <Car size={16} />,
    kolam: <span>🏊</span>,
    dapur: <span>🍳</span>,
    ac: <span>❄️</span>,
    tv: <span>📺</span>,
    bbq: <span>🔥</span>,
  }

  // Google Maps embed — search by coordinates jika ada, fallback ke nama lokasi
  const mapsQuery = villa.latitude && villa.longitude
    ? `${villa.latitude},${villa.longitude}`
    : encodeURIComponent(`${villa.name}, ${villa.location}`)
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&output=embed&hl=id`
  const mapsDirectUrl = villa.latitude && villa.longitude
    ? `https://maps.google.com/?q=${villa.latitude},${villa.longitude}`
    : `https://maps.google.com/?q=${encodeURIComponent(`${villa.name}, ${villa.location}`)}`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Lightbox */}
      {lightboxIndex !== null && allImages.length > 0 && (
        <ImageLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition mb-6 text-sm">
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Gambar utama */}
      <div
        className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-slate-200 mb-3 cursor-pointer group"
        onClick={() => setLightboxIndex(0)}
      >
        <Image
          src={thumbnail}
          alt={villa.name}
          fill
          className="object-cover group-hover:brightness-90 transition duration-300"
          sizes="(max-width: 1024px) 100vw, 80vw"
          priority
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
            <Expand size={22} className="text-white" />
          </div>
        </div>
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            +{allImages.length - 1} foto
          </div>
        )}
      </div>

      {/* Galeri thumbnail */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {allImages.slice(1).map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i + 1)}
              className="relative shrink-0 w-24 h-16 rounded-xl overflow-hidden bg-slate-200 group"
            >
              <Image
                src={img}
                alt={`${villa.name} ${i + 2}`}
                fill
                className="object-cover group-hover:brightness-90 transition"
                unoptimized
                sizes="96px"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Expand size={14} className="text-white drop-shadow" />
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info utama */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{villa.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin size={14} className="text-emerald-500" />{villa.location}</span>
              {villa.rating && (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star size={14} className="fill-amber-400" /> {villa.rating.toFixed(1)}
                  {villa.reviews_count && <span className="text-slate-400 font-normal">({villa.reviews_count} ulasan)</span>}
                </span>
              )}
            </div>
          </div>

          {/* Fasilitas singkat */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {villa.capacity && <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Users size={15} className="text-emerald-500" /> {villa.capacity} tamu</span>}
            {villa.bedrooms && <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><BedDouble size={15} className="text-emerald-500" /> {villa.bedrooms} kamar tidur</span>}
            {villa.bathrooms && <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Bath size={15} className="text-emerald-500" /> {villa.bathrooms} kamar mandi</span>}
          </div>

          {/* Deskripsi */}
          <div>
            <h2 className="font-semibold text-slate-700 text-lg mb-2">Tentang Villa</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{villa.description}</p>
          </div>

          {/* Fasilitas */}
          {villa.facilities && villa.facilities.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-700 text-lg mb-3">Fasilitas</h2>
              <div className="flex flex-wrap gap-2">
                {villa.facilities.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm px-3 py-1.5 rounded-xl border border-emerald-100">
                    {facilityIcons[f.toLowerCase()] ?? '✓'} {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Maps Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-700 text-lg">Lokasi</h2>
              <a
                href={mapsDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
              >
                <MapPin size={12} /> Buka di Google Maps
              </a>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 280 }}>
              <iframe
                title={`Lokasi ${villa.name}`}
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <MapPin size={11} /> {villa.location}
            </p>
          </div>
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 shadow-md p-6">
            <div className="mb-4">
              <span className="text-2xl font-bold text-emerald-600">{formatCurrency(villa.price)}</span>
              <span className="text-slate-400 text-sm"> / malam</span>
              {villa.priceWeekend && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Weekend: <span className="text-amber-600 font-semibold">{formatCurrency(villa.priceWeekend)}</span>
                </div>
              )}
            </div>
            {!showBooking ? (
              <div className="space-y-2">
                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  Pesan Sekarang
                </button>
                {villa.whatsapp && (
                  <a
                    href={`https://wa.me/${villa.whatsapp}?text=Halo, saya ingin menanyakan ketersediaan ${encodeURIComponent(villa.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium py-3 rounded-xl transition text-sm"
                  >
                    <span>💬</span> Hubungi via WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <BookingForm villa={villa} onCancel={() => setShowBooking(false)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

