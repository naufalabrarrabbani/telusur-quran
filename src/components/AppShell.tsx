'use client'

import { useState } from 'react'
import { TabBar, type TabId } from '@/components/ui/TabBar'
import { BerandaScreen } from '@/components/screens/BerandaScreen'
import { WawasanScreen } from '@/components/screens/WawasanScreen'
import { HasilCariScreen } from '@/components/screens/HasilCariScreen'
import { CekKlaimScreen } from '@/components/screens/CekKlaimScreen'
import { GrafScreen } from '@/components/screens/GrafScreen'

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('beranda')
  const [searchQuery, setSearchQuery] = useState<string>('setan')

  const handleNavigate = (screen: string) => {
    setActiveTab(screen as TabId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setActiveTab('hasil-cari')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative max-w-[430px] mx-auto min-h-dvh bg-paper border-x border-line-soft overflow-hidden">
      <main className="relative p-5 pb-[calc(64px+28px)]">
        <div className={activeTab === 'beranda' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <BerandaScreen onNavigate={handleNavigate} onSearch={handleSearch} />
        </div>
        <div className={activeTab === 'wawasan' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <WawasanScreen onNavigate={handleNavigate} />
        </div>
        <div className={activeTab === 'hasil-cari' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <HasilCariScreen onNavigate={handleNavigate} searchQuery={searchQuery} onSearch={handleSearch} />
        </div>
        <div className={activeTab === 'cek-klaim' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <CekKlaimScreen onNavigate={handleNavigate} onSearch={handleSearch} />
        </div>
        <div className={activeTab === 'graf' ? 'block animate-[enter_0.25s_ease_both]' : 'hidden'}>
          <GrafScreen />
        </div>
      </main>
      <TabBar activeTab={activeTab} onTabChange={handleNavigate} />
    </div>
  )
}
