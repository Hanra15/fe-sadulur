'use client'

import { useEffect, useState, useCallback } from 'react'
import { userService, UserFormPayload, CreateUserPayload } from '@/services/userService'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/types'
import { formatDate } from '@/utils'
import {
  Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  Search, KeyRound, ShieldCheck, UserCircle2, Building2, Eye, EyeOff,
} from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'visitor', label: 'Visitor', color: 'bg-green-50 text-green-700' },
  { value: 'owner', label: 'Owner', color: 'bg-blue-50 text-blue-700' },
  { value: 'admin', label: 'Admin', color: 'bg-purple-50 text-purple-700' },
]

function RoleBadge({ role }: { role: string }) {
  const opt = ROLE_OPTIONS.find(r => r.value === role)
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt?.color ?? 'bg-slate-100 text-slate-600'}`}>
      {opt?.label ?? role}
    </span>
  )
}

function RoleIcon({ role }: { role: string }) {
  if (role === 'admin') return <ShieldCheck size={14} className="text-purple-500" />
  if (role === 'owner') return <Building2 size={14} className="text-blue-500" />
  return <UserCircle2 size={14} className="text-green-500" />
}

const EMPTY_FORM: UserFormPayload = { name: '', email: '', role: 'visitor', phone: '' }
const LIMIT = 15

export default function AdminUsersPage() {
  const { user: me } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserFormPayload>(EMPTY_FORM)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [resetPw, setResetPw] = useState('')
  const [showResetPw, setShowResetPw] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadUsers = useCallback(async (p = 1, s = search, r = filterRole) => {
    setLoading(true)
    try {
      const res = await userService.getAll({ page: p, limit: LIMIT, search: s || undefined, role: r || undefined })
      setUsers(res.data)
      setTotalPages(res.pagination?.totalPages ?? 1)
      setTotal(res.pagination?.total ?? res.data.length)
      setPage(p)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [search, filterRole])

  useEffect(() => { loadUsers(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadUsers(1, search, filterRole)
  }

  function handleRoleFilter(r: string) {
    setFilterRole(r)
    loadUsers(1, search, r)
  }

  function openAdd() {
    setEditUser(null)
    setForm(EMPTY_FORM)
    setNewPassword('')
    setError('')
    setShowModal(true)
  }

  function openEdit(u: User) {
    setEditUser(u)
    setForm({ name: u.name, email: u.email, role: u.role as UserFormPayload['role'], phone: u.phone ?? '' })
    setNewPassword('')
    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) { setError('Nama dan email wajib diisi'); return }
    if (!editUser && !newPassword.trim()) { setError('Password wajib diisi untuk user baru'); return }
    setSaving(true); setError('')
    try {
      if (editUser) {
        await userService.update(editUser.id, form)
      } else {
        await userService.create({ ...form, password: newPassword } as CreateUserPayload)
      }
      setShowModal(false)
      loadUsers(page)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err?.response?.data?.message ?? 'Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  function openReset(u: User) {
    setResetTarget(u)
    setResetPw('')
    setShowResetPw(false)
    setResetError('')
  }

  async function handleReset() {
    if (!resetTarget) return
    if (resetPw.length < 6) { setResetError('Password minimal 6 karakter'); return }
    setResetting(true); setResetError('')
    try {
      await userService.resetPassword(resetTarget.id, resetPw)
      setResetTarget(null)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setResetError(err?.response?.data?.message ?? 'Gagal mereset password')
    } finally {
      setResetting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await userService.delete(deleteTarget.id)
      setDeleteTarget(null)
      loadUsers(page)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const setField = <K extends keyof UserFormPayload>(k: K, v: UserFormPayload[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const isSelf = (u: User) => String(u.id) === String(me?.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-400">{total} pengguna terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition">
          <Plus size={15} /> Tambah User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400"
              placeholder="Cari nama, email, telepon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm text-slate-600 transition">Cari</button>
        </form>
        <div className="flex gap-1.5 flex-wrap">
          {[{ value: '', label: 'Semua' }, ...ROLE_OPTIONS].map(r => (
            <button
              key={r.value}
              onClick={() => handleRoleFilter(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition
                ${filterRole === r.value ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">Pengguna</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-center px-4 py-3">Role</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Telepon</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Bergabung</th>
                <th className="text-center px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Memuat...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Tidak ada pengguna</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className={`border-t border-slate-50 hover:bg-slate-50/50 ${isSelf(u) ? 'bg-purple-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <RoleIcon role={u.role} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                          {u.name}
                          {isSelf(u) && <span className="text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">Anda</span>}
                        </div>
                        <div className="text-xs text-slate-400 sm:hidden">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3 text-center"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{u.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                    {u.createdAt ? formatDate(u.createdAt) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition" title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => openReset(u)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition" title="Reset password">
                        <KeyRound size={13} />
                      </button>
                      <button
                        onClick={() => { if (!isSelf(u)) setDeleteTarget(u) }}
                        disabled={isSelf(u)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isSelf(u) ? 'Tidak bisa hapus akun sendiri' : 'Hapus'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => loadUsers(page - 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={14} /></button>
              <button disabled={page >= totalPages} onClick={() => loadUsers(page + 1)} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">{editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <Field label="Nama Lengkap*">
                <input className="input-field" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="John Doe" />
              </Field>
              <Field label="Email*">
                <input type="email" className="input-field" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="user@email.com" />
              </Field>
              {!editUser && (
                <Field label="Password*">
                  <input type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 karakter" autoComplete="new-password" />
                </Field>
              )}
              <Field label="Role*">
                <select className="input-field" value={form.role} onChange={e => setField('role', e.target.value as UserFormPayload['role'])}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
              <Field label="No. Telepon">
                <input className="input-field" value={form.phone ?? ''} onChange={e => setField('phone', e.target.value)} placeholder="628xxxxxxxx" />
              </Field>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-amber-500" />
                <h2 className="font-bold text-slate-800 text-sm">Reset Password</h2>
              </div>
              <button onClick={() => setResetTarget(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-500">Reset password untuk <span className="font-semibold text-slate-700">{resetTarget.name}</span></p>
              {resetError && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{resetError}</div>}
              <Field label="Password Baru*">
                <div className="relative">
                  <input
                    type={showResetPw ? 'text' : 'password'}
                    className="input-field pr-9"
                    value={resetPw}
                    onChange={e => setResetPw(e.target.value)}
                    placeholder="Min. 6 karakter"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowResetPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showResetPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setResetTarget(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">Batal</button>
              <button onClick={handleReset} disabled={resetting} className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-60 transition">
                {resetting ? 'Mereset...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Hapus Pengguna?</h3>
            <p className="text-sm text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{deleteTarget.name}</span> akan dihapus permanen.
            </p>
            <p className="text-xs text-slate-400 mb-5">Data booking dan villa terkait mungkin ikut terpengaruh.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input-field {
          width: 100%; padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0; border-radius: 0.625rem;
          font-size: 0.875rem; outline: none; transition: border-color 0.15s;
          background: white;
        }
        .input-field:focus { border-color: #9333ea; box-shadow: 0 0 0 2px rgba(147,51,234,0.1); }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
