'use client'

import { useRef, useState, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Upload, X, Crop as CropIcon, Check, ZoomIn,
  RotateCcw, GripVertical, Eye, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { getImageUrl } from '@/utils'

export interface UploadedImage {
  id: string
  file: File
  preview: string   // blob URL for display
  name: string
}

type DragItem =
  | { kind: 'existing'; url: string }
  | { kind: 'new'; id: string }

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  existingUrls?: string[]
  onRemoveExisting?: (url: string) => void
  /** Called when the user reorders items (drag-to-sort). Parent must update both states. */
  onReorder?: (newExistingUrls: string[], newImages: UploadedImage[]) => void
  maxImages?: number
  aspectOptions?: { label: string; value: number }[]
}

const DEFAULT_ASPECT_OPTIONS = [
  { label: 'Bebas', value: 0 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
  { label: '3:2', value: 3 / 2 },
]

function centerAspectCrop(width: number, height: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
    width,
    height,
  )
}

async function getCroppedBlob(image: HTMLImageElement, pixelCrop: PixelCrop, mime: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const sx = image.naturalWidth / image.width
  const sy = image.naturalHeight / image.height
  canvas.width = Math.floor(pixelCrop.width * sx)
  canvas.height = Math.floor(pixelCrop.height * sy)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x * sx, pixelCrop.y * sy, pixelCrop.width * sx, pixelCrop.height * sy, 0, 0, canvas.width, canvas.height)
  return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('empty')), mime, 0.92))
}

export default function ImageUploader({
  images,
  onChange,
  existingUrls = [],
  onRemoveExisting,
  onReorder,
  maxImages = 10,
  aspectOptions = DEFAULT_ASPECT_OPTIONS,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [fileDragging, setFileDragging] = useState(false)

  // Drag-to-reorder
  const dragSrcIdx = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // Crop
  const [cropTarget, setCropTarget] = useState<UploadedImage | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [selectedAspect, setSelectedAspect] = useState<number>(0)
  const [cropping, setCropping] = useState(false)

  const totalCount = existingUrls.length + images.length
  const canAdd = totalCount < maxImages

  // Unified list for display + reorder
  const allItems: DragItem[] = [
    ...existingUrls.map(url => ({ kind: 'existing' as const, url })),
    ...images.map(img => ({ kind: 'new' as const, id: img.id })),
  ]

  function getItemSrc(item: DragItem): string {
    if (item.kind === 'existing') return getImageUrl(item.url)
    return images.find(i => i.id === item.id)!.preview
  }

  function getItemLabel(item: DragItem) {
    return item.kind === 'existing' ? 'server' : 'baru'
  }

  // ── File pick / drop ──────────────────────────────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    const slots = maxImages - totalCount
    const toAdd = arr.slice(0, slots)
    const added: UploadedImage[] = toAdd.map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }))
    onChange([...images, ...added])
  }, [images, onChange, maxImages, totalCount])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setFileDragging(false)
    // Only handle if it's actual files (not reorder drag)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  // ── Remove ────────────────────────────────────────────────────────────────
  function removeItem(item: DragItem) {
    if (item.kind === 'existing') {
      onRemoveExisting?.(item.url)
    } else {
      const target = images.find(i => i.id === item.id)
      if (target) URL.revokeObjectURL(target.preview)
      onChange(images.filter(i => i.id !== item.id))
    }
  }

  // ── Drag-to-reorder ───────────────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, idx: number) {
    dragSrcIdx.current = idx
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(idx)
  }

  function handleDragEnd() {
    const src = dragSrcIdx.current
    const dst = dragOverIdx
    dragSrcIdx.current = null
    setDragOverIdx(null)
    if (src === null || dst === null || src === dst) return

    const reordered = [...allItems]
    const [moved] = reordered.splice(src, 1)
    reordered.splice(dst, 0, moved)

    const newExisting: string[] = []
    const newNew: UploadedImage[] = []
    for (const item of reordered) {
      if (item.kind === 'existing') {
        newExisting.push(item.url)
      } else {
        const img = images.find(i => i.id === item.id)!
        newNew.push(img)
      }
    }

    if (onReorder) {
      onReorder(newExisting, newNew)
    } else {
      // Fallback: only reorder new images (can't reorder existing without onReorder)
      onChange(newNew)
    }
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────
  function openLightbox(idx: number) { setLightboxIdx(idx) }

  function lightboxMove(dir: 1 | -1) {
    setLightboxIdx(i => {
      if (i === null) return 0
      return Math.max(0, Math.min(allItems.length - 1, i + dir))
    })
  }

  // ── Crop ──────────────────────────────────────────────────────────────────
  function openCrop(img: UploadedImage) {
    setCropTarget(img)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setSelectedAspect(0)
  }

  function onImageLoaded(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, selectedAspect || 16 / 9))
  }

  function handleAspectChange(val: number) {
    setSelectedAspect(val)
    if (!imgRef.current) return
    const { width, height } = imgRef.current
    setCrop(val === 0
      ? { unit: '%', x: 5, y: 5, width: 90, height: 90 }
      : centerAspectCrop(width, height, val))
  }

  async function applyCrop() {
    if (!cropTarget || !completedCrop || !imgRef.current) { setCropTarget(null); return }
    setCropping(true)
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop, cropTarget.file.type)
      const newFile = new File([blob], cropTarget.name, { type: cropTarget.file.type })
      URL.revokeObjectURL(cropTarget.preview)
      const newPreview = URL.createObjectURL(blob)
      onChange(images.map(i => i.id === cropTarget.id ? { ...i, file: newFile, preview: newPreview } : i))
    } finally {
      setCropping(false)
      setCropTarget(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={e => { e.preventDefault(); setFileDragging(true) }}
          onDragLeave={() => setFileDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl py-8 px-4 text-center cursor-pointer transition-colors select-none
            ${fileDragging ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'}`}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInputChange} />
          <Upload size={24} className="mx-auto mb-2" style={{ color: fileDragging ? '#9333ea' : '#9ca3af' }} />
          <p className="text-sm text-slate-500">
            <span className="font-medium text-purple-600">Klik untuk upload</span> atau drag &amp; drop
          </p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP · maks. {maxImages} gambar · 5 MB/gambar</p>
        </div>
      )}

      {/* Preview grid with reorder */}
      {allItems.length > 0 && (
        <div>
          {allItems.length > 1 && (
            <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <GripVertical size={11} /> Seret untuk mengubah urutan
            </p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allItems.map((item, idx) => (
              <div
                key={item.kind === 'existing' ? item.url : item.id}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onDrop={e => e.preventDefault()}
                className={`relative group aspect-video rounded-lg overflow-hidden bg-slate-100 border-2 cursor-grab active:cursor-grabbing transition-all
                  ${dragOverIdx === idx && dragSrcIdx.current !== idx
                    ? 'border-purple-400 scale-105'
                    : 'border-slate-200'
                  }`}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getItemSrc(item)}
                  alt="gambar villa"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-1.5">
                  {/* View */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); openLightbox(idx) }}
                    className="opacity-0 group-hover:opacity-100 transition w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white"
                    title="Lihat gambar"
                  >
                    <Eye size={13} />
                  </button>

                  {/* Crop (only for new images) */}
                  {item.kind === 'new' && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        const img = images.find(i => i.id === item.id)!
                        openCrop(img)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white"
                      title="Crop gambar"
                    >
                      <CropIcon size={13} />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeItem(item) }}
                    className="opacity-0 group-hover:opacity-100 transition w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                    title="Hapus"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Index badge (1st = cover) */}
                <span className={`absolute top-0.5 left-0.5 text-white text-[9px] px-1 rounded font-medium
                  ${idx === 0 ? 'bg-amber-500' : 'bg-black/40'}`}>
                  {idx === 0 ? 'Cover' : idx + 1}
                </span>

                {/* Source badge */}
                <span className={`absolute bottom-0.5 left-0.5 text-white text-[9px] px-1 rounded
                  ${item.kind === 'existing' ? 'bg-black/50' : 'bg-purple-500/80'}`}>
                  {getItemLabel(item)}
                </span>

                {/* Drag handle hint */}
                <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-60 transition">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCount > 0 && (
        <p className="text-xs text-slate-400">{totalCount}/{maxImages} gambar · gambar pertama dijadikan cover</p>
      )}

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && allItems[lightboxIdx] && (
        <div
          className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
          >
            <X size={18} />
          </button>

          {lightboxIdx > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); lightboxMove(-1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {lightboxIdx < allItems.length - 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); lightboxMove(1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div className="max-w-3xl max-h-[85vh] px-16 flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getItemSrc(allItems[lightboxIdx])}
              alt="preview"
              className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="text-white/60 text-xs">{lightboxIdx + 1} / {allItems.length}</p>
          </div>
        </div>
      )}

      {/* ── Crop dialog ── */}
      {cropTarget && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CropIcon size={16} className="text-purple-500" />
                <span className="font-semibold text-slate-800 text-sm">Crop Gambar</span>
              </div>
              <button type="button" onClick={() => setCropTarget(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-wrap">
              <span className="text-xs text-slate-500 font-medium mr-1">Rasio:</span>
              {aspectOptions.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleAspectChange(opt.value)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition
                    ${selectedAspect === opt.value ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-4 min-h-[260px] max-h-[60vh]">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={selectedAspect || undefined}
                minWidth={30}
                minHeight={30}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cropTarget.preview}
                  alt="crop"
                  onLoad={onImageLoaded}
                  style={{ maxHeight: '55vh', maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
              <ZoomIn size={12} />
              <span>Seret untuk memilih area · Pilih rasio di atas untuk proporsi tetap</span>
            </div>

            <div className="flex gap-3 px-4 py-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCropTarget(null)}
                className="flex items-center gap-1.5 flex-1 justify-center py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw size={14} /> Batal
              </button>
              <button
                type="button"
                onClick={applyCrop}
                disabled={!completedCrop || cropping}
                className="flex items-center gap-1.5 flex-1 justify-center py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
              >
                <Check size={14} /> {cropping ? 'Memproses...' : 'Terapkan Crop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
