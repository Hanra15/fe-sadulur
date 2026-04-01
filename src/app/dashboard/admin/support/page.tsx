'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportService } from '@/services/supportService'
import { SupportTicket } from '@/types'
import Link from 'next/link'
import {
  TicketCheck, Loader2, Search, ChevronRight, Trash2,
} from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700' },
  closed:      { label: 'Closed',      color: 'bg-slate-100 text-slate-600' },
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low:    { label: 'Rendah', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Sedang', color: 'bg-yellow-100 text-yellow-700' },
  high:   { label: 'Tinggi', color: 'bg-red-100 text-red-700' },
}

const STATUS_TABS = ['all', 'open', 'in_progress', 'resolved', 'closed']

export default function AdminSupportPage() {
  const qc = useQueryClient()
  const [statusTab, setStatusTab] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support', statusTab],
    queryFn: () => supportService.getAll({ status: statusTab === 'all' ? undefined : statusTab, limit: 100 }),
  })

  const deleteMut = useMutation({
    mutationFn: supportService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-support'] }),
  })

  const tickets: SupportTicket[] = data?.data ?? []
  const filtered = tickets.filter((t) =>
    !search ||
    t.ticket_code.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#2C4B1A' }}>
            <TicketCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Support Tickets</h1>
            <p className="text-sm text-slate-500">Kelola tiket dukungan pengguna</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusTab(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${statusTab === s ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={statusTab === s ? { background: '#2C4B1A' } : undefined}
          >
            {s === 'all' ? 'Semua' : STATUS_LABELS[s]?.label ?? s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode tiket, subjek, nama..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <TicketCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Tidak ada tiket</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const st = STATUS_LABELS[ticket.status]
            const pr = PRIORITY_LABELS[ticket.priority]
            return (
              <div key={ticket.ticket_code} className="bg-white rounded-2xl border p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{ticket.ticket_code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st?.color}`}>{st?.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pr?.color}`}>{pr?.label}</span>
                  </div>
                  <p className="font-medium text-slate-800 text-sm truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ticket.name} · {ticket.email}
                    {ticket.category && <span> · {ticket.category}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">
                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('id-ID') : ''}
                  </span>
                  <button
                    onClick={() => { if (confirm('Hapus tiket ini beserta semua pesannya?')) deleteMut.mutate(ticket.ticket_code) }}
                    className="p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <Link href={`/dashboard/admin/support/${ticket.ticket_code}`} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
