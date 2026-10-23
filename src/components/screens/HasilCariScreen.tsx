'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { VerseCard } from '@/components/ui/VerseCard'
import { UiIcon } from '@/components/ui/UiIcon'
import { search, highlightArabic, matchedTokensByVerse, type SearchResult, type Verse, type WordIndex, type SurahMeta } from '@/lib/search'
import { loadData, getVerse, getSurah } from '@/lib/data'

interface HasilCariScreenProps {
  onNavigate: (screen: string) => void
  searchQuery?: string
  onSearch?: (query: string) => void
}

type Mode = 'exact' | 'contains' | 'lemma' | 'root'

const modes: { id: Mode; label: string; short: string }[] = [
  { id: 'exact', label: 'Kata Persis', short: 'Persis' },
  { id: 'contains', label: '+ Awalan', short: '+Awalan' },
  { id: 'lemma', label: 'Lemma', short: 'Lemma' },
  { id: 'root', label: 'Akar Kata', short: 'Akar' },
]

const modeNotes: Record<Mode, string> = {
  exact: 'Hanya token yang persis cocok. Bentuk lain tidak ikut terhitung.',
  contains: 'Termasuk token yang mengandung kata ini (misal dengan awalan و / ل / ب).',
  lemma: 'Semua bentuk kata dari lemma yang sama dihitung: tunggal, jamak, dan berawalan.',
  root: 'Mode paling longgar: semua kata seakar ikut terhitung, termasuk turunan yang maknanya sudah berbeda.',
}

const modeBadge: Record<Mode, string> = {
  exact: 'Mode: KATA PERSIS (satu bentuk saja)',
  contains: 'Mode: + AWALAN',
  lemma: 'Mode: LEMMA (semua bentuk kata)',
  root: 'Mode: AKAR KATA (paling longgar)',
}

export function HasilCariScreen({ onNavigate, searchQuery = 'setan', onSearch }: HasilCariScreenProps) {
  const [activeMode, setActiveMode] = useState<Mode>('lemma')
  const [showAll, setShowAll] = useState(false)
  const [verses, setVerses] = useState<Verse[] | null>(null)
  const [wordIndex, setWordIndex] = useState<WordIndex | null>(null)
  const [surahMeta, setSurahMeta] = useState<SurahMeta[] | null>(null)
  const [loading, setLoading] = useState(true)

  // Scroll state for sticky nav + FAB
  const [scrolledPast, setScrolledPast] = useState(false)
  const [showFab, setShowFab] = useState(false)
  const modeSelectorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadData().then((data) => {
      setVerses(data.verses)
      setWordIndex(data.wordIndex)
      setSurahMeta(data.surahMeta)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setShowAll(false)
  }, [searchQuery])

  // Scroll listener — toggle sticky style + FAB visibility
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolledPast(y > 60)
      setShowFab(y > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const result: SearchResult | null = useMemo(() => {
    if (!verses || !wordIndex) return null
    return search(searchQuery, activeMode, verses, wordIndex)
  }, [searchQuery, activeMode, verses, wordIndex])

  const matchedMap = useMemo(() => {
    if (!wordIndex) return null
    return matchedTokensByVerse(searchQuery, activeMode, wordIndex)
  }, [searchQuery, activeMode, wordIndex])

  const exactResult: SearchResult | null = useMemo(() => {
    if (!verses || !wordIndex || !result || activeMode !== 'lemma' || !result.breakdown || result.breakdown.length <= 1) return null
    return search(searchQuery, 'exact', verses, wordIndex)
  }, [searchQuery, activeMode, verses, wordIndex, result])

  const scrollToModes = () => {
    modeSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (loading || !result || !verses || !surahMeta) {
    return (
      <div>
        <button
          onClick={() => onNavigate('beranda')}
          className="bg-none border-none cursor-pointer p-0 text-[13px] font-bold text-ink-4 inline-flex items-center gap-[5px] mb-3 hover:text-emerald"
        >
          <UiIcon name="back-grey" size={13} /> Kembali
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-ink-3 font-semibold">Memuat data Qur&apos;an...</div>
        </div>
      </div>
    )
  }

  const displayVerseIds = showAll ? result.verseIds : result.verseIds.slice(0, 20)
  const featuredVerse = result.verseIds.length > 0 ? getVerse(verses, result.verseIds[0]) : undefined
  const featuredSurah = featuredVerse ? getSurah(surahMeta, featuredVerse.surah_no) : undefined

  const modeShort = modes.find((m) => m.id === activeMode)?.short ?? 'Mode'

  return (
    <div>
      {/* ============ STICKY MINI-HEADER ============ */}
      <div
        className={`sticky top-0 z-20 -mx-4 px-[14px] py-[10px] flex items-center gap-[10px] transition-[background-color,border-color,box-shadow] duration-180 ${
          scrolledPast
            ? 'bg-paper/92 backdrop-blur-md border-b border-line shadow-[0_1px_10px_rgba(0,0,0,0.03)]'
            : 'bg-paper border-b border-transparent'
        }`}
      >
        <button
          onClick={() => onNavigate('beranda')}
          className="w-[36px] h-[36px] bg-transparent border border-line rounded-[4px] cursor-pointer flex items-center justify-center text-ink-2 shrink-0 p-0 hover:bg-surface transition-colors duration-100"
          aria-label="Kembali ke beranda"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
          <span className="text-[13px] font-extrabold text-ink tracking-[-0.01em] truncate">
            &quot;{searchQuery}&quot;
            {result.arabicTerm && (
              <>
                {' '}
                ·{' '}
                <span style={{ fontFamily: 'Amiri, serif', fontSize: '14px', direction: 'rtl', unicodeBidi: 'isolate' }}>
                  {result.arabicTerm}
                </span>
              </>
            )}
          </span>
          <span className="text-[11px] text-ink-4 font-semibold">
            <b className="text-emerald font-extrabold">{result.totalCount}×</b> · Mode {modeShort}
          </span>
        </div>

        {scrolledPast && (
          <button
            onClick={scrollToModes}
            className="bg-emerald-deep text-white border-0 rounded-[4px] text-[11px] font-bold py-[7px] px-[10px] cursor-pointer shrink-0 hover:bg-emerald transition-colors duration-120"
          >
            Mode
          </button>
        )}
      </div>

      {/* ============ HERO ============ */}
      <section className="pt-[14px] pb-[6px]">
        <p className="text-[13px] text-ink-3 font-semibold mb-1">
          Hasil untuk <span className="text-ink font-extrabold">&quot;{searchQuery}&quot;</span>
          {result.arabicTerm && (
            <>
              {' '}
              ·{' '}
              <span style={{ fontFamily: 'Amiri, serif', fontSize: '15px', direction: 'rtl', unicodeBidi: 'isolate' }}>
                {result.arabicTerm}
              </span>
            </>
          )}
        </p>

        <div className="text-left mt-1">
          <div className="text-[80px] font-extrabold tracking-[-0.05em] leading-[0.95] text-emerald-deep">
            {result.totalCount}
          </div>
          <div className="text-[15px] font-semibold text-ink-2 mt-1">kali disebut dalam Al-Qur&apos;an</div>
          <span className="inline-block mt-[10px] text-[12px] font-bold bg-emerald/12 text-emerald border border-emerald/20 rounded-[4px] py-[5px] px-[10px]">
            {modeBadge[activeMode]}
          </span>
          <p className="mt-2 mb-0 text-[12px] text-ink-4 leading-[1.55] min-h-[18px]">{modeNotes[activeMode]}</p>
        </div>
      </section>

      {/* Mode selector */}
      <div
        ref={modeSelectorRef}
        className="flex bg-paper-warm border border-line rounded-[6px] p-[3px] gap-[3px] mt-4 scroll-mt-[80px]"
        role="group"
        aria-label="Mode hitung"
      >
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMode(m.id)}
            className={`flex-1 text-[12px] font-bold py-[9px] px-1 rounded-[4px] border-none cursor-pointer transition-all duration-[120ms] ${
              activeMode === m.id
                ? 'bg-emerald-deep text-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'bg-transparent text-ink-3'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Featured verse */}
      {featuredVerse && featuredSurah && (
        <VerseCard
          surah={`QS ${featuredSurah.name_latin}`}
          ayahRef={`${featuredVerse.surah_no}:${featuredVerse.ayah_no}`}
          juz={featuredVerse.makkiyah ? 'Makkiyah' : 'Madaniyah'}
          featured
          arabic={highlightArabic(featuredVerse.text_uthmani, featuredVerse.text_simple, matchedMap?.get(result.verseIds[0]), searchQuery, activeMode)}
          translation={featuredVerse.translation_id}
        />
      )}

      {/* Per bentuk kata */}
      {(activeMode === 'lemma' || activeMode === 'root') && result.breakdown && result.breakdown.length > 0 && (
        <div className="bg-surface border border-line rounded-[6px] p-4 mt-[18px]">
          <h3 className="m-0 mb-3 text-[13px] font-extrabold uppercase tracking-[0.03em] text-ink-3">Per bentuk kata</h3>
          {result.breakdown.slice(0, 10).map((b) => {
            const maxCount = result.breakdown![0].count
            const widthPct = Math.max(3, Math.round((b.count / maxCount) * 100))
            return (
              <div key={b.form} className="grid grid-cols-[70px_1fr_32px] items-center gap-[10px] mb-[10px] last:mb-0">
                <span className="text-[20px] text-right text-ink leading-[1.2]" style={{ fontFamily: 'Amiri, serif' }}>{b.form}</span>
                <div className="h-2 bg-paper-deep rounded-[3px] overflow-hidden">
                  <div className="h-full rounded-[3px] bg-[linear-gradient(90deg,var(--color-emerald),var(--color-green))]" style={{ width: `${widthPct}%` }} />
                </div>
                <span className="text-[14px] font-extrabold text-right text-ink">{b.count}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Note strip */}
      {activeMode === 'lemma' && exactResult && (() => {
        const diff = result.totalCount - exactResult.totalCount
        if (diff <= 0) return null
        return (
          <div className="mt-[14px] bg-gold/8 border-l-[3px] border-l-gold py-3 px-[14px] text-[13px] leading-[1.6] text-ink-2 rounded-r-[6px]">
            Pencarian teks biasa cuma nemu <strong className="text-gold font-extrabold">{exactResult.totalCount}</strong> — <strong className="text-gold font-extrabold">{diff}</strong> bentuk lain lolos kalau nggak pakai lemma.
          </div>
        )
      })()}

      {/* Verses section */}
      <div className="flex items-baseline justify-between mt-7 mb-[10px] pb-2 border-b border-line-soft">
        <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Ayat-ayatnya</h2>
        <span className="text-[11px] text-ink-4 font-semibold tabular-nums">
          {featuredVerse ? '2' : '1'}–{Math.min(displayVerseIds.length, result.verseIds.length)} dari {result.verseIds.length}
        </span>
      </div>

      {displayVerseIds.slice(featuredVerse ? 1 : 0).map((vid) => {
        const v = getVerse(verses, vid)
        if (!v) return null
        const s = getSurah(surahMeta, v.surah_no)
        return (
          <VerseCard
            key={vid}
            surah={`QS ${s?.name_latin || v.surah_name_latin}`}
            ayahRef={`${v.surah_no}:${v.ayah_no}`}
            juz={v.makkiyah ? 'Makkiyah' : 'Madaniyah'}
            arabic={highlightArabic(v.text_uthmani, v.text_simple, matchedMap?.get(vid), searchQuery, activeMode)}
            translation={v.translation_id}
          />
        )
      })}

      {!showAll && result.verseIds.length > 20 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full text-[13px] font-bold bg-transparent text-emerald border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald"
        >
          Tampilkan semua {result.verseIds.length} ayat →
        </button>
      )}

      <p className="text-[12px] text-ink-4 mt-3">
        Menampilkan {Math.min(displayVerseIds.length, result.verseIds.length)} dari {result.verseIds.length} ayat.
      </p>

      {/* End-of-list quick actions — appear after ayat list */}
      <div className="mt-6 pt-5 border-t border-line-soft">
        <p className="text-[11px] font-bold text-ink-4 uppercase tracking-[0.08em] mb-[10px]">Selesai scroll — mau ke mana?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="text-[13px] font-bold bg-surface text-ink-2 border border-line rounded-[4px] py-[11px] cursor-pointer hover:border-emerald hover:text-emerald transition-colors duration-120 flex items-center justify-center gap-[6px]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 8L7 4L11 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ke atas
          </button>
          <button
            onClick={() => onNavigate('beranda')}
            className="text-[13px] font-bold bg-emerald text-white border border-emerald rounded-[4px] py-[11px] cursor-pointer hover:bg-emerald-deep transition-colors duration-120"
          >
            Beranda
          </button>
        </div>
      </div>

      {/* ============ FLOATING FAB ============ */}
      {showFab && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-4 bottom-[80px] w-[44px] h-[44px] bg-emerald-deep text-white border-0 rounded-[4px] cursor-pointer flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.18)] z-[15] p-0 hover:bg-emerald fab-in"
          aria-label="Scroll ke atas"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 11L9 6L14 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <style jsx>{`
        .fab-in {
          animation: fabIn 180ms ease-out;
        }
        @keyframes fabIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
