'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'

// Helper function to ensure image URL is valid (same as galeri, struktur, album)
const getImageUrl = (url: string | null): string => {
  if (!url) return ''
  
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url
  }
  
  if (url.startsWith('/api/images/')) {
    return url
  }
  
  const cleanPath = url.startsWith('/') ? url.slice(1) : url
  return `/api/images/${cleanPath}`
}

interface BankAccount {
  bank_name: string
  account_number: string
  account_holder: string
  color: string
}

interface PaymentSettings {
  qris_image_url: string | null
  bank_accounts: BankAccount[]
}

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Biru', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  { value: 'yellow', label: 'Kuning', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { value: 'green', label: 'Hijau', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  { value: 'red', label: 'Merah', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  { value: 'purple', label: 'Ungu', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
]

export default function PembayaranAdminPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingQris, setUploadingQris] = useState(false)
  
  const [settings, setSettings] = useState<PaymentSettings>({
    qris_image_url: null,
    bank_accounts: []
  })

  const [showBankForm, setShowBankForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [bankForm, setBankForm] = useState<BankAccount>({
    bank_name: '',
    account_number: '',
    account_holder: '',
    color: 'blue'
  })

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, title, message, onConfirm })
  }

  const closeConfirmation = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: () => {} })
  }

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/payment-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          qris_image_url: data.qris_image_url || null,
          bank_accounts: data.bank_accounts || []
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const saveSettings = async (newSettings: PaymentSettings) => {
    setSaving(true)
    try {
      const res = await fetch('/api/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (!res.ok) throw new Error('Failed to save')

      setSettings(newSettings)
      showToast('success', 'Pengaturan berhasil disimpan!')
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast('error', 'Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Harap pilih file gambar')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran file maksimal 5MB')
      return
    }

    setUploadingQris(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'pembayaran')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      const newSettings = { ...settings, qris_image_url: data.url }
      await saveSettings(newSettings)
    } catch (error) {
      console.error('Error uploading QRIS:', error)
      showToast('error', 'Gagal mengupload gambar QRIS')
    } finally {
      setUploadingQris(false)
    }
  }

  const removeQris = () => {
    showConfirmation(
      'Hapus QRIS',
      'Apakah Anda yakin ingin menghapus gambar QRIS?',
      async () => {
        const newSettings = { ...settings, qris_image_url: null }
        await saveSettings(newSettings)
        closeConfirmation()
      }
    )
  }

  const openBankForm = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index)
      setBankForm({ ...settings.bank_accounts[index] })
    } else {
      setEditingIndex(null)
      setBankForm({ bank_name: '', account_number: '', account_holder: '', color: 'blue' })
    }
    setShowBankForm(true)
  }

  const saveBankAccount = async () => {
    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder) {
      showToast('error', 'Semua field wajib diisi')
      return
    }

    const newAccounts = [...settings.bank_accounts]
    if (editingIndex !== null) {
      newAccounts[editingIndex] = bankForm
    } else {
      newAccounts.push(bankForm)
    }

    await saveSettings({ ...settings, bank_accounts: newAccounts })
    setShowBankForm(false)
  }

  const deleteBankAccount = (index: number) => {
    const account = settings.bank_accounts[index]
    showConfirmation(
      'Hapus Rekening',
      `Apakah Anda yakin ingin menghapus rekening ${account.bank_name}?`,
      async () => {
        const newAccounts = settings.bank_accounts.filter((_, i) => i !== index)
        await saveSettings({ ...settings, bank_accounts: newAccounts })
        closeConfirmation()
      }
    )
  }

  const getColorClasses = (color: string) => {
    return COLOR_OPTIONS.find(c => c.value === color) || COLOR_OPTIONS[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Pembayaran</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola QRIS dan rekening bank untuk persembahan</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* QRIS Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">QRIS</h2>
          
          <div className="space-y-4">
            {settings.qris_image_url ? (
              <div className="relative">
                <div className="w-full max-w-62.5 mx-auto rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white">
                  <Image
                    src={getImageUrl(settings.qris_image_url)}
                    alt="QRIS"
                    width={250}
                    height={250}
                    className="w-full h-auto object-contain"
                  />
                </div>
                <button
                  onClick={removeQris}
                  disabled={saving}
                  className="mt-3 w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Hapus QRIS
                </button>
              </div>
            ) : (
              <label className={`relative flex flex-col items-center justify-center w-full aspect-square max-w-62.5 mx-auto border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingQris ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrisUpload}
                  className="hidden"
                  disabled={uploadingQris}
                />
                {uploadingQris ? (
                  <>
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400 mt-2">Mengupload...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Klik untuk upload QRIS</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG max 5MB</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Bank Accounts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rekening Bank</h2>
            <button
              onClick={() => openBankForm()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Tambah
            </button>
          </div>

          <div className="space-y-3">
            {settings.bank_accounts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                Belum ada rekening bank
              </p>
            ) : (
              settings.bank_accounts.map((account, index) => {
                const colors = getColorClasses(account.color)
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900!">{account.bank_name}</p>
                        <p className="text-lg font-mono font-bold text-gray-900! mt-1">
                          {account.account_number}
                        </p>
                        <p className="text-sm text-gray-700!">
                          a.n. {account.account_holder}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openBankForm(index)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteBankAccount(index)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Bank Form Modal */}
      {showBankForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingIndex !== null ? 'Edit Rekening' : 'Tambah Rekening'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Bank
                </label>
                <input
                  type="text"
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Contoh: Bank BCA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Atas Nama
                </label>
                <input
                  type="text"
                  value={bankForm.account_holder}
                  onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="GKPI Bandar Lampung"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Warna Tema
                </label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBankForm({ ...bankForm, color: color.value })}
                      className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                        bankForm.color === color.value 
                          ? 'border-gray-800 dark:border-white ring-2 ring-offset-2 ring-gray-400' 
                          : 'border-transparent hover:border-gray-400'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBankForm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveBankAccount}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {confirmModal.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeConfirmation}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmModal.onConfirm}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
