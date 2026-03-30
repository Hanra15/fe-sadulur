'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface Props {
  images: string[]
  initialIndex: number
  onClose: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const ZOOM_STEP = 0.5

export default function ImageLightbox({ images, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const resetZoom = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
    translateRef.current = { x: 0, y: 0 }
  }, [])

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + images.length) % images.length)
      resetZoom()
    },
    [images.length, resetZoom]
  )

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + ZOOM_STEP, MAX_SCALE)), [])
  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(s - ZOOM_STEP, MIN_SCALE)
      if (next === MIN_SCALE) {
        setTranslate({ x: 0, y: 0 })
        translateRef.current = { x: 0, y: 0 }
      }
      return next
    })
  }, [])

  // Keyboard events
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goTo(index + 1)
      if (e.key === 'ArrowLeft') goTo(index - 1)
      if (e.key === '+') zoomIn()
      if (e.key === '-') zoomOut()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [index, onClose, goTo, zoomIn, zoomOut])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      if (e.deltaY < 0) zoomIn()
      else zoomOut()
    },
    [zoomIn, zoomOut]
  )

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    isDragging.current = true
    dragStart.current = { x: e.clientX - translateRef.current.x, y: e.clientY - translateRef.current.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    const newX = e.clientX - dragStart.current.x
    const newY = e.clientY - dragStart.current.y
    translateRef.current = { x: newX, y: newY }
    setTranslate({ x: newX, y: newY })
  }

  const handleMouseUp = () => { isDragging.current = false }

  // Touch support
  const lastTouchDist = useRef<number | null>(null)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (lastTouchDist.current !== null) {
        if (dist > lastTouchDist.current + 5) zoomIn()
        else if (dist < lastTouchDist.current - 5) zoomOut()
      }
      lastTouchDist.current = dist
    }
  }
  const handleTouchEnd = () => { lastTouchDist.current = null }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-10">
        <span className="text-white/80 text-sm font-medium">{index + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition"
            title="Zoom out (−)"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-white/80 text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition"
            title="Zoom in (+)"
          >
            <ZoomIn size={18} />
          </button>
          {scale > 1 && (
            <button
              onClick={resetZoom}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Reset zoom"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition ml-2"
            title="Tutup (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={() => goTo(index - 1)}
          className="absolute left-3 z-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
      >
        <div
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: isDragging.current ? 'none' : 'transform 0.2s ease',
            position: 'relative',
            width: 'min(90vw, 90vh)',
            height: 'min(80vh, 80vw)',
            userSelect: 'none',
          }}
        >
          <Image
            src={images[index]}
            alt={`Foto ${index + 1}`}
            fill
            className="object-contain"
            unoptimized
            draggable={false}
            sizes="90vw"
            priority
          />
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={() => goTo(index + 1)}
          className="absolute right-3 z-10 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto z-10">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition ${
                i === index ? 'border-emerald-400 opacity-100' : 'border-white/20 opacity-50 hover:opacity-80'
              }`}
            >
              <Image src={img} alt={`thumb ${i + 1}`} fill className="object-cover" unoptimized sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
