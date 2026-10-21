'use client'

import { useState, useEffect, useMemo } from 'react'
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

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
      {children}
      <span className="flex-1 h-px bg-line" />
    </div>
  )
}

function WawasanCard({
  card,
  verses,
  onSearch,
  featured = false,
}: {
  card: WawasanCardData
  verses: Verse[] | null
  onSearch?: (query: string) => void
  featured?: boolean
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

  return (
    <article
      className={
        featured
          ? 'bg-[linear-gradient(160deg,rgba(26,107,74,0.04),var(--color-surface)_50%)] border-[1.5px] border-emerald rounded-[6px] p-[18px_16px] mb-3 shadow-[0_2px_16px_rgba(26,107,74,0.06)]'
          : 'bg-surface border border-line rounded-[6px] p-[18px_16px] mb-3'
      }
    >
      <div className="flex justify-between items-start gap-2 mb-[10px]">
        <span className="block text-[10px] font-extrabold tracking-[0.1em] text-emerald uppercase">
          {card.sorotan ?? card.kategori}
        </span>
        <StatusMarker status={status.marker} label={status.label} />
      </div>

      <h3 className="m-0 text-[19px] font-extrabold leading-[1.35] tracking-[-0.01em] text-ink">
        {card.judul}
      </h3>
      <p className="mt-[8px] mb-0 text-[13.5px] leading-[1.65] font-semibold text-ink-2">
        {card.hook}
      </p>

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
    </article>
  )
}

export function WawasanScreen({ onNavigate, onSearch, focusCardId }: WawasanScreenProps) {
  const [kategori, setKategori] = useState<string>('Semua')
  const [verses, setVerses] = useState<Verse[] | null>(null)

  useEffect(() => {
    loadData().then((data) => {
      setVerses(data.verses)
    })
  }, [])

  // Masuk dari Pintu Emosi: tampilkan semua kategori & pin kartu tujuannya
  useEffect(() => {
    if (focusCardId != null) setKategori('Semua')
  }, [focusCardId])

  const visible = useMemo(() => {
    const list = kategori === 'Semua' ? [...WAWASAN_CARDS] : WAWASAN_CARDS.filter((c) => c.kategori === kategori)
    if (focusCardId != null) {
      list.sort((a, b) => (a.id === focusCardId ? -1 : b.id === focusCardId ? 1 : 0))
    }
    return list
  }, [kategori, focusCardId])

  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Kartu Wawasan</h2>
      <p className="mb-[14px] text-[13px] leading-[1.6] text-ink-3">
        Hal-hal yang jarang disadari dari teks Al-Qur&apos;an — tiap kartu dibuka dengan hook, lalu buktinya, konteksnya, dan maknanya. {WAWASAN_CARDS.length} kartu, semua angkanya dihitung dari teks Tanzil dan ditampilkan dengan cara hitungnya.
      </p>

      {/* Filter kategori */}
      <div className="flex flex-wrap gap-[6px] mb-[18px]">
        {WAWASAN_KATEGORI.map((k) => {
          const active = kategori === k
          const count = k === 'Semua' ? WAWASAN_CARDS.length : WAWASAN_CARDS.filter((c) => c.kategori === k).length
          return (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={
                active
                  ? 'text-[12px] font-bold rounded-full px-3 py-[6px] cursor-pointer bg-emerald text-white border border-emerald'
                  : 'text-[12px] font-bold rounded-full px-3 py-[6px] cursor-pointer bg-transparent text-ink-3 border border-line hover:border-emerald hover:text-emerald'
              }
            >
              {k} · {count}
            </button>
          )
        })}
      </div>

      {visible.map((card) => (
        <WawasanCard
          key={card.id}
          card={card}
          verses={verses}
          onSearch={onSearch}
          featured={focusCardId != null ? card.id === focusCardId : card.id === 3}
        />
      ))}

      <footer className="mt-[30px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
        Semua wawasan di sini terkurasi &amp; terverifikasi dari teks — bukan karangan AI. Kartu berlabel &quot; konteks belum dicek&quot; buktinya sudah terverifikasi mesin, tetapi pendalaman tafsirnya masih antre diteliti.
        <button onClick={() => onNavigate('metodologi')} className="block mt-[6px] bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0">
          Metodologi &amp; Sumber →
        </button>
      </footer>
    </div>
  )
}
