'use client'

import { useRef, useState, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Upload, X, Crop as CropIcon, Check, ZoomIn, RotateCcw } from 'lucide-react'
import Image from 'next/image'

export interface UploadedImage {
  id: string
  file: File
  preview: string    // blob URL for display
  name: string
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  /** Existing image URLs (from server) shown alongside new uploads */
  existingUrls?: string[]
  onRemoveExisting?: (url: string) => void
  maxImages?: number
  /** Accepted aspect ratios: label + value (width/height). 0 = free crop */
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

async function getCroppedBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  mimeType: string,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = Math.floor(pixelCrop.width * scaleX)
  canvas.height = Math.floor(pixelCrop.height * scaleY)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0, 0,
    canvas.width,
    canvas.height,
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas empty')), mimeType, 0.92)
  })
}

export default function ImageUploader({
  images,
  onChange,
  existingUrls = [],
  onRemoveExisting,
  maxImages = 10,
  aspectOptions = DEFAULT_ASPECT_OPTIONS,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [dragging, setDragging] = useState(false)

  // Crop dialog state
  const [cropTarget, setCropTarget] = useState<UploadedImage | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [selectedAspect, setSelectedAspect] = useState<number>(0)
  const [cropping, setCropping] = useState(false)

  const totalCount = existingUrls.length + images.length
  const canAdd = totalCount < maxImages

  // ── File ingestion ────────────────────────────────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    const slots = maxImages - totalCount
    const toAdd = arr.slice(0, slots)
    const newImages: UploadedImage[] = toAdd.map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }))
    onChange([...images, ...newImages])
  }, [images, onChange, maxImages, totalCount])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  function removeNew(id: string) {
    const target = images.find(i => i.id === id)
    if (target) URL.revokeObjectURL(target.preview)
    onChange(images.filter(i => i.id !== id))
  }

  // ── Crop dialog ───────────────────────────────────────────────────────────
  function openCrop(img: UploadedImage) {
    setCropTarget(img)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setSelectedAspect(0)
  }

  function onImageLoaded(e: React.SyntheticEvent<HTMLImageElement>) {
    imgRef.current = e.currentTarget
    const { width, height } = e.currentTarget
    const aspect = selectedAspect || 16 / 9
    setCrop(centerAspectCrop(width, height, aspect))
  }

  function handleAspectChange(val: number) {
    setSelectedAspect(val)
    if (!imgRef.current) return
    const { width, height } = imgRef.current
    if (val === 0) {
      setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 })
    } else {
      setCrop(centerAspectCrop(width, height, val))
    }
  }

  async function applyCrop() {
    if (!cropTarget || !completedCrop || !imgRef.current) {
      setCropTarget(null); return
    }
    setCropping(true)
    try {
      const croppedBlob = await getCroppedBlob(imgRef.current, completedCrop, cropTarget.file.type)
      const croppedFile = new File([croppedBlob], cropTarget.name, { type: cropTarget.file.type })
      URL.revokeObjectURL(cropTarget.preview)
      const newPreview = URL.createObjectURL(croppedBlob)
      onChange(images.map(i =>
        i.id === cropTarget.id
          ? { ...i, file: croppedFile, preview: newPreview }
          : i
      ))
    } finally {
      setCropping(false)
      setCropTarget(null)
    }
  }

  function cancelCrop() {
    setCropTarget(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl py-8 px-4 text-center cursor-pointer transition-colors
            ${dragging ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
          <Upload size={24} className={`mx-auto mb-2 ${dragging ? 'text-purple-500' : 'text-slate-350'}`} style={{ color: dragging ? undefined : '#9ca3af' }} />
          <p className="text-sm text-slate-500">
            <span className="font-medium text-purple-600">Klik untuk upload</span> atau drag &amp; drop
          </p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP · maks. {maxImages} gambar · 5 MB/gambar</p>
        </div>
      )}

      {/* Preview grid */}
      {(existingUrls.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {/* Existing server images */}
          {existingUrls.map(url => (
            <div key={url} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <Image src={url} alt="gambar" fill className="object-cover" sizes="120px" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onRemoveExisting?.(url)}
                  className="opacity-0 group-hover:opacity-100 transition w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white"
                >
                  <X size={13} />
                </button>
              </div>
              <span className="absolute bottom-0.5 left-0.5 bg-black/50 text-white text-[9px] px-1 rounded">server</span>
            </div>
          ))}

          {/* New local images */}
          {images.map(img => (
            <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openCrop(img)}
                  className="opacity-0 group-hover:opacity-100 transition w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white"
                  title="Crop gambar"
                >
                  <CropIcon size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => removeNew(img.id)}
                  className="opacity-0 group-hover:opacity-100 transition w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white"
                  title="Hapus"
                >
                  <X size={13} />
                </button>
              </div>
              <span className="absolute bottom-0.5 left-0.5 bg-purple-500/80 text-white text-[9px] px-1 rounded">baru</span>
            </div>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <p className="text-xs text-slate-400">{totalCount}/{maxImages} gambar</p>
      )}

      {/* ── Crop dialog ── */}
      {cropTarget && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CropIcon size={16} className="text-purple-500" />
                <span className="font-semibold text-slate-800 text-sm">Crop Gambar</span>
              </div>
              <button type="button" onClick={cancelCrop} className="p-1 rounded-lg hover:bg-slate-100">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Aspect ratio pills */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 flex-wrap">
              <span className="text-xs text-slate-500 font-medium mr-1">Rasio:</span>
              {aspectOptions.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleAspectChange(opt.value)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition
                    ${selectedAspect === opt.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Crop area */}
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

            {/* Tips */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
              <ZoomIn size={12} />
              <span>Seret untuk memilih area · Pilih rasio di atas untuk proporsi tetap</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-4 py-3 border-t border-slate-100">
              <button
                type="button"
                onClick={cancelCrop}
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
