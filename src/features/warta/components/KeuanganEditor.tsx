'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface KeuanganItem {
  id: string
  label: string
  amount: number
}

interface KeuanganData {
  period?: string
  pemasukan?: number
  pengeluaran?: number
  saldo?: number
  items?: KeuanganItem[]
}

interface Props {
  data: KeuanganData
  onUpdate: (data: KeuanganData) => void
}

function formatCurrencyPreview(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export default function KeuanganEditor({ data, onUpdate }: Props) {
  const [period, setPeriod] = useState(data?.period || '')
  const [pemasukan, setPemasukan] = useState(data?.pemasukan?.toString() || '')
  const [pengeluaran, setPengeluaran] = useState(data?.pengeluaran?.toString() || '')
  const [saldo, setSaldo] = useState(data?.saldo?.toString() || '')

  const items = data?.items || []

  const updateField = (field: string, value: string) => {
    const numFields = ['pemasukan', 'pengeluaran', 'saldo']
    const newData = { ...data }

    if (field === 'period') {
      setPeriod(value)
      newData.period = value
    } else if (numFields.includes(field)) {
      const numValue = value === '' ? 0 : parseInt(value, 10)
      const safeValue = isNaN(numValue) ? 0 : numValue

      if (field === 'pemasukan') {
        setPemasukan(value)
        newData.pemasukan = safeValue
      } else if (field === 'pengeluaran') {
        setPengeluaran(value)
        newData.pengeluaran = safeValue
      } else if (field === 'saldo') {
        setSaldo(value)
        newData.saldo = safeValue
      }
    }

    onUpdate(newData)
  }

  const autoCalculateSaldo = () => {
    const p = parseInt(pemasukan, 10) || 0
    const k = parseInt(pengeluaran, 10) || 0
    const calculatedSaldo = p - k
    setSaldo(calculatedSaldo.toString())
    onUpdate({ ...data, period, pemasukan: p, pengeluaran: k, saldo: calculatedSaldo })
  }

  // Item management
  const addItem = () => {
    const newItem: KeuanganItem = {
      id: `keu-${crypto.randomUUID()}`,
      label: '',
      amount: 0
    }
    onUpdate({ ...data, period, pemasukan: parseInt(pemasukan) || 0, pengeluaran: parseInt(pengeluaran) || 0, saldo: parseInt(saldo) || 0, items: [...items, newItem] })
  }

  const removeItem = (id: string) => {
    onUpdate({ ...data, items: items.filter(i => i.id !== id) })
  }

  const updateItem = (id: string, field: 'label' | 'amount', value: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        if (field === 'amount') {
          const numValue = value === '' ? 0 : parseInt(value, 10)
          return { ...item, amount: isNaN(numValue) ? 0 : numValue }
        }
        return { ...item, [field]: value }
      }
      return item
    })
    onUpdate({ ...data, items: updatedItems })
  }

  const totalItems = items.reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <div className="space-y-4">
      {/* Period Input */}
      <div>
        <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
          Periode:
        </label>
        <input
          type="text"
          value={period}
          onChange={(e) => updateField('period', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Contoh: Minggu, 9 Februari 2026"
        />
      </div>

      {/* Summary Fields */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
            Pemasukan (Rp):
          </label>
          <input
            type="number"
            value={pemasukan}
            onChange={(e) => updateField('pemasukan', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
          {pemasukan && parseInt(pemasukan) > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {formatCurrencyPreview(parseInt(pemasukan))}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
            Pengeluaran (Rp):
          </label>
          <input
            type="number"
            value={pengeluaran}
            onChange={(e) => updateField('pengeluaran', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="0"
          />
          {pengeluaran && parseInt(pengeluaran) > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {formatCurrencyPreview(parseInt(pengeluaran))}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
            Saldo (Rp):
          </label>
          <div className="flex gap-1">
            <input
              type="number"
              value={saldo}
              onChange={(e) => updateField('saldo', e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 text-sm font-semibold bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
            />
            <button
              type="button"
              onClick={autoCalculateSaldo}
              className="px-2 py-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors border border-green-300 dark:border-green-600"
              title="Hitung otomatis: Pemasukan - Pengeluaran"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          {saldo && parseInt(saldo) !== 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
              {formatCurrencyPreview(parseInt(saldo))}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-green-200 dark:border-green-700 pt-3">
        <h5 className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-2">
          Rincian Item (Opsional)
        </h5>
      </div>

      {/* Item Rows */}
      {items.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          Belum ada rincian. Klik tombol di bawah untuk menambah item.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column Headers */}
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            <div className="flex-1">Keterangan</div>
            <div className="w-32 text-right">Jumlah (Rp)</div>
            <div className="w-8"></div>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                className="flex-1 min-w-0 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Contoh: Persembahan, Kolekte, dll."
              />
              <input
                type="number"
                value={item.amount || ''}
                onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                className="w-32 px-2 py-1 text-sm text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Hapus item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Total Row */}
          <div className="flex items-center gap-2 p-2 bg-green-100 dark:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-700 font-semibold">
            <div className="flex-1 text-green-800 dark:text-green-200">TOTAL</div>
            <div className="w-32 text-right text-green-900 dark:text-green-100">
              {formatCurrencyPreview(totalItems)}
            </div>
            <div className="w-8"></div>
          </div>
        </div>
      )}

      {/* Add Item Button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Item Rincian
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        💡 Tip: Klik tombol kalkulator di samping saldo untuk menghitung otomatis (Pemasukan − Pengeluaran). Rincian item bersifat opsional untuk detail tambahan.
      </p>
    </div>
  )
}
