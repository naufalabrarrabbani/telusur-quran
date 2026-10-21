'use client'

import { useState, useMemo } from 'react'
import { VerseCard } from '@/components/ui/VerseCard'
import { search, highlightArabic, type SearchResult } from '@/lib/search'
import { verses, wordIndex, getVerse, getSurah } from '@/lib/data'

interface HasilCariScreenProps {
  onNavigate: (screen: string) => void
  searchQuery?: string
  onSearch?: (query: string) => void
}

type Mode = 'exact' | 'contains' | 'lemma' | 'root'

const modes: { id: Mode; label: string }[] = [
  { id: 'exact', label: 'Kata Persis' },
  { id: 'contains', label: '+ Awalan' },
  { id: 'lemma', label: 'Lemma' },
  { id: 'root', label: 'Akar Kata' },
]

const modeNotes: Record<Mode, string> = {
  exact: 'Hanya token yang persis cocok. Bentuk lain tidak ikut terhitung.',
  contains: 'Termasuk token yang mengandung kata ini (misal dengan awalan و / ل / ب).',
  lemma: 'Semua bentuk kata dari lemma yang sama dihitung: tunggal, jamak, dan berawalan.',
  root: 'Mode paling longgar: semua kata seakar ikut terhitung.',
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

  const result: SearchResult = useMemo(() => {
    return search(searchQuery, activeMode, verses, wordIndex)
  }, [searchQuery, activeMode])

  const displayVerseIds = showAll ? result.verseIds : result.verseIds.slice(0, 10)

  // Featured verse = first result
  const featuredVerse = result.verseIds.length > 0 ? getVerse(result.verseIds[0]) : undefined
  const featuredSurah = featuredVerse ? getSurah(featuredVerse.surah_no) : undefined

  return (
    <div>
      <button
        onClick={() => onNavigate('beranda')}
        className="bg-none border-none cursor-pointer p-0 text-[13px] font-bold text-ink-4 inline-flex items-center gap-[5px] mb-3 hover:text-emerald"
      >
        ← Kembali
      </button>

      <p className="text-[13px] text-ink-3 font-semibold mb-1">
        Hasil untuk <span className="text-ink font-extrabold">&quot;{searchQuery}&quot;</span>
        {result.arabicTerm && (
          <> · <span style={{ fontFamily: 'Amiri, serif', fontSize: '15px', direction: 'rtl', unicodeBidi: 'isolate' }}>{result.arabicTerm}</span></>
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

      {/* Mode selector */}
      <div className="flex bg-paper-warm border border-line rounded-[6px] p-[3px] gap-[3px] mt-4" role="group" aria-label="Mode hitung">
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
          arabic={highlightArabic(featuredVerse.text_uthmani, searchQuery)}
          translation={featuredVerse.translation_id}
        />
      )}

      {/* Per bentuk kata — only show in lemma/root modes */}
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

      {/* Note strip — show if lemma has more than exact */}
      {activeMode === 'lemma' && result.breakdown && result.breakdown.length > 1 && (() => {
        const exactResult = search(searchQuery, 'exact', verses, wordIndex)
        const diff = result.totalCount - exactResult.totalCount
        if (diff <= 0) return null
        return (
          <div className="mt-[14px] bg-gold/8 border-l-[3px] border-l-gold py-3 px-[14px] text-[13px] leading-[1.6] text-ink-2 rounded-r-[6px]">
            Pencarian teks biasa cuma nemu <strong className="text-gold font-extrabold">{exactResult.totalCount}</strong> — <strong className="text-gold font-extrabold">{diff}</strong> bentuk lain lolos kalau nggak pakai lemma.
          </div>
        )
      })()}

      {/* Verses */}
      <div className="flex items-baseline justify-between mt-7 mb-[10px] pb-2 border-b border-line-soft">
        <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Ayat-ayatnya</h2>
      </div>

      {displayVerseIds.slice(featuredVerse ? 1 : 0).map((vid) => {
        const v = getVerse(vid)
        if (!v) return null
        const s = getSurah(v.surah_no)
        return (
          <VerseCard
            key={vid}
            surah={`QS ${s?.name_latin || v.surah_name_latin}`}
            ayahRef={`${v.surah_no}:${v.ayah_no}`}
            juz={v.makkiyah ? 'Makkiyah' : 'Madaniyah'}
            arabic={highlightArabic(v.text_uthmani, searchQuery)}
            translation={v.translation_id}
          />
        )
      })}

      {!showAll && result.verseIds.length > 10 && (
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
    </div>
  )
}
