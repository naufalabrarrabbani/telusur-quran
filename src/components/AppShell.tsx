'use client'

import { useState, useEffect, useCallback } from 'react'
import { TabBar, type TabId } from '@/components/ui/TabBar'
import { BerandaScreen } from '@/components/screens/BerandaScreen'
import { WawasanScreen } from '@/components/screens/WawasanScreen'
import { CekKlaimScreen } from '@/components/screens/CekKlaimScreen'
import { GrafScreen } from '@/components/screens/GrafScreen'
import { MetodologiScreen } from '@/components/screens/MetodologiScreen'
import { BacaListScreen } from '@/components/screens/BacaListScreen'
import { InstallBanner } from '@/components/ui/InstallBanner'
import { BacaReadScreen } from '@/components/screens/BacaReadScreen'
import { AlKahfSeriesScreen } from '@/components/screens/AlKahfSeriesScreen'

type ScreenId = TabId | 'baca-read' | 'al-kahf'

// URL mengikuti layar: /alkahf-series saat layar seri tampil, / untuk layar
// lain. pushState dipakai supaya shell tidak me-remount (state app tetap
// utuh); tombol back/forward browser ditangani lewat popstate di AppShell.
function syncUrlForScreen(screen: ScreenId) {
  const target = screen === 'al-kahf' ? '/alkahf-series' : '/'
  if (window.location.pathname !== target) {
    window.history.pushState({ screen }, '', target)
  }
}

export function AppShell({ initialScreen = 'beranda' }: { initialScreen?: ScreenId }) {
  const [activeTab, setActiveTab] = useState<TabId>('beranda')
  const [activeScreen, setActiveScreen] = useState<ScreenId>(initialScreen)
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null)
  const [targetAyat, setTargetAyat] = useState<number | null>(null)
  const [focusCardId, setFocusCardId] = useState<number | null>(null)

  const handleNavigate = (screen: string) => {
    if (screen === 'al-kahf') {
      setActiveScreen('al-kahf')
      syncUrlForScreen('al-kahf')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const tabId = screen as TabId
    setActiveTab(tabId)
    setActiveScreen(tabId)
    syncUrlForScreen(tabId)
    if (tabId !== 'baca') {
      setSelectedSurah(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Hasil pencarian = halaman mandiri (/cari?q=...), bukan layar tab.
  const handleSearch = (query: string) => {
    window.location.href = `/cari?q=${encodeURIComponent(query)}`
  }

  // Pintu Emosi di Beranda: pin kartu Wawasan tertentu sebagai featured.
  const handleEmotion = (cardId: number) => {
    setFocusCardId(cardId)
    handleNavigate('wawasan')
  }

  const handleSelectSurah = useCallback((surahNo: number, ayat?: number) => {
    setSelectedSurah(surahNo)
    setTargetAyat(ayat ?? null)
    setActiveScreen('baca-read')
    setActiveTab('baca')
    syncUrlForScreen('baca-read')
    window.scrollTo({ top: 0 })
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedSurah(null)
    setActiveScreen('baca')
    setActiveTab('baca')
    syncUrlForScreen('baca')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Tombol back/forward browser: layar mengikuti URL.
  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === '/alkahf-series') {
        setActiveScreen('al-kahf')
      } else {
        setSelectedSurah(null)
        setActiveScreen('beranda')
      }
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Listen for surah navigation events from BacaReadScreen
  useEffect(() => {
    const handler = (e: Event) => {
      const surahNo = (e as CustomEvent).detail as number
      handleSelectSurah(surahNo)
    }
    window.addEventListener('navigate-surah', handler)
    return () => window.removeEventListener('navigate-surah', handler)
  }, [handleSelectSurah])

  // Determine effective tab for TabBar highlight
  const effectiveTab: TabId = activeScreen === 'baca-read' ? 'baca' : activeTab

  return (
    <div className="relative max-w-[430px] mx-auto min-h-dvh bg-paper border-x border-line-soft overflow-hidden">
      <main className="relative p-5 pb-[calc(64px+28px)]">
        <div className={activeScreen === 'beranda' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <BerandaScreen onNavigate={handleNavigate} onSearch={handleSearch} onEmotion={handleEmotion} />
        </div>
        <div className={activeScreen === 'wawasan' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <WawasanScreen onNavigate={handleNavigate} onSearch={handleSearch} focusCardId={focusCardId} />
        </div>
        <div className={activeScreen === 'cek-klaim' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <CekKlaimScreen onNavigate={handleNavigate} onSearch={handleSearch} />
        </div>
        <div className={activeScreen === 'graf' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <GrafScreen onSearch={handleSearch} />
        </div>
        <div className={activeScreen === 'metodologi' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <MetodologiScreen onNavigate={handleNavigate} />
        </div>
        <div className={activeScreen === 'al-kahf' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <AlKahfSeriesScreen onBack={() => handleNavigate('beranda')} onReadAyat={handleSelectSurah} />
        </div>
        <div className={activeScreen === 'baca' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <BacaListScreen onNavigate={handleNavigate} onSelectSurah={handleSelectSurah} />
        </div>
        {activeScreen === 'baca-read' && selectedSurah && (
          <div className="block animate-[enter_0.25s_ease_both]">
            <BacaReadScreen surahNo={selectedSurah} initialAyat={targetAyat} onBack={handleBackToList} />
          </div>
        )}
      </main>
      <TabBar
        activeTab={effectiveTab}
        onTabChange={(tab) => {
          setFocusCardId(null)
          handleNavigate(tab)
        }}
      />
      <InstallBanner />
    </div>
  )
}
