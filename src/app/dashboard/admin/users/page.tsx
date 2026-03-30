'use client'

import { Users, Info } from 'lucide-react'

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h1>
        <p className="text-xs text-slate-400">Kelola akun pengguna sistem</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-slate-400" />
        </div>
        <h2 className="font-bold text-slate-700 mb-2">Fitur dalam pengembangan</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          Endpoint manajemen user (list, edit role, nonaktifkan akun) belum tersedia di backend. 
          Fitur ini akan aktif setelah endpoint <code className="bg-slate-100 px-1 rounded text-xs">/api/users</code> ditambahkan ke backend.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 text-left max-w-md mx-auto">
          <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Sementara ini, data pengguna dapat dilihat dari data booking (kolom nama & nomor HP tamu) atau langsung melalui database.
          </p>
        </div>
      </div>
    </div>
  )
}
