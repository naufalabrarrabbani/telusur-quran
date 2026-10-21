'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  getLastRead,
  getSavedAyat,
  getReadSurahs,
  getStreak,
  migrateLegacyBookmarks,
} from '@/lib/quran-storage'

interface SurahMeta {
  number: number
  name_arabic: string
  name_latin: string
  english_name_translation: string
  ayah_count: number
  revelation_type: string
}

interface Verse {
  surah_no: number
  ayah_no: number
  surah_name_latin: string
  text_uthmani: string
  translation_id: string
  juz: number
}

interface BacaListScreenProps {
  onNavigate: (screen: string) => void
  onSelectSurah: (surahNo: number) => void
}

type FilterType = 'semua' | 'makkiyah' | 'madaniyah' | 'pendek'
type ViewMode = 'surah' | 'juz'

export function BacaListScreen({ onNavigate, onSelectSurah }: BacaListScreenProps) {
  const [surahs, setSurahs] = useState<SurahMeta[]>([])
  const [verses, setVerses] = useState<Verse[]>([])
  const [filter, setFilter] = useState<FilterType>('semua')
  const [viewMode, setViewMode] = useState<ViewMode>('surah')
  const [search, setSearch] = useState('')
  const [lastRead, setLastReadState] = useState<{ surah: number; ayat: number } | null>(null)
  const [savedAyat, setSavedAyat] = useState<{ surah: number; ayat: number }[]>([])
  const [readSurahs, setReadSurahsState] = useState<number[]>([])
  const [streak, setStreakState] = useState(0)

  useEffect(() => {
    fetch('/data/surah-meta.json')
      .then((r) => r.json())
      .then(setSurahs)
      .catch(() => {})
    fetch('/data/verses.json')
      .then((r) => r.json())
      .then(setVerses)
      .catch(() => {})
  }, [])

  useEffect(() => {
    migrateLegacyBookmarks()
    setLastReadState(getLastRead())
    setSavedAyat(getSavedAyat())
    setReadSurahsState(getReadSurahs())
    setStreakState(getStreak())
  }, [])

  const filteredSurahs = useMemo(() => {
    let list = surahs
    if (filter === 'makkiyah') list = list.filter((s) => s.revelation_type?.toLowerCase() === 'meccan')
    else if (filter === 'madaniyah') list = list.filter((s) => s.revelation_type?.toLowerCase() === 'medinan')
    else if (filter === 'pendek') list = list.filter((s) => s.ayah_count <= 20)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.name_latin.toLowerCase().includes(q) ||
          s.name_arabic.includes(q) ||
          String(s.number).includes(q)
      )
    }
    return list
  }, [surahs, filter, search])

  const savedVerseCards = useMemo(() => {
    if (savedAyat.length === 0 || verses.length === 0) return []
    return savedAyat.slice(-10).reverse().map((sa) => {
      const v = verses.find((v) => v.surah_no === sa.surah && v.ayah_no === sa.ayat)
      return v ? { ...sa, verse: v } : null
    }).filter(Boolean) as { surah: number; ayat: number; verse: Verse }[]
  }, [savedAyat, verses])

  const lastReadSurah = useMemo(() => {
    if (!lastRead) return null
    return surahs.find((s) => s.number === lastRead.surah) || null
  }, [lastRead, surahs])

  // Surah pertama di tiap juz (dari data ayat) — untuk navigasi grid juz
  const juzStartSurah = useMemo(() => {
    const map = new Map<number, number>()
    for (const v of verses) {
      if (!map.has(v.juz)) map.set(v.juz, v.surah_no)
    }
    return map
  }, [verses])

  return (
    <div className="-mx-5 -mt-5">
      {/* Hero banner */}
      <div className="bg-emerald-deep rounded-none px-5 pt-6 pb-6 text-white relative overflow-hidden" style={{ margin: '0' }}>
        <div className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-white/50 mb-2">
          Baca Qur&apos;an
        </div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] leading-[1.25] mb-1.5">
          Baca dengan warna tajwid
        </h1>
        <p className="text-[13px] leading-[1.6] text-white/70 m-0">
          Tiap warna ada hukumnya, tiap tanda berhenti ada artinya. Simpan ayat favoritmu — tersimpan di perangkat ini.
        </p>
        {/* Iqra watermark */}
        <span
          className="absolute pointer-events-none select-none"
          style={{
            bottom: '-18px',
            right: '-8px',
            fontFamily: 'Amiri, serif',
            fontSize: '120px',
            lineHeight: 1,
            color: 'rgba(255,255,255,0.04)',
          }}
        >
          ٱقْرَأْ
        </span>
      </div>

      <div className="px-5">
        {/* Resume reading card */}
        {lastReadSurah && lastRead && (
          <button
            onClick={() => onSelectSurah(lastRead.surah)}
            className="mt-4 w-full bg-surface border border-line rounded-[6px] px-4 py-3.5 flex items-center gap-3.5 cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald text-left"
          >
            <div className="w-11 h-11 flex-none bg-emerald/6 rounded-[6px] grid place-items-center text-emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink-4">
                Terakhir dibaca
              </div>
              <div className="text-[15px] font-extrabold text-ink mt-0.5">
                {lastReadSurah.name_latin} · ayat {lastRead.ayat}
              </div>
            </div>
            <span className="text-emerald font-extrabold text-[18px] flex-none">→</span>
          </button>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <div className="bg-surface border border-line rounded-[6px] p-3 text-center">
            <div className="text-[22px] font-extrabold text-emerald-deep leading-none tabular-nums">
              {readSurahs.length}
            </div>
            <div className="text-[10px] font-bold text-ink-4 mt-1 uppercase tracking-[0.04em]">
              Surah dibaca
            </div>
          </div>
          <div className="bg-surface border border-line rounded-[6px] p-3 text-center">
            <div className="text-[22px] font-extrabold text-emerald-deep leading-none tabular-nums">
              {streak}
            </div>
            <div className="text-[10px] font-bold text-ink-4 mt-1 uppercase tracking-[0.04em]">
              Hari berturut
            </div>
          </div>
          <div className="bg-surface border border-line rounded-[6px] p-3 text-center">
            <div className="text-[22px] font-extrabold text-emerald-deep leading-none tabular-nums">
              {savedAyat.length}
            </div>
            <div className="text-[10px] font-bold text-ink-4 mt-1 uppercase tracking-[0.04em]">
              Ayat disimpan
            </div>
          </div>
        </div>

        {/* Saved ayat horizontal scroll */}
        {savedVerseCards.length > 0 && (
          <>
            <div className="flex items-baseline justify-between mt-[22px] mb-2.5 pb-1.5 border-b border-line-soft">
              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.02em] text-ink-3">
                Ayat Tersimpan
              </h2>
              <span className="text-[12px] font-semibold text-ink-4">
                {savedAyat.length} ayat
              </span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {savedVerseCards.map((card) => (
                <button
                  key={`${card.surah}-${card.ayat}`}
                  onClick={() => onSelectSurah(card.surah)}
                  className="flex-none w-[260px] bg-surface border border-line rounded-[6px] p-3.5 cursor-pointer transition-[border-color] duration-[120ms] hover:border-gold text-left"
                >
                  <div className="text-[11px] font-extrabold text-emerald tracking-[0.03em] uppercase">
                    QS {card.verse.surah_name_latin} · {card.surah}:{card.ayat}
                  </div>
                  <p
                    className="text-[19px] leading-[1.9] text-ink my-2 text-right"
                    style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
                  >
                    {card.verse.text_uthmani.slice(0, 80)}{card.verse.text_uthmani.length > 80 ? '…' : ''}
                  </p>
                  <p className="text-[12px] leading-[1.55] text-ink-3 line-clamp-2">
                    {card.verse.translation_id}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Section header: Daftar Surah */}
        <div className="flex items-baseline justify-between mt-[22px] mb-2.5 pb-1.5 border-b border-line-soft">
          <h2 className="text-[13px] font-extrabold uppercase tracking-[0.02em] text-ink-3">
            Daftar Surah
          </h2>
          <span className="text-[12px] font-semibold text-ink-4">
            {filter === 'semua' ? '114 surah' : `${filteredSurahs.length} surah`}
          </span>
        </div>

        {/* Filter row */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }} role="group" aria-label="Filter surah">
          {([
            { id: 'semua' as FilterType, label: 'Semua' },
            { id: 'makkiyah' as FilterType, label: 'Makkiyah' },
            { id: 'madaniyah' as FilterType, label: 'Madaniyah' },
          ]).map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setViewMode('surah') }}
              className={`flex-none text-[12px] font-bold whitespace-nowrap px-3.5 py-2 rounded-[4px] border cursor-pointer transition-[border-color,color] duration-[120ms] ${
                filter === f.id && viewMode === 'surah'
                  ? 'bg-emerald-deep text-white border-emerald-deep'
                  : 'bg-surface text-ink-3 border-line hover:border-gold hover:text-gold'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setViewMode('juz')}
            className={`flex-none text-[12px] font-bold whitespace-nowrap px-3.5 py-2 rounded-[4px] border cursor-pointer transition-[border-color,color] duration-[120ms] ${
              viewMode === 'juz'
                ? 'bg-emerald-deep text-white border-emerald-deep'
                : 'bg-surface text-ink-3 border-line hover:border-gold hover:text-gold'
            }`}
          >
            Juz
          </button>
          <button
            onClick={() => { setFilter('pendek'); setViewMode('surah') }}
            className={`flex-none text-[12px] font-bold whitespace-nowrap px-3.5 py-2 rounded-[4px] border cursor-pointer transition-[border-color,color] duration-[120ms] ${
              filter === 'pendek' && viewMode === 'surah'
                ? 'bg-emerald-deep text-white border-emerald-deep'
                : 'bg-surface text-ink-3 border-line hover:border-gold hover:text-gold'
            }`}
          >
            Pendek
          </button>
        </div>

        {viewMode === 'surah' && (
          <>
            {/* Search input */}
            <div className="flex items-center gap-2.5 bg-surface border border-line rounded-[6px] py-1.5 pl-3.5 pr-1.5 mt-3 transition-[border-color] duration-150 focus-within:border-emerald">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="flex-none text-ink-4">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.8-3.8" />
              </svg>
              <input
                type="text"
                placeholder="Cari surah..."
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-ink text-[14px] font-medium placeholder:text-ink-4"
              />
            </div>

            {/* Surah list */}
            <ul className="list-none p-0">
              {filteredSurahs.map((surah) => (
                <li
                  key={surah.number}
                  onClick={() => onSelectSurah(surah.number)}
                  className="flex items-center gap-3 py-3.5 border-b border-line-soft cursor-pointer transition-colors duration-[120ms] hover:bg-emerald/6 hover:mx-[-20px] hover:px-5 last:border-b-0"
                >
                  <div className="w-9 h-9 flex-none grid place-items-center text-[13px] font-extrabold text-emerald-deep bg-emerald/6 rounded-[4px]">
                    {surah.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-ink">
                      {surah.name_latin}
                    </div>
                    <div className="text-[11px] text-ink-4 font-semibold mt-px">
                      {surah.ayah_count} ayat<span className="mx-1">·</span>
                      {surah.revelation_type === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
                    </div>
                  </div>
                  <div
                    className="text-[22px] text-ink-2 flex-none leading-[1.4]"
                    style={{ fontFamily: 'Amiri, serif', direction: 'rtl', unicodeBidi: 'isolate' }}
                  >
                    {surah.name_arabic}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {viewMode === 'juz' && (
          <>
            <div className="flex items-baseline justify-between mt-6 mb-2.5 pb-1.5 border-b border-line-soft">
              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.02em] text-ink-3">
                Navigasi Juz
              </h2>
              <span className="text-[12px] font-semibold text-ink-4">30 juz</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mt-2.5">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                <button
                  key={juz}
                  onClick={() => {
                    const s = juzStartSurah.get(juz)
                    if (s) onSelectSurah(s)
                  }}
                  className="text-[13px] font-bold text-center py-2.5 bg-surface border border-line rounded-[4px] cursor-pointer text-ink-2 transition-[border-color,color] duration-[120ms] hover:border-emerald hover:text-emerald"
                >
                  {juz}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-[26px] pt-3.5 border-t border-line-soft text-[11px] leading-[1.6] text-ink-4">
          <strong className="text-ink-3">Sumber teks:</strong> Tanzil.net (Utsmani) · Terjemahan: Kemenag RI · Warna tajwid: edisi tajwid AlQuran Cloud dengan legenda pemetaan HijaLearn (tidak ada standar warna yang universal).
        </div>
      </div>
    </div>
  )
}
