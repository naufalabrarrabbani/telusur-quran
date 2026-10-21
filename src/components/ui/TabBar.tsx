'use client'

export type TabId = 'beranda' | 'wawasan' | 'baca' | 'cek-klaim' | 'graf' | 'metodologi'

interface TabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    id: 'wawasan',
    label: 'Wawasan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.3 18 9.2 18 8a6 6 0 0 0-12 0c0 1.2.3 2.3 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    id: 'baca',
    label: 'Baca',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: 'cek-klaim',
    label: 'Cek Klaim',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4z" />
        <path d="M19 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
      </svg>
    ),
  },
  {
    id: 'graf',
    label: 'Graf',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-[22px] h-[22px]">
        <circle cx={5} cy={12} r={2.4} />
        <circle cx={19} cy={5.5} r={2.4} />
        <circle cx={19} cy={18.5} r={2.4} />
        <path d="M7.2 10.8l9.4-4M7.2 13.2l9.4 4" />
      </svg>
    ),
  },
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[calc(64px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-paper/94 backdrop-blur-[12px] border-t border-line grid grid-cols-5 z-10"
      aria-label="Navigasi utama"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`bg-none border-none cursor-pointer flex flex-col items-center justify-center gap-[3px] text-[10px] font-bold pt-[6px] transition-colors duration-[120ms] ${
            activeTab === tab.id ? 'text-emerald' : 'text-ink-4'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
