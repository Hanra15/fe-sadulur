'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { faqService } from '@/services/faqService'
import { Faq } from '@/types'
import Link from 'next/link'
import {
  HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle,
} from 'lucide-react'

export default function FaqPage() {
  const [openId, setOpenId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['faqs-public'],
    queryFn: () => faqService.getAll(),
  })

  const allFaqs: Faq[] = data?.data ?? []
  const categories = Object.keys(data?.grouped ?? {})

  const filtered = allFaqs.filter((f) => {
    const matchCat = !filterCategory || f.category === filterCategory
    const matchSearch = !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const grouped: Record<string, Faq[]> = {}
  filtered.forEach((f) => {
    const cat = f.category || 'Umum'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(f)
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="py-16 text-center" style={{ background: 'linear-gradient(135deg, #2C4B1A 0%, #3A6928 100%)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Pertanyaan Umum (FAQ)</h1>
          <p className="text-green-200 text-lg">Temukan jawaban atas pertanyaan yang sering diajukan</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pertanyaan..."
            className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          />
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filterCategory ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              style={!filterCategory ? { background: '#2C4B1A' } : undefined}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterCategory === cat ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                style={filterCategory === cat ? { background: '#2C4B1A' } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* FAQ list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Tidak ada FAQ yang sesuai</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="space-y-2">
              {Object.keys(grouped).length > 1 && (
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">{cat}</h2>
              )}
              <div className="space-y-2">
                {items.map((faq) => {
                  const isOpen = openId === faq.id
                  return (
                    <div key={faq.id} className="bg-white rounded-2xl border overflow-hidden">
                      <button
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-medium text-slate-800 text-sm">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t pt-3">
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* CTA */}
        <div className="bg-white rounded-2xl border p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center" style={{ background: '#f0f7e8' }}>
            <MessageCircle className="w-5 h-5" style={{ color: '#2C4B1A' }} />
          </div>
          <h3 className="font-semibold text-slate-800">Tidak menemukan jawaban?</h3>
          <p className="text-sm text-slate-500">Tim kami siap membantu Anda melalui tiket dukungan.</p>
          <Link
            href="/support"
            className="inline-block px-6 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition"
            style={{ background: '#2C4B1A' }}
          >
            Buat Tiket Dukungan
          </Link>
        </div>
      </div>
    </div>
  )
}
