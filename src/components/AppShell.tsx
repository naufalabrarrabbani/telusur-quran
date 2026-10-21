'use client'

import { useState, useEffect, useCallback } from 'react'
import { TabBar, type TabId } from '@/components/ui/TabBar'
import { BerandaScreen } from '@/components/screens/BerandaScreen'
import { WawasanScreen } from '@/components/screens/WawasanScreen'
import { HasilCariScreen } from '@/components/screens/HasilCariScreen'
import { CekKlaimScreen } from '@/components/screens/CekKlaimScreen'
import { GrafScreen } from '@/components/screens/GrafScreen'
import { BacaListScreen } from '@/components/screens/BacaListScreen'
import { BacaReadScreen } from '@/components/screens/BacaReadScreen'

type ScreenId = TabId | 'baca-read'

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('beranda')
  const [activeScreen, setActiveScreen] = useState<ScreenId>('beranda')
  const [searchQuery, setSearchQuery] = useState<string>('setan')
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null)

  const handleNavigate = (screen: string) => {
    const tabId = screen as TabId
    setActiveTab(tabId)
    setActiveScreen(tabId)
    if (tabId !== 'baca') {
      setSelectedSurah(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setActiveTab('hasil-cari' as TabId)
    setActiveScreen('hasil-cari')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectSurah = useCallback((surahNo: number) => {
    setSelectedSurah(surahNo)
    setActiveScreen('baca-read')
    setActiveTab('baca')
    window.scrollTo({ top: 0 })
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedSurah(null)
    setActiveScreen('baca')
    setActiveTab('baca')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <BerandaScreen onNavigate={handleNavigate} onSearch={handleSearch} />
        </div>
        <div className={activeScreen === 'wawasan' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <WawasanScreen onNavigate={handleNavigate} />
        </div>
        <div className={activeScreen === 'hasil-cari' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <HasilCariScreen onNavigate={handleNavigate} searchQuery={searchQuery} onSearch={handleSearch} />
        </div>
        <div className={activeScreen === 'cek-klaim' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <CekKlaimScreen onNavigate={handleNavigate} onSearch={handleSearch} />
        </div>
        <div className={activeScreen === 'graf' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <GrafScreen />
        </div>
        <div className={activeScreen === 'baca' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <BacaListScreen onNavigate={handleNavigate} onSelectSurah={handleSelectSurah} />
        </div>
        {activeScreen === 'baca-read' && selectedSurah && (
          <div className="block animate-[enter_0.25s_ease_both]">
            <BacaReadScreen surahNo={selectedSurah} onBack={handleBackToList} />
          </div>
        )}
      </main>
      <TabBar activeTab={effectiveTab} onTabChange={handleNavigate} />
    </div>
  )
}
