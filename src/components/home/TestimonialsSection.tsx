'use client'

import { useEffect, useState } from 'react'
import { testimonialService } from '@/services/testimonialService'
import { Testimonial } from '@/types'
import { getImageUrl } from '@/utils'
import Image from 'next/image'
import { Star } from 'lucide-react'

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeInUp"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Quote icon */}
      <div className="text-4xl font-black opacity-10 text-slate-800 leading-none mb-2 select-none">&ldquo;</div>
      <div className="flex gap-1 mb-3">
        {[...Array(t.rating)].map((_, j) => (
          <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">{t.message}</p>
      <div className="flex items-center gap-3">
        {t.photo ? (
          <Image
            src={getImageUrl(t.photo)}
            alt={t.name}
            width={36}
            height={36}
            unoptimized
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #3A6928, #5C8A36)' }}
          >
            {t.name[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
          {t.position && <div className="text-slate-400 text-xs">{t.position}</div>}
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[]>([])

  useEffect(() => {
    testimonialService
      .getAll()
      .then(res => setItems(res.data))
      .catch(() => setItems([]))
  }, [])

  if (items.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="text-center mb-12">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#5C8A36' }}>
          Testimoni
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 animate-fadeInUp">Kata Mereka</h2>
        <p className="text-slate-500 mt-2 animate-fadeInUp delay-100">Pengalaman nyata dari tamu Villa Sadulur</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((t, i) => (
          <TestimonialCard key={t.id} t={t} index={i} />
        ))}
      </div>
    </section>
  )
}
