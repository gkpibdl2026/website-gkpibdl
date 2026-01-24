'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface Keuangan {
  id: string;
  period: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  document_url: string | null;
}

interface BankAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
  color: string;
}

interface PaymentSettings {
  qris_image_url: string | null;
  bank_accounts: BankAccount[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// Helper function to ensure image URL is valid (same as admin pages)
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

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; textDark: string; button: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800', textDark: 'text-blue-900', button: 'hover:bg-blue-100 text-blue-600' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-800', textDark: 'text-yellow-900', button: 'hover:bg-yellow-100 text-yellow-600' },
  green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-800', textDark: 'text-green-900', button: 'hover:bg-green-100 text-green-600' },
  red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800', textDark: 'text-red-900', button: 'hover:bg-red-100 text-red-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-800', textDark: 'text-purple-900', button: 'hover:bg-purple-100 text-purple-600' },
}

export default function KeuanganPage() {
  const { showToast } = useToast()
  const [keuanganData, setKeuanganData] = useState<Keuangan[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    qris_image_url: null,
    bank_accounts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [keuanganRes, paymentRes] = await Promise.all([
        fetch('/api/keuangan'),
        fetch('/api/payment-settings')
      ]);

      if (keuanganRes.ok) {
        const { data } = await keuanganRes.json();
        setKeuanganData(data || []);
      }

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        setPaymentSettings({
          qris_image_url: paymentData.qris_image_url || null,
          bank_accounts: paymentData.bank_accounts || []
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPemasukan = keuanganData.reduce((sum, item) => sum + (item.pemasukan || 0), 0);
  const totalPengeluaran = keuanganData.reduce((sum, item) => sum + (item.pengeluaran || 0), 0);
  const latestSaldo = keuanganData.length > 0 ? keuanganData[0].saldo : 0;
  const latestPeriod = keuanganData.length > 0 ? keuanganData[0].period : '-';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Nomor rekening disalin!');
  };

  const getColors = (color: string) => COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <>
      {/* Header */}
      <section className="bg-linear-to-br from-blue-600 to-purple-700 text-white py-16 md:py-24">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Laporan Keuangan</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Transparansi keuangan gereja untuk pertanggungjawaban bersama jemaat.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Saldo Terakhir</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(latestSaldo)}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{latestPeriod}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Pemasukan</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPemasukan)}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Pengeluaran</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalPengeluaran)}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Keuangan List */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Rincian Per Bulan</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
            </div>
          ) : keuanganData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada laporan keuangan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {keuanganData.map((item) => (
                <div 
                  key={item.id}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.period}</h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="text-green-600 dark:text-green-400 text-sm">
                          ↑ Pemasukan: {formatCurrency(item.pemasukan || 0)}
                        </span>
                        <span className="text-red-600 dark:text-red-400 text-sm">
                          ↓ Pengeluaran: {formatCurrency(item.pengeluaran || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Saldo</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(item.saldo || 0)}</p>
                    </div>
                  </div>
                  {item.document_url && (
                    <a 
                      href={item.document_url} 
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 font-medium hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Laporan PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donation Section */}
      <section id="persembahan" className="py-16 md:py-24 bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold mb-4">
              Persembahan & Donasi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Berikan Persembahan Anda
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              &ldquo;Setiap orang hendaklah memberikan menurut kerelaan hatinya, jangan dengan sedih hati atau karena paksaan, sebab Allah mengasihi orang yang memberi dengan sukacita.&rdquo; — 2 Korintus 9:7
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* QRIS */}
            <div className="bg-white rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900! mb-4">Scan QRIS</h3>
              <div className="w-72 h-72 mx-auto bg-white rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                {paymentSettings.qris_image_url ? (
                  <Image
                    src={getImageUrl(paymentSettings.qris_image_url)}
                    alt="QRIS"
                    width={288}
                    height={288}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-gray-600! text-sm">QR Code QRIS</p>
                    <p className="text-gray-500! text-xs mt-1">Belum tersedia</p>
                  </div>
                )}
              </div>
              <p className="text-gray-700! text-sm">
                Scan dengan aplikasi e-wallet atau mobile banking Anda
              </p>
            </div>

            {/* Bank Account */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900! mb-6 text-center">Transfer Bank</h3>
              
              <div className="space-y-4">
                {paymentSettings.bank_accounts.length === 0 ? (
                  <p className="text-gray-600! text-center py-4">Belum ada rekening bank</p>
                ) : (
                  paymentSettings.bank_accounts.map((account, index) => {
                    const colors = getColors(account.color);
                    return (
                      <div key={index} className={`p-4 ${colors.bg} rounded-xl border ${colors.border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900!">{account.bank_name}</span>
                          <span className={`text-xs ${colors.bg} ${colors.text} px-2 py-1 rounded-full border ${colors.border}`}>Rekening Gereja</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-mono font-bold text-gray-900!">{account.account_number}</p>
                            <p className="text-sm text-gray-700!">a.n. {account.account_holder}</p>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(account.account_number)}
                            className="p-2 text-amber-700! hover:bg-amber-100 rounded-lg transition-colors"
                            title="Salin nomor rekening"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <p className="text-gray-700! text-sm text-center mt-6">
                Mohon konfirmasi setelah transfer ke bendahara gereja
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container max-w-4xl text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Laporan keuangan lengkap dapat diminta di sekretariat gereja atau hubungi bendahara.
          </p>
        </div>
      </section>
    </>
  );
}
