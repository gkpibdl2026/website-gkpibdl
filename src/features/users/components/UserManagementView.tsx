'use client'

import { useState, useMemo } from 'react'
import { useUsers } from '../hooks/useUsers'
import { useAuth } from '@/features/auth'
import type { User, UserRole, CreateUserPayload } from '../types'

interface EditModalState {
  isOpen: boolean
  user: User | null
  firstName: string
  lastName: string
  whatsapp: string
  lingkungan: string
  alamat: string
  password: string
  confirmPassword: string
}

interface CreateModalState {
  isOpen: boolean
  email: string
  password: string
  firstName: string
  lastName: string
  whatsapp: string
  lingkungan: string
  alamat: string
  role: UserRole
  approved: boolean
}

type SortKey = 'name' | 'email' | 'role' | 'approved' | 'lingkungan' | 'created_at'

export function UserManagementView() {
  const { userRole } = useAuth()
  const { users, loading, error, updating, fetchUsers, updateUser, deleteUser, createUser } = useUsers()
  
  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Edit Modal State
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    user: null,
    firstName: '',
    lastName: '',
    whatsapp: '',
    lingkungan: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  })

  // Create Modal State
  const [createModal, setCreateModal] = useState<CreateModalState>({
    isOpen: false,
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    whatsapp: '',
    lingkungan: '',
    alamat: '',
    role: 'jemaat',
    approved: true
  })

  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter and Sort Logic
  const processedUsers = useMemo(() => {
    let result = [...users]

    // 1. Search (First Name, Last Name, Email)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      result = result.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''} ${user.name || ''} ${user.google_name || ''}`.toLowerCase()
        const email = (user.email || '').toLowerCase()
        return fullName.includes(lowerTerm) || email.includes(lowerTerm)
      })
    }

    // 2. Sort
    result.sort((a, b) => {
      let aValue: any = ''
      let bValue: any = ''

      switch (sortKey) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''} ${a.name || ''}`.trim()
          bValue = `${b.first_name || ''} ${b.last_name || ''} ${b.name || ''}`.trim()
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'approved':
          aValue = a.approved ? 1 : 0
          bValue = b.approved ? 1 : 0
          break
        case 'lingkungan':
          aValue = a.lingkungan || 0
          bValue = b.lingkungan || 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [users, searchTerm, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="ml-1 text-gray-300">↕</span>
    return (
      <span className="ml-1 text-blue-600">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  // ... (Keep existing Edit Modal logic)
  const openEditModal = (user: User) => {
    setEditModal({
      isOpen: true,
      user,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      whatsapp: user.whatsapp || '',
      lingkungan: user.lingkungan?.toString() || '',
      alamat: user.alamat || '',
      password: '',
      confirmPassword: ''
    })
    setSaveError(null)
  }

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      user: null,
      firstName: '',
      lastName: '',
      whatsapp: '',
      lingkungan: '',
      alamat: '',
      password: '',
      confirmPassword: ''
    })
    setSaveError(null)
  }

  const handleSaveProfile = async () => {
    if (!editModal.user) return

    if (editModal.password && editModal.password !== editModal.confirmPassword) {
      setSaveError('Password tidak cocok')
      return
    }

    if (editModal.password && editModal.password.length < 6) {
      setSaveError('Password minimal 6 karakter')
      return
    }

    const lingkunganValue = editModal.lingkungan ? parseInt(editModal.lingkungan) : undefined
    if (editModal.lingkungan && isNaN(lingkunganValue!)) {
      setSaveError('Lingkungan harus berupa angka')
      return
    }

    const success = await updateUser(editModal.user.id, {
      first_name: editModal.firstName || undefined,
      last_name: editModal.lastName || undefined,
      whatsapp: editModal.whatsapp || undefined,
      lingkungan: lingkunganValue,
      alamat: editModal.alamat || undefined,
      password: editModal.password || undefined
    })

    if (success) {
      closeEditModal()
    } else {
      setSaveError('Gagal menyimpan perubahan')
    }
  }

  // Create Modal Logic
  const openCreateModal = () => {
    setCreateModal({
      isOpen: true,
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      whatsapp: '',
      lingkungan: '',
      alamat: '',
      role: 'jemaat',
      approved: true
    })
    setSaveError(null)
  }

  const closeCreateModal = () => {
    setCreateModal(prev => ({ ...prev, isOpen: false }))
    setSaveError(null)
  }

  const handleCreateUser = async () => {
    setSaveError(null)
    if (!createModal.email || !createModal.password) {
      setSaveError('Email dan Password wajib diisi')
      return
    }

    if (createModal.password.length < 6) {
      setSaveError('Password minimal 6 karakter')
      return
    }

    const lingkunganValue = createModal.lingkungan ? parseInt(createModal.lingkungan) : undefined
    if (createModal.lingkungan && isNaN(lingkunganValue!)) {
      setSaveError('Lingkungan harus berupa angka')
      return
    }

    setIsSubmitting(true)

    const payload: CreateUserPayload = {
      email: createModal.email,
      password: createModal.password,
      first_name: createModal.firstName,
      last_name: createModal.lastName,
      whatsapp: createModal.whatsapp,
      lingkungan: lingkunganValue,
      alamat: createModal.alamat,
      role: createModal.role,
      approved: createModal.approved
    }

    const success = await createUser(payload)
    setIsSubmitting(false)

    if (success) {
      closeCreateModal()
    } else {
      // Error is set within createUser hook
    }
  }

  // ... (Keep existing Helper functions: getRoleBadgeColor, getApprovalBadge, handleDelete)
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'jemaat': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getApprovalBadge = (approved: boolean) => {
    if (approved) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Approved
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
        Pending
      </span>
    )
  }

  const handleDelete = (userId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      deleteUser(userId)
    }
  }

  // Check admin access
  if (userRole !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Akses ditolak. Hanya admin yang dapat mengakses halaman ini.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error && !editModal.isOpen && !createModal.isOpen) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={fetchUsers} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Coba Lagi</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tambah User Baru</h2>
                <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {saveError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {saveError}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Login Credentials */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={createModal.email}
                    onChange={(e) => setCreateModal(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={createModal.password}
                    onChange={(e) => setCreateModal(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              {/* Profile */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input type="text" value={createModal.firstName} onChange={(e) => setCreateModal(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" placeholder="Nama Depan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input type="text" value={createModal.lastName} onChange={(e) => setCreateModal(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" placeholder="Nama Belakang" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                <input type="tel" value={createModal.whatsapp} onChange={(e) => setCreateModal(prev => ({ ...prev, whatsapp: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" placeholder="08123456789" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lingkungan</label>
                <input type="number" value={createModal.lingkungan} onChange={(e) => setCreateModal(prev => ({ ...prev, lingkungan: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" placeholder="Contoh: 1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                <textarea value={createModal.alamat} onChange={(e) => setCreateModal(prev => ({ ...prev, alamat: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none" rows={2} placeholder="Alamat lengkap" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select value={createModal.role} onChange={(e) => setCreateModal(prev => ({ ...prev, role: e.target.value as UserRole }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <option value="jemaat">Jemaat</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={createModal.approved ? "true" : "false"} onChange={(e) => setCreateModal(prev => ({ ...prev, approved: e.target.value === 'true' }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <option value="true">Approved</option>
                    <option value="false">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={closeCreateModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Batal</button>
              <button onClick={handleCreateUser} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Membuat...
                  </>
                ) : 'Buat User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Keep existing) */}
      {editModal.isOpen && editModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profil User</h2>
                <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{editModal.user.email}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {saveError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {saveError}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input type="text" value={editModal.firstName} onChange={(e) => setEditModal(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Nama depan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input type="text" value={editModal.lastName} onChange={(e) => setEditModal(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Nama belakang" />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor WhatsApp</label>
                <input type="tel" value={editModal.whatsapp} onChange={(e) => setEditModal(prev => ({ ...prev, whatsapp: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="08123456789 atau +628123456789" />
              </div>

              {/* Lingkungan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lingkungan / WIYK</label>
                <input type="number" value={editModal.lingkungan} onChange={(e) => setEditModal(prev => ({ ...prev, lingkungan: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Contoh: 1" min="1" />
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                <textarea value={editModal.alamat} onChange={(e) => setEditModal(prev => ({ ...prev, alamat: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" placeholder="Alamat lengkap" rows={3} />
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Set Password (Opsional)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Dengan menambahkan password, user dapat login tanpa Google.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
                    <input type="password" value={editModal.password} onChange={(e) => setEditModal(prev => ({ ...prev, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Min. 6 karakter" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password</label>
                    <input type="password" value={editModal.confirmPassword} onChange={(e) => setEditModal(prev => ({ ...prev, confirmPassword: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ulangi password" />
                  </div>
                </div>
                {editModal.user.has_password && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ User ini sudah memiliki password lokal</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={closeEditModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Batal</button>
              <button onClick={handleSaveProfile} disabled={updating === editModal.user.id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {updating === editModal.user.id ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola pengguna dan hak akses admin panel</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah User
          </button>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards (Keep existing) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => !u.approved).length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari user (nama atau email)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center">User <SortIcon column="name" /></div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                   <div className="flex items-center">Role <SortIcon column="role" /></div>
                </th>
                <th
                  onClick={() => handleSort('approved')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                   <div className="flex items-center">Status <SortIcon column="approved" /></div>
                </th>
                <th
                  onClick={() => handleSort('lingkungan')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                   <div className="flex items-center">Info <SortIcon column="lingkungan" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {processedUsers.map((user) => (
                <tr key={user.id} className={`${updating === user.id ? 'opacity-50' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white font-medium text-sm">
                          {(user.first_name || user.google_name || user.name || user.email)?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.google_name || user.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(user.id, { role: e.target.value as UserRole })}
                      disabled={updating === user.id}
                      className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${getRoleBadgeColor(user.role)}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="jemaat">Jemaat</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    {getApprovalBadge(user.approved)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      {user.whatsapp && <p>📱 {user.whatsapp}</p>}
                      {user.lingkungan && <p>🏘️ Lingkungan {user.lingkungan}</p>}
                      {user.has_password && <p>🔑 Password set</p>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        disabled={updating === user.id}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                      >
                        Edit
                      </button>
                      {!user.approved && (
                        <button
                          onClick={() => updateUser(user.id, { approved: true })}
                          disabled={updating === user.id}
                          className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {user.approved && (
                        <button
                          onClick={() => updateUser(user.id, { approved: false })}
                          disabled={updating === user.id}
                          className="px-3 py-1.5 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={updating === user.id}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {processedUsers.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Tidak ada user yang cocok dengan pencarian' : 'Belum ada user terdaftar'}
            </p>
          </div>
        )}
      </div>

      {/* Role Info (Keep existing) */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Informasi Role</h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li><span className="font-medium">Admin:</span> Akses penuh ke semua fitur admin panel</li>
          <li><span className="font-medium">Editor:</span> Saat ini belum memiliki akses (akan dikembangkan)</li>
          <li><span className="font-medium">Jemaat:</span> Tidak dapat mengakses admin panel</li>
        </ul>
      </div>
    </div>
  )
}
