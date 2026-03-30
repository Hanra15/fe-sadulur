'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set('search', location)
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)
    if (guests) params.set('capacity', guests)
    router.push(`/villas?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-2xl shadow-xl p-2 flex flex-wrap md:flex-nowrap gap-2 w-full max-w-4xl"
    >
      {/* Lokasi */}
      <div className="flex items-center gap-2 flex-1 min-w-[160px] px-3 py-2 rounded-xl hover:bg-slate-50 transition">
        <MapPin size={17} className="text-emerald-500 shrink-0" />
        <div className="flex flex-col w-full">
          <label className="text-xs text-slate-500 font-medium">Lokasi</label>
          <input
            type="text"
            placeholder="Puncak Bogor..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm text-slate-700 outline-none bg-transparent placeholder-slate-300"
          />
        </div>
      </div>

      <div className="hidden md:block w-px bg-slate-200 self-stretch" />

      {/* Check-in */}
      <div className="flex items-center gap-2 flex-1 min-w-[130px] px-3 py-2 rounded-xl hover:bg-slate-50 transition">
        <Calendar size={17} className="text-emerald-500 shrink-0" />
        <div className="flex flex-col w-full">
          <label className="text-xs text-slate-500 font-medium">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="text-sm text-slate-700 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="hidden md:block w-px bg-slate-200 self-stretch" />

      {/* Check-out */}
      <div className="flex items-center gap-2 flex-1 min-w-[130px] px-3 py-2 rounded-xl hover:bg-slate-50 transition">
        <Calendar size={17} className="text-emerald-500 shrink-0" />
        <div className="flex flex-col w-full">
          <label className="text-xs text-slate-500 font-medium">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="text-sm text-slate-700 outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="hidden md:block w-px bg-slate-200 self-stretch" />

      {/* Tamu */}
      <div className="flex items-center gap-2 min-w-[100px] px-3 py-2 rounded-xl hover:bg-slate-50 transition">
        <Users size={17} className="text-emerald-500 shrink-0" />
        <div className="flex flex-col w-full">
          <label className="text-xs text-slate-500 font-medium">Tamu</label>
          <input
            type="number"
            placeholder="2"
            min={1}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="text-sm text-slate-700 outline-none bg-transparent w-12 placeholder-slate-300"
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition min-w-fit"
      >
        <Search size={17} />
        <span className="hidden sm:inline">Cari Villa</span>
      </button>
    </form>
  )
}
