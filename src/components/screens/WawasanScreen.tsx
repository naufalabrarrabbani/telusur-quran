'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { StatusMarker } from '@/components/ui/StatusMarker'
import { VerseCard } from '@/components/ui/VerseCard'
import { loadData } from '@/lib/data'
import type { Verse } from '@/lib/search'
import {
  WAWASAN_CARDS,
  WAWASAN_KATEGORI,
  type WawasanCardData,
  type WawasanStatus,
} from '@/lib/wawasan-data'

interface WawasanScreenProps {
  onNavigate: (screen: string) => void
  onSearch?: (query: string) => void
  /** Kartu yang dipin ke atas & ditandai featured (dari Pintu Emosi di Beranda) */
  focusCardId?: number | null
}

const STATUS_MAP: Record<WawasanStatus, { marker: 'lolos' | 'bersyarat' | 'kontested' | 'belum'; label: string }> = {
  'SIAP': { marker: 'lolos', label: 'TERVERIFIKASI' },
  'LOLOS BERSYARAT': { marker: 'bersyarat', label: 'LOLOS BERSYARAT' },
  'KONTESTED': { marker: 'kontested', label: 'KONTESTED' },
  'PERLU CEK SUMBER': { marker: 'belum', label: 'BUKTI OK · KONTEKS BELUM DICEK' },
}

const STORAGE_KEY = 'wawasan-read'

function loadReadSet(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadSet(ids: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {}
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
      {children}
      <span className="flex-1 h-px bg-line" />
    </div>
  )
}

function ReadCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={`w-[22px] h-[22px] rounded-[4px] border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-100 ${
        checked
          ? 'bg-emerald border-emerald text-white'
          : 'bg-transparent border-ink-4/30 text-transparent hover:border-emerald/60'
      }`}
      title={checked ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
      aria-label={checked ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

function WawasanCard({
  card,
  verses,
  onSearch,
  featured = false,
  isRead,
  onToggleRead,
  expanded,
  onToggleExpanded,
}: {
  card: WawasanCardData
  verses: Verse[] | null
  onSearch?: (query: string) => void
  featured?: boolean
  isRead: boolean
  onToggleRead: () => void
  expanded: boolean
  onToggleExpanded: () => void
}) {
  const status = STATUS_MAP[card.status]

  const ayatVerses = useMemo(() => {
    if (!verses || !card.ayat) return []
    return card.ayat
      .map((ref) => {
        const [s, a] = ref.split(':').map(Number)
        return verses.find((v) => v.surah_no === s && v.ayah_no === a)
      })
      .filter((v): v is Verse => Boolean(v))
  }, [verses, card.ayat])

  const baseClass = featured
    ? 'bg-[linear-gradient(160deg,rgba(26,107,74,0.04),var(--color-surface)_50%)] border-[1.5px] border-emerald rounded-[6px] p-[18px_16px] mb-3 shadow-[0_2px_16px_rgba(26,107,74,0.06)]'
    : isRead
      ? 'bg-emerald/[0.03] border border-emerald/25 rounded-[6px] p-[18px_16px] mb-3'
      : 'bg-surface border border-line rounded-[6px] p-[18px_16px] mb-3'

  return (
    <article className={baseClass}>
      {/* Header: kategori eyebrow + status + read checkbox */}
      <div className="flex justify-between items-start gap-2 mb-[10px]">
        <span className="block text-[10px] font-extrabold tracking-[0.1em] text-emerald uppercase pt-[2px]">
          {card.sorotan ?? card.kategori}
        </span>
        <div className="flex items-start gap-[10px]">
          <StatusMarker status={status.marker} label={status.label} />
          <ReadCheckbox checked={isRead} onToggle={onToggleRead} />
        </div>
      </div>

      {/* Clickable title area — toggles expand */}
      <button
        onClick={onToggleExpanded}
        className="block w-full text-left bg-transparent border-0 p-0 cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`m-0 flex-1 text-[19px] font-extrabold leading-[1.35] tracking-[-0.01em] ${
              isRead && !featured ? 'text-ink-3' : 'text-ink'
            }`}
          >
            {card.judul}
          </h3>
          <span
            className={`shrink-0 w-[24px] h-[24px] flex items-center justify-center text-ink-4 transition-transform duration-200 mt-[2px] ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <p className="mt-[8px] mb-0 text-[13.5px] leading-[1.65] font-semibold text-ink-2">
          {card.hook}
        </p>
      </button>

      {/* Expanded body */}
      {expanded && (
        <>
          {/* Bukti */}
          <div className="mt-[18px]">
            <SectionTitle>Bukti · Terverifikasi Mesin</SectionTitle>
            <p className="m-0 text-[13px] leading-[1.7] text-ink-3">{card.bukti}</p>

            {card.fakta && (
              <div className="mt-[10px]">
                {card.fakta.map((f) => (
                  <div
                    key={f.label}
                    className="flex justify-between items-baseline gap-[10px] py-[6px] border-b border-line-soft last:border-b-0 text-[13px] text-ink-2 font-semibold"
                  >
                    <span>{f.label}</span>
                    <span className="font-extrabold text-ink whitespace-nowrap tabular-nums">{f.nilai}</span>
                  </div>
                ))}
              </div>
            )}

            {card.ayat &&
              (verses ? (
                ayatVerses.map((v) => (
                  <VerseCard
                    key={`${v.surah_no}:${v.ayah_no}`}
                    surah={`QS ${v.surah_name_latin}`}
                    ayahRef={`${v.surah_no}:${v.ayah_no}`}
                    juz={v.makkiyah ? 'Makkiyah' : 'Madaniyah'}
                    arabic={v.text_uthmani}
                    translation={v.translation_id}
                  />
                ))
              ) : (
                <p className="mt-[10px] mb-0 text-[12px] font-semibold text-ink-4">Memuat data ayat…</p>
              ))}
          </div>

          {/* Konteks */}
          <div className="mt-[18px]">
            <SectionTitle>Konteks</SectionTitle>
            <p className="m-0 text-[13px] leading-[1.7] text-ink-3">{card.konteks}</p>
            <p className="mt-[8px] mb-0 text-[11px] leading-[1.6] text-ink-4">
              Sumber cek: {card.sumber}
            </p>
          </div>

          {/* Makna */}
          <div className="mt-[18px]">
            <SectionTitle>Makna buatmu</SectionTitle>
            <p className="m-0 text-[15px] leading-[1.65] font-bold text-ink bg-gold/8 border-l-[3px] border-l-gold rounded-r-[6px] p-[13px_14px]">
              {card.makna}
            </p>
          </div>

          {card.cek && onSearch && (
            <button
              onClick={() => onSearch(card.cek!)}
              className="mt-3 w-full text-[13px] font-bold bg-transparent text-emerald border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald"
            >
              Cek sendiri → cari &quot;{card.cek}&quot;
            </button>
          )}

          {/* Mark-as-read quick action at bottom when expanded */}
          {!isRead && (
            <button
              onClick={onToggleRead}
              className="mt-2 w-full text-[13px] font-bold bg-emerald/5 text-emerald border border-emerald/30 rounded-[4px] py-[10px] cursor-pointer transition-colors duration-[120ms] hover:bg-emerald/10"
            >
              ✓ Tandai sudah dibaca
            </button>
          )}
        </>
      )}
    </article>
  )
}

export function WawasanScreen({ onNavigate, onSearch, focusCardId }: WawasanScreenProps) {
  const [kategori, setKategori] = useState<string>('Semua')
  const [verses, setVerses] = useState<Verse[] | null>(null)
  const [readIds, setReadIds] = useState<Set<number>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadData().then((data) => {
      setVerses(data.verses)
    })
  }, [])

  useEffect(() => {
    setReadIds(loadReadSet())
  }, [])

  // Masuk dari Pintu Emosi: tampilkan semua kategori, pin & auto-expand kartu tujuannya
  useEffect(() => {
    if (focusCardId != null) {
      setKategori('Semua')
      setExpandedIds((prev) => {
        const next = new Set(prev)
        next.add(focusCardId)
        return next
      })
    }
  }, [focusCardId])

  const toggleRead = useCallback((id: number) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveReadSet(next)
      return next
    })
  }, [])

  const toggleExpanded = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const visible = useMemo(() => {
    const list = kategori === 'Semua' ? [...WAWASAN_CARDS] : WAWASAN_CARDS.filter((c) => c.kategori === kategori)
    if (focusCardId != null) {
      list.sort((a, b) => (a.id === focusCardId ? -1 : b.id === focusCardId ? 1 : 0))
    }
    return list
  }, [kategori, focusCardId])

  const totalRead = readIds.size
  const totalCards = WAWASAN_CARDS.length
  const percent = totalCards > 0 ? Math.round((totalRead / totalCards) * 100) : 0

  const visibleReadCount = visible.filter((c) => readIds.has(c.id)).length

  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Kartu Wawasan</h2>
      <p className="mb-3 text-[13px] leading-[1.6] text-ink-3">
        Hal-hal yang jarang disadari dari teks Al-Qur&apos;an — tiap kartu dibuka dengan hook, lalu buktinya, konteksnya, dan maknanya. {totalCards} kartu, semua angkanya dihitung dari teks Tanzil dan ditampilkan dengan cara hitungnya.
      </p>

      {/* Progress bar */}
      <div className="mb-4 bg-surface border border-line rounded-[6px] p-3">
        <div className="flex items-center justify-between mb-[6px]">
          <span className="text-[12px] font-bold text-ink-2">
            {totalRead} dari {totalCards} kartu dibaca
          </span>
          <span className="text-[12px] font-extrabold text-emerald tabular-nums">
            {percent}%
          </span>
        </div>
        <div className="h-[6px] bg-line rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-emerald rounded-[3px] transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Filter kategori — rectangular, no pills */}
      <div className="flex flex-wrap gap-[6px] mb-3">
        {WAWASAN_KATEGORI.map((k) => {
          const active = kategori === k
          const count = k === 'Semua' ? totalCards : WAWASAN_CARDS.filter((c) => c.kategori === k).length
          return (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={
                active
                  ? 'text-[12px] font-bold rounded-[4px] px-3 py-[7px] cursor-pointer bg-emerald-deep text-white border border-emerald-deep'
                  : 'text-[12px] font-bold rounded-[4px] px-3 py-[7px] cursor-pointer bg-surface text-ink-2 border border-line hover:border-emerald hover:text-emerald'
              }
            >
              {k} · {count}
            </button>
          )
        })}
      </div>

      {/* Filter + read counter row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-ink-4 uppercase tracking-[0.06em]">
          {kategori === 'Semua' ? 'Semua kategori' : kategori}
        </span>
        <span className="text-[11px] font-semibold text-ink-4 tabular-nums">
          {visibleReadCount}/{visible.length} dibaca
        </span>
      </div>

      {visible.map((card) => (
        <WawasanCard
          key={card.id}
          card={card}
          verses={verses}
          onSearch={onSearch}
          featured={focusCardId != null ? card.id === focusCardId : false}
          isRead={readIds.has(card.id)}
          onToggleRead={() => toggleRead(card.id)}
          expanded={expandedIds.has(card.id)}
          onToggleExpanded={() => toggleExpanded(card.id)}
        />
      ))}

      <footer className="mt-[30px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
        Semua wawasan di sini terkurasi &amp; terverifikasi dari teks — bukan karangan AI. Kartu berlabel &quot;konteks belum dicek&quot; buktinya sudah terverifikasi mesin, tetapi pendalaman tafsirnya masih antre diteliti.
        <button onClick={() => onNavigate('metodologi')} className="block mt-[6px] bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0">
          Metodologi &amp; Sumber →
        </button>
      </footer>
    </div>
  )
}
