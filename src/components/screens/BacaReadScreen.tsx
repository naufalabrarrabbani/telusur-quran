'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  getLastRead,
  setLastRead,
  isSavedAyat,
  toggleSavedAyat,
  markSurahRead,
  updateStreak,
  getArabicFont,
  setArabicFont as saveArabicFont,
  getArabicFontSize,
  setArabicFontSize as saveArabicFontSize,
  getShowTajwid,
  setShowTajwid as saveShowTajwid,
  getShowTranslation,
  setShowTranslation as saveShowTranslation,
  migrateLegacyBookmarks,
} from '@/lib/quran-storage'
import {
  TAJWID_RULES,
  TAJWID_GROUPS,
  isWaqfRule,
  loadTajwidSurah,
  type TajwidSurah,
} from '@/lib/tajwid'

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
  text_simple: string
  translation_id: string
  juz: number
  page: number
  makkiyah: boolean
}

interface BacaReadScreenProps {
  surahNo: number
  onBack: () => void
}

interface ArabicFontDef {
  id: string
  label: string
  google?: string
  css?: string
}

// Amiri dimuat global dari layout. Scheherazade & Noto Naskh dari Google
// Fonts (dimuat saat dipilih). KFGQPC HAFS tidak ada di Google Fonts —
// dimuat dari stylesheet cdnfonts (family 'KFGQPC HAFS Uthmanic Script').
// Versi sebelumnya mendaftarkan KFGQPC tanpa sumber muat sama sekali,
// jadi pilihan itu tidak pernah benar-benar berganti font.
const ARABIC_FONTS: ArabicFontDef[] = [
  { id: 'Amiri', label: 'Amiri' },
  { id: 'Scheherazade New', label: 'Scheherazade', google: 'Scheherazade+New:wght@400;700' },
  { id: 'Noto Naskh Arabic', label: 'Noto Naskh', google: 'Noto+Naskh+Arabic:wght@400;700' },
  { id: 'KFGQPC HAFS Uthmanic Script', label: 'KFGQPC HAFS', css: 'https://fonts.cdnfonts.com/css/kfgqpc-hafs-uthmanic-script' },
]

// Id font KFGQPC di versi lama (tidak pernah termuat) — dimigrasikan.
const LEGACY_KFGQPC_ID = 'KFGQPC Uthmanic Script HAFS'

function loadFontCss(fontDef: ArabicFontDef) {
  if (typeof document === 'undefined') return
  const href =
    fontDef.css ??
    (fontDef.google ? `https://fonts.googleapis.com/css2?family=${fontDef.google}&display=swap` : null)
  if (!href) return
  const id = `font-${fontDef.id.replace(/\s+/g, '-')}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

export function BacaReadScreen({ surahNo, onBack }: BacaReadScreenProps) {
  const [surahMeta, setSurahMeta] = useState<SurahMeta | null>(null)
  const [allSurahs, setAllSurahs] = useState<SurahMeta[]>([])
  const [verses, setVerses] = useState<Verse[]>([])
  const [activeVerse, setActiveVerse] = useState<number | null>(null)
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set())
  const [showTajwid, setShowTajwidState] = useState(true)
  const [showTranslation, setShowTranslationState] = useState(true)
  const [fontSize, setFontSize] = useState(28)
  const [arabicFont, setArabicFontState] = useState('Amiri')
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState<number | null>(null)
  const [tajwidData, setTajwidData] = useState<TajwidSurah | null>(null)
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [basmalah, setBasmalah] = useState<string | null>(null)
  const verseListRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load data
  useEffect(() => {
    fetch('/data/surah-meta.json')
      .then((r) => r.json())
      .then((data: SurahMeta[]) => {
        setAllSurahs(data)
        const meta = data.find((s) => s.number === surahNo)
        if (meta) setSurahMeta(meta)
      })
      .catch(() => {})
  }, [surahNo])

  useEffect(() => {
    fetch('/data/verses.json')
      .then((r) => r.json())
      .then((data: Verse[]) => {
        const surahVerses = data.filter((v) => v.surah_no === surahNo)
        setVerses(surahVerses)
        // Basmalah diambil dari data (ayat 1:1) — teks ayat tidak pernah
        // diketik tangan di komponen.
        const b = data.find((v) => v.surah_no === 1 && v.ayah_no === 1)
        if (b) setBasmalah(b.text_uthmani)
      })
      .catch(() => {})
  }, [surahNo])

  // Data segmen tajwid per surah (edisi quran-tajweed AlQuran Cloud,
  // diparse offline oleh scripts/build-tajweed.py)
  useEffect(() => {
    let cancelled = false
    setTajwidData(null)
    setSelectedRule(null)
    loadTajwidSurah(surahNo)
      .then((data) => {
        if (!cancelled) setTajwidData(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [surahNo])

  // Load preferences
  useEffect(() => {
    migrateLegacyBookmarks()
    setShowTajwidState(getShowTajwid())
    setShowTranslationState(getShowTranslation())
    setFontSize(getArabicFontSize())
    let font = getArabicFont()
    if (font === LEGACY_KFGQPC_ID) {
      font = 'KFGQPC HAFS Uthmanic Script'
      saveArabicFont(font)
    }
    setArabicFontState(font)
    const fontDef = ARABIC_FONTS.find((f) => f.id === font)
    if (fontDef) loadFontCss(fontDef)
  }, [])

  // Build saved set
  useEffect(() => {
    if (verses.length === 0) return
    const set = new Set<string>()
    for (const v of verses) {
      if (isSavedAyat(v.surah_no, v.ayah_no)) set.add(`${v.surah_no}:${v.ayah_no}`)
    }
    setSavedSet(set)
  }, [verses])

  // Mark surah read and update streak
  useEffect(() => {
    if (verses.length > 0) {
      markSurahRead(surahNo)
      updateStreak()
    }
  }, [surahNo, verses.length])

  // Restore last read position
  useEffect(() => {
    const lr = getLastRead()
    if (lr && lr.surah === surahNo && lr.ayat > 1) {
      setActiveVerse(lr.ayat)
      // Scroll to verse after render
      setTimeout(() => {
        const el = document.getElementById(`verse-${lr.ayat}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [surahNo, verses.length])

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current
      if (!el) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) { setProgress(100); return }
      setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Save last-read on scroll (debounced)
  useEffect(() => {
    if (verses.length === 0) return
    let timeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        // Find which verse is roughly in view
        const verseEls = verseListRef.current?.querySelectorAll('[data-ayah]')
        if (!verseEls) return
        let best: number | null = null
        const viewportMid = window.innerHeight / 2
        for (const el of verseEls) {
          const rect = (el as HTMLElement).getBoundingClientRect()
          if (rect.top <= viewportMid && rect.bottom > 0) {
            best = parseInt((el as HTMLElement).dataset.ayah || '1')
          }
        }
        if (best !== null) setLastRead(surahNo, best)
      }, 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeout)
    }
  }, [surahNo, verses.length])

  const handleToggleSave = useCallback((surah: number, ayat: number) => {
    const nowSaved = toggleSavedAyat(surah, ayat)
    setSavedSet((prev) => {
      const next = new Set(prev)
      const key = `${surah}:${ayat}`
      if (nowSaved) next.add(key)
      else next.delete(key)
      return next
    })
  }, [])

  const handleCopy = useCallback(async (verse: Verse) => {
    const text = `${verse.text_uthmani}\n\n${verse.translation_id}\n\n— QS ${verse.surah_name_latin} ${verse.surah_no}:${verse.ayah_no}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(verse.ayah_no)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // fallback
    }
  }, [])

  const handleFontChange = useCallback((fontId: string) => {
    setArabicFontState(fontId)
    saveArabicFont(fontId)
    const fontDef = ARABIC_FONTS.find((f) => f.id === fontId)
    if (fontDef) loadFontCss(fontDef)
    setShowFontPicker(false)
  }, [])

  const handleFontSizeUp = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.min(42, prev + 2)
      saveArabicFontSize(next)
      return next
    })
  }, [])

  const handleFontSizeDown = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.max(20, prev - 2)
      saveArabicFontSize(next)
      return next
    })
  }, [])

  const handleToggleTajwid = useCallback(() => {
    setShowTajwidState((prev) => {
      saveShowTajwid(!prev)
      return !prev
    })
  }, [])

  const handleToggleTranslation = useCallback(() => {
    setShowTranslationState((prev) => {
      saveShowTranslation(!prev)
      return !prev
    })
  }, [])

  const prevSurah = useMemo(() => {
    if (allSurahs.length === 0) return null
    return allSurahs.find((s) => s.number === surahNo - 1) || null
  }, [allSurahs, surahNo])

  const nextSurah = useMemo(() => {
    if (allSurahs.length === 0) return null
    return allSurahs.find((s) => s.number === surahNo + 1) || null
  }, [allSurahs, surahNo])

  const revType = surahMeta?.revelation_type === 'Meccan' ? 'Makkiyah' : 'Madaniyah'
  const firstVerse = verses[0]
  const juz = firstVerse?.juz ?? 1
  const page = firstVerse?.page ?? 1

  return (
    <div ref={containerRef} className="-mx-5 -mt-5">
      {/* Progress bar */}
      <div className="sticky top-0 z-[6] h-[3px] bg-line-soft">
        <div
          className="h-full bg-emerald transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Surah header */}
      <header className="bg-emerald-deep text-white px-5 pt-5 pb-6 relative overflow-hidden">
        <span
          className="absolute pointer-events-none select-none"
          style={{
            bottom: '-12px',
            right: '-6px',
            fontFamily: 'Amiri, serif',
            fontSize: '80px',
            lineHeight: 1,
            color: 'rgba(255,255,255,0.03)',
          }}
        >
          بِسْمِ ٱللَّهِ
        </span>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="bg-transparent border-none cursor-pointer text-white/60 text-[13px] font-bold flex items-center gap-1 p-0 hover:text-white transition-colors"
          >
            ← Daftar Surah
          </button>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-[-0.02em] leading-[1.15]">
              {surahMeta?.name_latin || `Surah ${surahNo}`}
            </h1>
            <div className="mt-1.5 text-[12px] text-white/50 font-semibold">
              {surahMeta?.ayah_count || verses.length} ayat · {revType} · Juz {juz} · Hal {page}
            </div>
          </div>
          <div
            className="text-[30px] leading-[1.3] text-white/85 text-right"
            style={{ fontFamily: 'Amiri, serif', direction: 'rtl', unicodeBidi: 'isolate' }}
          >
            {surahMeta?.name_arabic || ''}
          </div>
        </div>
      </header>

      {/* Controls strip */}
      <div className="flex gap-2 flex-wrap px-5 py-3.5 bg-surface border-b border-line-soft sticky top-[3px] z-[5]">
        <button
          onClick={handleToggleTajwid}
          className={`text-[12px] font-bold px-3 py-[7px] rounded-[4px] border cursor-pointer flex items-center gap-[5px] transition-all duration-[120ms] ${
            showTajwid
              ? 'bg-emerald-deep text-white border-emerald-deep'
              : 'bg-surface text-ink-3 border-line'
          }`}
        >
          <span
            className="w-[7px] h-[7px] rounded-[2px]"
            style={{ background: showTajwid ? '#C9A633' : '#9C9C92' }}
          />
          Tajwid
        </button>
        <button
          onClick={handleToggleTranslation}
          className={`text-[12px] font-bold px-3 py-[7px] rounded-[4px] border cursor-pointer flex items-center gap-[5px] transition-all duration-[120ms] ${
            showTranslation
              ? 'bg-emerald-deep text-white border-emerald-deep'
              : 'bg-surface text-ink-3 border-line'
          }`}
        >
          <span
            className="w-[7px] h-[7px] rounded-[2px]"
            style={{ background: showTranslation ? '#C9A633' : '#9C9C92' }}
          />
          Terjemah
        </button>

        {/* Font picker */}
        <div className="relative">
          <button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="text-[12px] font-bold px-3 py-[7px] rounded-[4px] border border-line bg-surface text-ink-3 cursor-pointer flex items-center gap-1.5 transition-all duration-[120ms] hover:border-emerald"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
            </svg>
            {ARABIC_FONTS.find(f => f.id === arabicFont)?.label || 'Font'}
          </button>
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 bg-surface border border-line rounded-[6px] shadow-lg z-20 min-w-[180px]">
              {ARABIC_FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFontChange(f.id)}
                  className={`w-full text-left text-[12px] font-semibold px-3 py-2.5 cursor-pointer border-none transition-colors first:rounded-t-[6px] last:rounded-b-[6px] ${
                    arabicFont === f.id
                      ? 'bg-emerald/6 text-emerald-deep'
                      : 'bg-surface text-ink-2 hover:bg-paper-warm'
                  }`}
                >
                  {f.label}
                  {arabicFont === f.id && <span className="ml-2 text-emerald">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font size controls */}
        <div className="ml-auto flex items-center border border-line rounded-[4px] overflow-hidden">
          <button
            onClick={handleFontSizeDown}
            className="w-8 h-8 border-none bg-surface text-ink-3 cursor-pointer grid place-items-center text-[14px] font-extrabold transition-colors hover:bg-paper-warm border-r border-line"
            aria-label="Perkecil huruf"
          >
            A-
          </button>
          <button
            onClick={handleFontSizeUp}
            className="w-8 h-8 border-none bg-surface text-ink-3 cursor-pointer grid place-items-center text-[14px] font-extrabold transition-colors hover:bg-paper-warm"
            aria-label="Perbesar huruf"
          >
            A+
          </button>
        </div>
      </div>

      {/* Basmalah dari data ayat 1:1 (tidak untuk Al-Fatihah — sudah jadi
          ayat pertamanya — dan tidak untuk At-Taubah, surah 9) */}
      {surahNo !== 9 && surahNo !== 1 && basmalah && (
        <div className="text-center pt-7 pb-2 px-5">
          <p
            className="text-[26px] leading-[1.8] text-gold"
            style={{ fontFamily: `${arabicFont}, Amiri, serif`, direction: 'rtl' }}
          >
            {basmalah}
          </p>
          <div className="w-[60px] h-px bg-line mx-auto mt-3" />
        </div>
      )}

      {/* Verses */}
      <div ref={verseListRef} className="px-5">
        {verses.map((verse) => {
          const key = `${verse.surah_no}:${verse.ayah_no}`
          const isActive = activeVerse === verse.ayah_no
          const isSaved = savedSet.has(key)
          const tajwidAyah = tajwidData?.ayahs.find((a) => a.n === verse.ayah_no)

          return (
            <article
              key={key}
              id={`verse-${verse.ayah_no}`}
              data-ayah={verse.ayah_no}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return
                setActiveVerse(isActive ? null : verse.ayah_no)
                setSelectedRule(null)
              }}
              className={`py-[22px] border-b border-line-soft last:border-b-0 cursor-pointer transition-colors ${
                isActive ? 'bg-gold/8 mx-[-20px] px-5' : ''
              }`}
            >
              {/* Verse top row */}
              <div className="flex justify-between items-center mb-3.5">
                <div className="w-[30px] h-[30px] grid place-items-center text-[12px] font-extrabold text-emerald-deep bg-emerald/6 rounded-[4px]">
                  {verse.ayah_no}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleToggleSave(verse.surah_no, verse.ayah_no)}
                    aria-label="Simpan ayat"
                    className={`w-[30px] h-[30px] grid place-items-center border rounded-[4px] cursor-pointer transition-all duration-[120ms] ${
                      isSaved
                        ? 'border-gold text-gold bg-gold/8'
                        : 'border-line text-ink-4 bg-transparent hover:border-gold hover:text-gold'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleCopy(verse)}
                    aria-label="Salin ayat"
                    className={`w-[30px] h-[30px] grid place-items-center border rounded-[4px] cursor-pointer transition-all duration-[120ms] ${
                      copied === verse.ayah_no
                        ? 'border-emerald text-emerald bg-emerald/6'
                        : 'border-line text-ink-4 bg-transparent hover:border-gold hover:text-gold'
                    }`}
                  >
                    {copied === verse.ayah_no ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic text — segmen berwarna dari data tajweed (bukan
                  markup di dalam teks ayat; verses.json teksnya polos).
                  Toggle Tajwid mematikan pewarnaannya. Hover/ketuk segmen
                  berwarna membuka info hukumnya. */}
              <p
                className="m-0 text-ink"
                style={{
                  fontFamily: `${arabicFont}, Amiri, serif`,
                  fontSize: `${fontSize}px`,
                  lineHeight: 2.2,
                  textAlign: 'right',
                  direction: 'rtl',
                  letterSpacing: '0.01em',
                }}
                lang="ar"
              >
                {tajwidAyah
                  ? tajwidAyah.seg.map(([text, code], idx) => {
                      if (!code) return <span key={idx}>{text}</span>
                      const rule = TAJWID_RULES[code]
                      if (!rule) return <span key={idx}>{text}</span>
                      const waqf = isWaqfRule(code)
                      const style: React.CSSProperties = !showTajwid
                        ? {}
                        : waqf
                          ? { color: rule.color, backgroundColor: `${rule.color}1F`, borderRadius: 3, padding: '0 2px', fontWeight: 700 }
                          : { color: rule.color }
                      return (
                        <span
                          key={idx}
                          style={style}
                          title={rule.name}
                          className={showTajwid ? 'cursor-pointer transition-opacity hover:opacity-60' : undefined}
                          onMouseEnter={() => {
                            if (showTajwid) setSelectedRule(code)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (showTajwid) setSelectedRule(code)
                          }}
                        >
                          {text}
                        </span>
                      )
                    })
                  : verse.text_uthmani}
              </p>

              {/* Translation */}
              {showTranslation && (
                <p className="text-[14px] leading-[1.75] text-ink-3 mt-3">
                  {verse.translation_id}
                </p>
              )}
            </article>
          )
        })}
      </div>

      {/* Tajwid legend — hukum asli dari lib/tajwid (pemetaan terverifikasi) */}
      {showTajwid && (
        <div className="pt-5 px-5">
          <div className="bg-surface border border-line rounded-[6px] px-4 py-3.5">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-ink-3 mb-2.5">
              Legenda Warna Tajwid
            </div>
            {TAJWID_GROUPS.map((group) => (
              <div key={group} className="mb-2.5 last:mb-0">
                <div className="text-[10px] font-extrabold tracking-[0.06em] uppercase text-ink-4 mb-1.5">{group}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {Object.entries(TAJWID_RULES)
                    .filter(([, r]) => r.group === group)
                    .map(([code, r]) => (
                      <button
                        key={code}
                        onClick={() => setSelectedRule(code)}
                        className="flex items-center gap-2 text-[12px] font-semibold text-ink-2 bg-none border-none cursor-pointer p-0 text-left"
                      >
                        <span className="w-2.5 h-2.5 rounded-[2px] flex-none" style={{ background: r.color }} />
                        {r.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
            <p className="m-0 mt-2.5 text-[10.5px] leading-[1.55] text-ink-4">
              Ketuk nama hukum atau huruf berwarna di ayat untuk penjelasannya. Tidak ada standar warna tajwid yang universal — legenda ini pemetaan HijaLearn atas edisi tajwid AlQuran Cloud.
            </p>
          </div>
        </div>
      )}

      {/* Surah navigation */}
      <div className="flex gap-2 px-5 py-5">
        <button
          onClick={() => {
            if (prevSurah) {
              window.dispatchEvent(new CustomEvent('navigate-surah', { detail: prevSurah.number }))
            }
          }}
          disabled={!prevSurah}
          className={`flex-1 text-[13px] font-bold p-3 bg-surface border border-line rounded-[4px] cursor-pointer text-ink-2 text-center transition-[border-color] duration-[120ms] hover:border-emerald ${
            !prevSurah ? 'opacity-30 cursor-default' : ''
          }`}
        >
          <span className="text-[10px] font-extrabold text-ink-4 uppercase tracking-[0.06em] block mb-0.5">
            ← Sebelumnya
          </span>
          {prevSurah?.name_latin || '—'}
        </button>
        <button
          onClick={() => {
            if (nextSurah) {
              window.scrollTo({ top: 0 })
              // Navigate by calling onBack and then selecting next surah
              // We need to trigger a surah change - we'll use a custom event approach
              // For simplicity, reload with next surah via the parent component
              window.dispatchEvent(new CustomEvent('navigate-surah', { detail: nextSurah.number }))
            }
          }}
          disabled={!nextSurah}
          className={`flex-1 text-[13px] font-bold p-3 bg-surface border border-line rounded-[4px] cursor-pointer text-ink-2 text-center transition-[border-color] duration-[120ms] hover:border-emerald ${
            !nextSurah ? 'opacity-30 cursor-default' : ''
          }`}
        >
          <span className="text-[10px] font-extrabold text-ink-4 uppercase tracking-[0.06em] block mb-0.5">
            Selanjutnya →
          </span>
          {nextSurah?.name_latin || '—'}
        </button>
      </div>

      {/* Footer */}
      <p className="px-5 pb-5 text-[10px] leading-[1.6] text-ink-4 text-center">
        Teks ayat &amp; warna tajwid: edisi tajwid AlQuran Cloud · Terjemahan: Kemenag RI
      </p>

      {/* Info hukum tajwid terpilih — dirender via portal ke body karena
          wrapper layar membawa transform animasi yang mematahkan
          position:fixed; posisi bawah ditulis inline agar calc valid. */}
      {selectedRule && TAJWID_RULES[selectedRule] &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              bottom: 'calc(76px + env(safe-area-inset-bottom))',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 430,
              padding: '0 20px',
              zIndex: 40,
            }}
          >
            <div className="bg-surface border border-line rounded-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.16)] p-[13px_14px] flex gap-[10px] items-start">
              <span className="flex-none w-[14px] h-[14px] rounded-full mt-[3px]" style={{ backgroundColor: TAJWID_RULES[selectedRule].color }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold text-ink">{TAJWID_RULES[selectedRule].name}</div>
                <p className="m-0 mt-[2px] text-[12.5px] leading-[1.55] text-ink-3">{TAJWID_RULES[selectedRule].desc}</p>
              </div>
              <button onClick={() => setSelectedRule(null)} className="flex-none bg-none border-none cursor-pointer text-ink-4 text-[15px] font-bold p-0" aria-label="Tutup info hukum">
                ✕
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Click-outside handler for font picker */}
      {showFontPicker && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowFontPicker(false)}
        />
      )}
    </div>
  )
}
