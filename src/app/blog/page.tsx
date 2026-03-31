'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { articleService } from '@/services/articleService'
import { Article } from '@/types'
import { getImageUrl } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Search, FileText, ChevronLeft, ChevronRight, Loader2, Calendar, User } from 'lucide-react'

const LIMIT = 9

function BlogList() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageParam = Number(searchParams.get('page') ?? '1')
  const searchParam = searchParams.get('search') ?? ''

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState(searchParam)

  const loadArticles = useCallback(async (page: number, search: string) => {
    setLoading(true)
    try {
      const res = await articleService.getAll({ status: 'published', page, limit: LIMIT, search: search || undefined })
      setArticles(res.data)
      setTotal(res.pagination?.total ?? res.total ?? res.data.length)
    } catch {
      setArticles([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles(pageParam, searchParam)
  }, [pageParam, searchParam, loadArticles])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput) params.set('search', searchInput)
    params.set('page', '1')
    router.push(`/blog?${params.toString()}`)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams()
    if (searchParam) params.set('search', searchParam)
    params.set('page', String(p))
    router.push(`/blog?${params.toString()}`)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      {/* Hero Banner */}
      <section
        className="py-16 md:py-20 text-white text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a3010 0%, #2C4B1A 50%, #5C8A36 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl" style={{ background: '#A8D87A' }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl" style={{ background: '#A8D87A' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 text-green-300">
            Blog
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Artikel &amp; Tips Villa</h1>
          <p className="text-slate-300 text-sm mb-8">Inspirasi liburan, tips menginap, dan informasi seputar Villa Sadulur</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full bg-white/90 backdrop-blur rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
              style={{ backgroundColor: '#3A6928' }}
            >
              Cari
            </button>
          </form>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin" style={{ color: '#5C8A36' }} />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <FileText size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">
              {searchParam ? `Tidak ada artikel untuk "${searchParam}"` : 'Belum ada artikel yang diterbitkan.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {articles.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(pageParam - 1)}
                  disabled={pageParam <= 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      p === pageParam
                        ? 'text-white'
                        : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                    style={p === pageParam ? { backgroundColor: '#5C8A36' } : {}}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(pageParam + 1)}
                  disabled={pageParam >= totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Cover */}
      <div className="h-44 bg-slate-100 overflow-hidden shrink-0">
        {article.cover_image ? (
          <Image
            src={getImageUrl(article.cover_image)}
            alt={article.title}
            width={400}
            height={176}
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2C4B1A, #5C8A36)' }}
          >
            <FileText size={32} className="text-white/50" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 text-base mb-2 line-clamp-2 group-hover:text-green-700 transition">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{article.author?.name ?? 'Admin'}</span>
          </div>
          {article.published_at && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>
                {new Date(article.published_at).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#5C8A36' }} />
      </div>
    }>
      <BlogList />
    </Suspense>
  )
}
