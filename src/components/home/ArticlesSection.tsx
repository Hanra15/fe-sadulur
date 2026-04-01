'use client'

import { useEffect, useState } from 'react'
import { articleService } from '@/services/articleService'
import { Article } from '@/types'
import { getImageUrl } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, FileText, User } from 'lucide-react'

export default function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    articleService
      .getAll({ status: 'published', limit: 3, page: 1 })
      .then(res => setArticles(res.data ?? []))
      .catch(() => setArticles([]))
      .finally(() => setLoaded(true))
  }, [])

  // Don't render section at all if no articles
  if (loaded && articles.length === 0) return null
  if (!loaded) return null

  return (
    <section className="py-14 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#5C8A36' }}>
              Blog
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Artikel &amp; Tips Liburan</h2>
            <p className="text-slate-500 mt-1 text-sm">Inspirasi dan panduan menginap di Puncak Bogor</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:gap-3 transition-all duration-200 shrink-0"
            style={{ color: '#5C8A36' }}
          >
            Lihat semua <ArrowRight size={15} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} featured={i === 0} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border transition hover:shadow-md"
            style={{ borderColor: '#5C8A36', color: '#5C8A36' }}
          >
            Lihat Semua Artikel <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Cover */}
      <div className={`${featured ? 'h-52' : 'h-44'} bg-slate-100 overflow-hidden shrink-0`}>
        {article.cover_image ? (
          <Image
            src={getImageUrl(article.cover_image)}
            alt={article.title}
            width={600}
            height={featured ? 208 : 176}
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2C4B1A, #5C8A36)' }}
          >
            <FileText size={32} className="text-white/40" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 text-base mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <User size={11} />
            <span>{article.author?.name ?? 'Admin'}</span>
          </div>
          {article.published_at && (
            <div className="flex items-center gap-1">
              <Calendar size={11} />
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
