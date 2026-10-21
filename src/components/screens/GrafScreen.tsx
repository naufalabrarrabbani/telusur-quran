'use client'

import { useState, useEffect, useMemo } from 'react'
import { VerseCard } from '@/components/ui/VerseCard'
import { loadData, getVerse } from '@/lib/data'
import { search, type Verse, type WordIndex } from '@/lib/search'
import { ENTITIES, ENTITY_TYPES, type EntityData } from '@/lib/entities-data'

interface GrafScreenProps {
  onSearch?: (query: string) => void
}

const MAX_NEIGHBORS = 8
const PANEL_VERSES = 5

export function GrafScreen({ onSearch }: GrafScreenProps) {
  const [centerId, setCenterId] = useState('musa')
  const [verses, setVerses] = useState<Verse[] | null>(null)
  const [wordIndex, setWordIndex] = useState<WordIndex | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData().then((data) => {
      setVerses(data.verses)
      setWordIndex(data.wordIndex)
      setLoading(false)
    })
  }, [])

  // Verse sets per entity (mode CONTAINS) — fondasi ko-okurensi
  const verseSets = useMemo(() => {
    if (!verses || !wordIndex) return null
    const map = new Map<string, Set<number>>()
    for (const e of ENTITIES) {
      map.set(e.id, new Set(search(e.id, 'contains', verses, wordIndex).verseIds))
    }
    return map
  }, [verses, wordIndex])

  const center: EntityData = ENTITIES.find((e) => e.id === centerId) ?? ENTITIES[0]

  const neighbors = useMemo(() => {
    if (!verseSets) return []
    const centerSet = verseSets.get(centerId)
    if (!centerSet) return []
    const scored = ENTITIES.filter((e) => e.id !== centerId)
      .map((e) => {
        const set = verseSets.get(e.id)!
        let shared = 0
        for (const id of set) if (centerSet.has(id)) shared++
        return { entity: e, shared }
      })
      .filter((n) => n.shared > 0)
      .sort((a, b) => b.shared - a.shared)
    const strong = scored.filter((n) => n.shared >= 2)
    return (strong.length >= 3 ? strong : scored).slice(0, MAX_NEIGHBORS)
  }, [verseSets, centerId])

  const centerStats = useMemo(() => {
    if (!verses || !wordIndex || !verseSets) return null
    const exact = search(centerId, 'exact', verses, wordIndex).totalCount
    const contains = search(centerId, 'contains', verses, wordIndex).totalCount
    const lemma = search(centerId, 'lemma', verses, wordIndex).totalCount
    const ids = verseSets.get(centerId)!
    const surahs = new Set<number>()
    for (const id of ids) {
      const v = getVerse(verses, id)
      if (v) surahs.add(v.surah_no)
    }
    return { exact, contains, lemma, ayatCount: ids.size, surahCount: surahs.size, firstIds: [...ids].sort((a, b) => a - b).slice(0, PANEL_VERSES) }
  }, [verses, wordIndex, verseSets, centerId])

  if (loading || !verses || !wordIndex || !verseSets || !centerStats) {
    return (
      <div>
        <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Graf Entitas</h2>
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-ink-3 font-semibold">Memuat data Qur&apos;an...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Graf Entitas</h2>
      <p className="mb-[18px] text-[13px] leading-[1.6] text-ink-3">
        Tokoh, kaum, tempat, dan tema yang muncul bersama dalam ayat yang sama — digambar sebagai peta. Dua simpul terhubung bila berbagi ayat (mode + Awalan); makin banyak ayat bersamanya, makin kuat garisnya. Ketuk simpul untuk menjadikannya pusat.
      </p>

      {/* Graph */}
      <div className="relative bg-surface border border-line rounded-[6px] h-[380px] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {neighbors.map((n, i) => {
            const angle = (i / neighbors.length) * Math.PI * 2 - Math.PI / 2
            const x = 50 + 37 * Math.cos(angle)
            const y = 48 + 40 * Math.sin(angle)
            return (
              <line
                key={n.entity.id}
                x1={50} y1={48} x2={x} y2={y}
                stroke="#1A6B4A"
                strokeOpacity={0.14 + Math.min(0.45, n.shared / 30)}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        {/* Center node */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 bg-emerald-deep border-[1.5px] border-emerald-deep text-white text-[14px] font-extrabold p-[12px_18px] rounded-[4px] text-center shadow-[0_4px_18px_rgba(15,68,48,0.2)] z-[2] max-w-[150px]"
          style={{ left: '50%', top: '48%' }}
        >
          {center.nama}
          <span className="block text-[10px] font-semibold text-white/60 mt-[2px]">{center.tipe}</span>
        </div>

        {/* Neighbor nodes */}
        {neighbors.map((n, i) => {
          const angle = (i / neighbors.length) * Math.PI * 2 - Math.PI / 2
          const x = 50 + 37 * Math.cos(angle)
          const y = 48 + 40 * Math.sin(angle)
          return (
            <button
              key={n.entity.id}
              onClick={() => setCenterId(n.entity.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[4px] text-center max-w-[118px] bg-paper-warm border border-line text-ink-2 text-[12px] font-bold leading-[1.25] p-[8px_10px] transition-[border-color,color,box-shadow] duration-[120ms] hover:border-emerald hover:text-emerald"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {n.entity.nama}
              <span className="block text-[10px] font-semibold text-ink-4 mt-[2px]">{n.shared} ayat sama</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 mb-0 text-[12px] text-ink-4 text-center">
        {neighbors.length} entitas berbagi ayat dengan {center.nama}. Daftar ayat &amp; keterkaitan dihitung live dari teks — bukan gambar statis.
      </p>

      {/* Entity panel */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between mt-1 mb-[10px] pb-2 border-b border-line-soft">
          <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">{center.nama}</h2>
          <span className="text-[11px] font-extrabold tracking-[0.04em] text-ink-4 uppercase">Entitas · {center.tipe}</span>
        </div>
        <p className="m-0 text-[13px] leading-[1.65] text-ink-3">{center.deskripsi}</p>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-paper-warm border border-line rounded-[6px] p-[10px] text-center">
            <div className="text-[20px] font-extrabold text-emerald-deep leading-none">{centerStats.exact}×</div>
            <div className="text-[10px] font-bold text-ink-4 mt-[4px] uppercase tracking-[0.04em]">Kata Persis</div>
          </div>
          <div className="bg-paper-warm border border-line rounded-[6px] p-[10px] text-center">
            <div className="text-[20px] font-extrabold text-emerald-deep leading-none">{centerStats.contains}×</div>
            <div className="text-[10px] font-bold text-ink-4 mt-[4px] uppercase tracking-[0.04em]">+ Awalan</div>
          </div>
          <div className="bg-paper-warm border border-line rounded-[6px] p-[10px] text-center">
            <div className="text-[20px] font-extrabold text-emerald-deep leading-none">{centerStats.lemma}×</div>
            <div className="text-[10px] font-bold text-ink-4 mt-[4px] uppercase tracking-[0.04em]">Lemma</div>
          </div>
        </div>
        <p className="mt-2 mb-0 text-[12px] text-ink-4">
          Muncul di <strong className="text-ink-3">{centerStats.ayatCount} ayat</strong> dalam <strong className="text-ink-3">{centerStats.surahCount} surah</strong> (mode + Awalan).
        </p>

        {centerStats.firstIds.map((id) => {
          const v = getVerse(verses, id)
          if (!v) return null
          return (
            <VerseCard
              key={id}
              surah={`QS ${v.surah_name_latin}`}
              ayahRef={`${v.surah_no}:${v.ayah_no}`}
              juz={v.makkiyah ? 'Makkiyah' : 'Madaniyah'}
              arabic={v.text_uthmani}
              translation={v.translation_id}
            />
          )
        })}

        {onSearch && (
          <button
            onClick={() => onSearch(center.id)}
            className="mt-3 w-full text-[13px] font-bold bg-transparent text-emerald border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald"
          >
            Telusur semua ayat {center.nama} →
          </button>
        )}
      </div>

      {/* Entity directory */}
      <div className="mt-[26px]">
        <div className="flex items-baseline justify-between mb-[10px] pb-2 border-b border-line-soft">
          <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Semua Entitas</h2>
          <span className="text-[12px] font-bold text-ink-4">{ENTITIES.length} entitas terkurasi</span>
        </div>
        {ENTITY_TYPES.map((tipe) => (
          <div key={tipe} className="mb-3">
            <div className="text-[11px] font-extrabold tracking-[0.06em] uppercase text-ink-4 mb-[6px]">{tipe}</div>
            <div className="flex flex-wrap gap-[6px]">
              {ENTITIES.filter((e) => e.tipe === tipe).map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setCenterId(e.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={
                    e.id === centerId
                      ? 'text-[12px] font-bold rounded-full px-3 py-[6px] cursor-pointer bg-emerald text-white border border-emerald'
                      : 'text-[12px] font-bold rounded-full px-3 py-[6px] cursor-pointer bg-transparent text-ink-3 border border-line hover:border-emerald hover:text-emerald'
                  }
                >
                  {e.nama}
                </button>
              ))}
            </div>
          </div>
        ))}
        <footer className="mt-[26px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
          Daftar entitas &amp; deskripsinya dikurasi manual dari kisah-kisah Al-Qur&apos;an; yang dihitung mesin hanya daftar ayatnya, dari indeks kata yang sama dengan pencarian. Angka tanpa label mode tidak ditampilkan di sini.
        </footer>
      </div>
    </div>
  )
}
