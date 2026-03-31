'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { articleService } from '@/services/articleService'
import { Article } from '@/types'
import { getImageUrl } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, User, Loader2, AlertCircle, FileText,
} from 'lucide-react'

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    articleService
      .getBySlug(slug)
      .then(res => setArticle(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#5C8A36' }} />
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle size={40} className="text-slate-300" />
        <p className="text-slate-500 text-sm">Artikel tidak ditemukan atau belum diterbitkan.</p>
        <Link
          href="/blog"
          className="flex items-center gap-2 text-sm font-semibold hover:underline"
          style={{ color: '#5C8A36' }}
        >
          <ArrowLeft size={14} /> Kembali ke Blog
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover Hero */}
      {article.cover_image ? (
        <div className="relative h-64 sm:h-96 w-full overflow-hidden">
          <Image
            src={getImageUrl(article.cover_image)}
            alt={article.title}
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition"
              onClick={e => { e.stopPropagation(); router.push('/blog') }}
            >
              <ArrowLeft size={14} /> Blog
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug mb-3">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {article.author?.name ?? 'Admin'}
              </span>
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(article.published_at).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        // No cover image — minimal header
        <div
          className="py-16 px-4 text-white"
          style={{ background: 'linear-gradient(135deg, #1a3010, #2C4B1A, #5C8A36)' }}
        >
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition"
            >
              <ArrowLeft size={14} /> Blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-green-300" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-4 leading-snug">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {article.author?.name ?? 'Admin'}
              </span>
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(article.published_at).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10">
          {article.excerpt && (
            <p className="text-slate-500 italic text-base border-l-4 pl-4 mb-8 leading-relaxed" style={{ borderColor: '#5C8A36' }}>
              {article.excerpt}
            </p>
          )}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition"
            style={{ color: '#5C8A36' }}
          >
            <ArrowLeft size={15} /> Kembali ke Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
