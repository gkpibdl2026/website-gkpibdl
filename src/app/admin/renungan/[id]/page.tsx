'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotification } from '@/features/common';

export default function EditRenungan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    ayat_kunci: '',
    referensi: '',
    isi_renungan: '',
    kutipan: '',
    lagu: '',
    doa: '',
    visible: true,
  });

  useEffect(() => {
    const loadRenungan = async () => {
      try {
        const res = await fetch(`/api/renungan/${id}`);
        const { data } = await res.json();

        if (data) {
          setFormData({
            title: data.title || '',
            date: data.date || '',
            ayat_kunci: data.ayat_kunci || '',
            referensi: data.referensi || '',
            isi_renungan: data.isi_renungan || '',
            kutipan: data.kutipan || '',
            lagu: data.lagu || '',
            doa: data.doa || '',
            visible: data.visible ?? true,
          });
        }
      } catch (error) {
        console.error('Error fetching renungan:', error);
        showToast('Gagal memuat data renungan', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadRenungan();
  }, [id, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/renungan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('Renungan berhasil diperbarui', 'success');
        router.push('/admin/renungan');
      } else {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update');
      }
    } catch (error) {
      console.error('Error updating renungan:', error);
      showToast('Gagal memperbarui renungan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="bg-(--bg-secondary) rounded-xl p-6 space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/renungan"
          className="inline-flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <h1 className="text-2xl font-bold text-(--text-primary)">Edit Renungan</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Perbarui data renungan harian
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-(--bg-secondary) rounded-xl p-6 border border-(--border) space-y-6">
          {/* Title & Date */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-2">
                Judul Renungan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Contoh: Bermegah Dalam Kelemahan"
                className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Ayat Kunci & Referensi */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-2">
                Ayat Kunci <span className="text-red-500">*</span>
              </label>
              <textarea
                name="ayat_kunci"
                value={formData.ayat_kunci}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Tuliskan ayat kunci renungan..."
                className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-2">
                Referensi Ayat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="referensi"
                value={formData.referensi}
                onChange={handleChange}
                required
                placeholder="Contoh: 2 Korintus 12:9"
                className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Isi Renungan */}
          <div>
            <label className="block text-sm font-medium text-(--text-primary) mb-2">
              Isi Renungan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="isi_renungan"
              value={formData.isi_renungan}
              onChange={handleChange}
              required
              rows={10}
              placeholder="Tuliskan isi renungan..."
              className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Kutipan */}
          <div>
            <label className="block text-sm font-medium text-(--text-primary) mb-2">
              Kutipan Renungan <span className="text-(--text-muted)">(Opsional)</span>
            </label>
            <textarea
              name="kutipan"
              value={formData.kutipan}
              onChange={handleChange}
              rows={3}
              placeholder="Ringkasan atau kutipan penting dari renungan..."
              className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Lagu & Doa */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-2">
                Lagu <span className="text-(--text-muted)">(Opsional)</span>
              </label>
              <input
                type="text"
                name="lagu"
                value={formData.lagu}
                onChange={handleChange}
                placeholder='Contoh: KJ. 332 "Kekuatan Serta Penghiburan"'
                className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--text-primary) mb-2">
                Doa <span className="text-(--text-muted)">(Opsional)</span>
              </label>
              <textarea
                name="doa"
                value={formData.doa}
                onChange={handleChange}
                rows={3}
                placeholder="Tuliskan doa penutup..."
                className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--bg-primary) text-(--text-primary) focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Visible Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="visible"
              id="visible"
              checked={formData.visible}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="visible" className="text-sm text-(--text-primary)">
              Tampilkan renungan ini
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/renungan"
            className="px-6 py-3 rounded-lg border border-(--border) text-(--text-secondary) hover:bg-(--bg-secondary) transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
