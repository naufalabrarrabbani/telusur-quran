'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { StatusMarker } from '@/components/ui/StatusMarker'
import { VerseCard } from '@/components/ui/VerseCard'
import { UiIcon } from '@/components/ui/UiIcon'
import { loadData } from '@/lib/data'
import type { Verse } from '@/lib/search'
import {
  WAWASAN_CARDS,
  type WawasanCardData,
  type WawasanStatus,
} from '@/lib/wawasan-data'

interface WawasanScreenProps {
  onNavigate: (screen: string) => void
  onSearch?: (query: string) => void
  focusCardId?: number | null
}

const STATUS_MAP: Record<
  WawasanStatus,
  { marker: 'lolos' | 'bersyarat' | 'kontested' | 'belum'; label: string; short: string }
> = {
  'SIAP': { marker: 'lolos', label: 'TERVERIFIKASI', short: 'Terverifikasi' },
  'LOLOS BERSYARAT': { marker: 'bersyarat', label: 'LOLOS BERSYARAT', short: 'Bersyarat' },
  'KONTESTED': { marker: 'kontested', label: 'KONTESTED', short: 'Kontested' },
  'PERLU CEK SUMBER': { marker: 'belum', label: 'BUKTI OK · KONTEKS BELUM DICEK', short: 'Perlu Cek' },
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

/* -------------------- Compact Shelf Card -------------------- */

function ShelfCard({
  card,
  isRead,
  onOpen,
  onToggleRead,
}: {
  card: WawasanCardData
  isRead: boolean
  onOpen: () => void
  onToggleRead: () => void
}) {
  const status = STATUS_MAP[card.status]

  return (
    <article
      onClick={onOpen}
      className={`shrink-0 w-[240px] snap-start rounded-[6px] border p-[14px_13px_12px] cursor-pointer transition-colors duration-100 flex flex-col min-h-[160px] ${
        isRead
          ? 'bg-emerald/[0.03] border-emerald/25'
          : 'bg-surface border-line hover:border-emerald'
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-[8px]">
        <StatusMarker status={status.marker} label={status.short} />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleRead()
          }}
          className={`w-[20px] h-[20px] rounded-[4px] border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-100 ${
            isRead
              ? 'bg-emerald border-emerald text-white'
              : 'bg-transparent border-ink-4/30 text-transparent hover:border-emerald/60'
          }`}
          title={isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
          aria-label={isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
        >
          {isRead && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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
      </div>

      <h3
        className={`m-0 mb-[6px] text-[14px] font-extrabold leading-[1.35] tracking-[-0.01em] line-clamp-3 ${
          isRead ? 'text-ink-3' : 'text-ink'
        }`}
      >
        {card.judul}
      </h3>

      <p className="m-0 mb-[10px] text-[11.5px] leading-[1.5] text-ink-3 line-clamp-2 flex-1">
        {card.hook}
      </p>

      <div className="flex justify-between items-center border-t border-line-soft pt-[8px] mt-auto text-[10px] font-bold uppercase tracking-[0.04em] text-ink-4">
        <span className={`inline-flex items-center gap-[4px] ${isRead ? 'text-emerald' : ''}`}>
          {isRead ? (
            <>
              <UiIcon name="check-green" size={11} /> Dibaca
            </>
          ) : (
            'Belum dibaca'
          )}
        </span>
        <UiIcon name="forward-grey" size={11} />
      </div>
    </article>
  )
}

/* -------------------- Detail Drawer -------------------- */

function DetailDrawer({
  card,
  verses,
  isRead,
  onClose,
  onToggleRead,
  onSearch,
}: {
  card: WawasanCardData
  verses: Verse[] | null
  isRead: boolean
  onClose: () => void
  onToggleRead: () => void
  onSearch?: (query: string) => void
}) {
  const status = STATUS_MAP[card.status]

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const ayatVerses = useMemo(() => {
    if (!verses || !card.ayat) return []
    return card.ayat
      .map((ref) => {
        const [s, a] = ref.split(':').map(Number)
        return verses.find((v) => v.surah_no === s && v.ayah_no === a)
      })
      .filter((v): v is Verse => Boolean(v))
  }, [verses, card.ayat])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!mounted) return null

  const drawerNode = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 drawer-overlay"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[500px] bg-paper rounded-t-[12px] sm:rounded-[12px] overflow-y-auto drawer-sheet"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-paper/95 backdrop-blur-sm border-b border-line-soft px-4 py-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-extrabold tracking-[0.1em] text-emerald uppercase">
            {card.sorotan ?? card.kategori}
          </span>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] hover:bg-line-soft cursor-pointer bg-transparent border-0 text-ink-2"
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-4 pb-6">
          <div className="mb-3">
            <StatusMarker status={status.marker} label={status.label} />
          </div>
          <h2 className="m-0 text-[22px] font-extrabold leading-[1.3] tracking-[-0.015em] text-ink">
            {card.judul}
          </h2>
          <p className="mt-[10px] mb-0 text-[14px] leading-[1.6] font-semibold text-ink-2">
            {card.hook}
          </p>

          <div className="mt-[22px]">
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
                    <span className="font-extrabold text-ink whitespace-nowrap tabular-nums inline-flex items-center gap-[5px]">
                      {f.nilai.replace(/\s*[✓✗]\s*$/, '')}
                      {f.nilai.includes('✗') && <UiIcon name="cross-red" size={13} />}
                      {f.nilai.includes('✓') && <UiIcon name="check-green" size={13} />}
                    </span>
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
                <p className="mt-[10px] mb-0 text-[12px] font-semibold text-ink-4">
                  Memuat data ayat…
                </p>
              ))}
          </div>

          <div className="mt-[22px]">
            <SectionTitle>Konteks</SectionTitle>
            <p className="m-0 text-[13px] leading-[1.7] text-ink-3">{card.konteks}</p>
            <p className="mt-[8px] mb-0 text-[11px] leading-[1.6] text-ink-4">
              Sumber cek: {card.sumber}
            </p>
          </div>

          <div className="mt-[22px]">
            <SectionTitle>Makna buatmu</SectionTitle>
            <p className="m-0 text-[15px] leading-[1.65] font-bold text-ink bg-gold/8 border-l-[3px] border-l-gold rounded-r-[6px] p-[13px_14px]">
              {card.makna}
            </p>
          </div>

          <div className="mt-[22px] flex gap-2">
            {card.cek && onSearch && (
              <button
                onClick={() => {
                  onSearch(card.cek!)
                  onClose()
                }}
                className="flex-1 inline-flex items-center justify-center gap-[6px] text-[13px] font-bold bg-emerald text-white border border-emerald rounded-[4px] py-[11px] cursor-pointer hover:bg-emerald-deep transition-colors"
              >
                Cek sendiri <UiIcon name="forward-white" size={13} />
              </button>
            )}
            <button
              onClick={onToggleRead}
              className={`text-[13px] font-bold rounded-[4px] py-[11px] px-4 cursor-pointer border transition-colors flex items-center gap-[6px] ${
                isRead
                  ? 'bg-emerald/10 border-emerald text-emerald'
                  : 'bg-surface border-line text-ink-2 hover:border-emerald'
              }`}
            >
              {isRead ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Dibaca
                </>
              ) : (
                'Tandai dibaca'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .drawer-overlay {
          animation: fadeIn 200ms ease-out;
        }
        .drawer-sheet {
          animation: slideUp 280ms cubic-bezier(0.2, 0.9, 0.3, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )

  return createPortal(drawerNode, document.body)
}

/* -------------------- Main Screen -------------------- */

export function WawasanScreen({ onNavigate, onSearch, focusCardId }: WawasanScreenProps) {
  const [verses, setVerses] = useState<Verse[] | null>(null)
  const [readIds, setReadIds] = useState<Set<number>>(new Set())
  const [openCardId, setOpenCardId] = useState<number | null>(null)

  useEffect(() => {
    loadData().then((data) => {
      setVerses(data.verses)
    })
  }, [])

  useEffect(() => {
    setReadIds(loadReadSet())
  }, [])

  useEffect(() => {
    if (focusCardId != null) {
      setOpenCardId(focusCardId)
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

  // Group cards by kategori, preserve first-seen order
  const shelves = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, WawasanCardData[]>()
    for (const c of WAWASAN_CARDS) {
      if (!map.has(c.kategori)) {
        map.set(c.kategori, [])
        order.push(c.kategori)
      }
      map.get(c.kategori)!.push(c)
    }
    return order.map((k) => ({ kategori: k, cards: map.get(k)! }))
  }, [])

  const totalRead = readIds.size
  const totalCards = WAWASAN_CARDS.length
  const percent = totalCards > 0 ? Math.round((totalRead / totalCards) * 100) : 0

  const openCard = useMemo(
    () => (openCardId != null ? WAWASAN_CARDS.find((c) => c.id === openCardId) ?? null : null),
    [openCardId]
  )

  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">
        Kartu Wawasan
      </h2>
      <p className="mb-3 text-[13px] leading-[1.6] text-ink-3">
        {totalCards} hal yang jarang disadari dari teks Al-Qur&apos;an — geser tiap
        baris, tap kartu untuk buka.
      </p>

      <div className="mb-5 bg-surface border border-line rounded-[6px] p-3">
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

      {shelves.map(({ kategori, cards }) => {
        const shelfRead = cards.filter((c) => readIds.has(c.id)).length
        return (
          <section key={kategori} className="mb-6 -mx-4">
            <div className="flex justify-between items-baseline px-4 mb-[10px]">
              <span className="text-[11px] font-extrabold tracking-[0.08em] text-emerald uppercase">
                {kategori} · {cards.length} kartu
              </span>
              <span className="text-[11px] font-semibold text-ink-4 tabular-nums">
                {shelfRead}/{cards.length} dibaca
              </span>
            </div>
            <div className="flex gap-[10px] overflow-x-auto snap-x snap-mandatory px-4 pb-1 wawasan-rail">
              {cards.map((card) => (
                <ShelfCard
                  key={card.id}
                  card={card}
                  isRead={readIds.has(card.id)}
                  onOpen={() => setOpenCardId(card.id)}
                  onToggleRead={() => toggleRead(card.id)}
                />
              ))}
            </div>
          </section>
        )
      })}

      <footer className="mt-[20px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
        Semua wawasan di sini terkurasi &amp; terverifikasi dari teks — bukan karangan
        AI. Kartu berlabel &quot;konteks belum dicek&quot; buktinya sudah terverifikasi
        mesin, tetapi pendalaman tafsirnya masih antre diteliti.
        <button
          onClick={() => onNavigate('metodologi')}
          className="block mt-[6px] bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0"
        >
          <span className="inline-flex items-center gap-[5px]">
            Metodologi &amp; Sumber <UiIcon name="forward-emerald" size={12} />
          </span>
        </button>
      </footer>

      {openCard && (
        <DetailDrawer
          card={openCard}
          verses={verses}
          isRead={readIds.has(openCard.id)}
          onClose={() => setOpenCardId(null)}
          onToggleRead={() => toggleRead(openCard.id)}
          onSearch={onSearch}
        />
      )}

      <style jsx global>{`
        .wawasan-rail {
          scrollbar-width: thin;
        }
        .wawasan-rail::-webkit-scrollbar {
          height: 4px;
        }
        .wawasan-rail::-webkit-scrollbar-thumb {
          background: var(--color-line);
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}
