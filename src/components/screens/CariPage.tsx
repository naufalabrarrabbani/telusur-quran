'use client'

import { useEffect, useState } from 'react'
import { HasilCariScreen } from '@/components/screens/HasilCariScreen'
import { InstallBanner } from '@/components/ui/InstallBanner'

// Halaman mandiri hasil pencarian (/cari?q=...) — sejak 22 Okt 2026 hasil
// cari bukan tab lagi (slot tab-nya digantikan tab Baca). Query dibaca dari
// URL agar hasil bisa dibagikan / dibuka langsung.
export function CariPage() {
  const [query, setQuery] = useState('setan')

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    if (q && q.trim()) setQuery(q)
  }, [])

  const goHome = () => {
    window.location.href = '/'
  }

  const handleSearch = (q: string) => {
    setQuery(q)
    window.history.replaceState(null, '', `/cari?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="relative max-w-[430px] mx-auto min-h-dvh bg-paper border-x border-line-soft overflow-hidden">
      <main className="relative p-5 pb-12">
        <HasilCariScreen onNavigate={goHome} searchQuery={query} onSearch={handleSearch} />
        <footer className="mt-[26px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
          Telusur Qur&apos;an — angka selalu ditampilkan bersama mode hitungnya. Teks ayat dari dataset Tanzil via AlQuran Cloud; terjemahan Kemenag RI.
        </footer>
      </main>
      <InstallBanner withTabBar={false} />
    </div>
  )
}
