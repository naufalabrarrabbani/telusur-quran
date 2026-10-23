'use client'

import { useState, useEffect, useMemo } from 'react'
import { VerseCard } from '@/components/ui/VerseCard'
import { UiIcon } from '@/components/ui/UiIcon'
import { loadData, getVerse } from '@/lib/data'
import { search, type Verse, type WordIndex } from '@/lib/search'
import { ENTITIES, ENTITY_TYPES, type EntityData } from '@/lib/entities-data'

interface GrafScreenProps {
  onSearch?: (query: string) => void
}

const MAX_NEIGHBORS = 8
const PANEL_VERSES = 3

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

  // Verse sets per entity (mode CONTAINS)
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

  // Example shared verse for the TOP neighbor
  const sharedExample = useMemo(() => {
    if (!verseSets || neighbors.length === 0) return null
    const topNeighbor = neighbors[0]
    const centerSet = verseSets.get(centerId)!
    const neighborSet = verseSets.get(topNeighbor.entity.id)!
    const shared: number[] = []
    for (const id of centerSet) if (neighborSet.has(id)) shared.push(id)
    shared.sort((a, b) => a - b)
    if (shared.length === 0) return null
    const vid = shared[0]
    const v = getVerse(verses!, vid)
    if (!v) return null
    return { verse: v, neighbor: topNeighbor.entity }
  }, [verseSets, neighbors, centerId, verses])

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

  const maxShared = neighbors[0]?.shared ?? 1
  const totalCoOccur = neighbors.reduce((sum, n) => sum + n.shared, 0)

  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Graf Entitas</h2>

      {/* Explainer */}
      <div className="bg-paper-warm border border-line rounded-[6px] p-[14px] my-[10px_18px] text-[13px] leading-[1.6] text-ink-2">
        <p className="m-0 mb-2">
          Tokoh, kaum, tempat, dan tema yang <strong className="text-ink font-extrabold">muncul bareng dalam satu ayat</strong>. Pilih satu, lalu lihat siapa saja yang sering diceritakan bersamanya.
        </p>
        {neighbors.length > 0 && (
          <div className="flex items-center gap-[10px] mt-[10px] py-[10px] px-[12px] bg-surface rounded-[4px] text-[12.5px]">
            <span>
              <strong className="text-emerald font-extrabold">{center.nama}</strong> &amp;{' '}
              <strong className="text-emerald font-extrabold">{neighbors[0].entity.nama}</strong>
            </span>
            <span className="text-ink-4 shrink-0">muncul bareng di</span>
            <span>
              <strong className="text-emerald font-extrabold">{neighbors[0].shared} ayat</strong>
            </span>
          </div>
        )}
      </div>

      {/* Center entity header */}
      <div className="flex justify-between items-baseline px-[2px] pb-[10px] border-b border-line-soft mb-[12px]">
        <div>
          <div className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-ink-4">Pusat Pilihanmu</div>
          <div className="text-[24px] font-extrabold tracking-[-0.015em] text-emerald-deep leading-tight">{center.nama}</div>
        </div>
        <div className="text-[11px] font-semibold text-ink-4">{center.tipe}</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-[6px] mt-[14px] mb-[10px]">
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
      <p className="text-[13px] leading-[1.65] text-ink-3 m-0">{center.deskripsi}</p>
      <p className="mt-2 mb-0 text-[12px] text-ink-4">
        Muncul di <strong className="text-ink-3">{centerStats.ayatCount} ayat</strong> dalam <strong className="text-ink-3">{centerStats.surahCount} surah</strong> (mode + Awalan).
      </p>

      {/* "Sering muncul bareng" — the main actionable list */}
      <div className="flex items-baseline justify-between mt-[22px] mb-[10px] pb-[8px] border-b border-line-soft">
        <h3 className="m-0 text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Sering Muncul Bareng</h3>
        <span className="text-[11px] font-semibold text-ink-4">{neighbors.length} entitas · urut per ayat sama</span>
      </div>

      {neighbors.length === 0 ? (
        <p className="text-[12.5px] text-ink-4 py-4 text-center">
          Belum ada entitas lain yang muncul di ayat yang sama dengan {center.nama}.
        </p>
      ) : (
        neighbors.map((n) => (
          <button
            key={n.entity.id}
            onClick={() => {
              setCenterId(n.entity.id)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="w-full grid grid-cols-[1fr_auto] items-center gap-[10px] bg-surface border border-line rounded-[6px] py-[12px] px-[14px] mb-[8px] cursor-pointer hover:border-emerald transition-colors duration-120 text-left"
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 mb-[6px]">
                <span className="text-[14px] font-extrabold text-ink tracking-[-0.01em]">{n.entity.nama}</span>
                <span className="text-[10px] font-bold tracking-[0.06em] uppercase text-ink-4">{n.entity.tipe}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[5px] bg-line rounded-[3px] overflow-hidden">
                  <div
                    className="h-full rounded-[3px] bg-[linear-gradient(90deg,var(--color-emerald),var(--color-green))]"
                    style={{ width: `${Math.max(6, Math.round((n.shared / maxShared) * 100))}%` }}
                  />
                </div>
                <span className="text-[12px] font-extrabold text-emerald-deep whitespace-nowrap tabular-nums">
                  {n.shared} ayat
                </span>
              </div>
            </div>
            <UiIcon name="forward-grey" size={14} />
          </button>
        ))
      )}

      {/* Example shared verse — makes "co-occurrence" concrete */}
      {sharedExample && (
        <div className="mt-[18px]">
          <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] uppercase text-gold mb-[8px]">
            Contoh ayat bareng · {center.nama} &amp; {sharedExample.neighbor.nama}
            <span className="flex-1 h-px bg-line" />
          </div>
          <VerseCard
            surah={`QS ${sharedExample.verse.surah_name_latin}`}
            ayahRef={`${sharedExample.verse.surah_no}:${sharedExample.verse.ayah_no}`}
            juz={sharedExample.verse.makkiyah ? 'Makkiyah' : 'Madaniyah'}
            arabic={sharedExample.verse.text_uthmani}
            translation={sharedExample.verse.translation_id}
          />
        </div>
      )}

      {/* Mini visual graph — secondary, as supplement */}
      {neighbors.length > 0 && (
        <div className="bg-surface border border-line rounded-[6px] p-[12px] mt-[20px]">
          <div className="flex justify-between items-center mb-[8px] text-[10px] font-extrabold tracking-[0.08em] uppercase text-gold">
            <span>Peta Visual</span>
            <span className="font-semibold text-ink-4 tracking-[0.02em] normal-case text-[11px]">
              Lebih tebal = lebih sering bareng
            </span>
          </div>
          <div className="relative h-[220px] w-full">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {neighbors.map((n, i) => {
                const angle = (i / neighbors.length) * Math.PI * 2 - Math.PI / 2
                const x = 50 + 37 * Math.cos(angle)
                const y = 48 + 40 * Math.sin(angle)
                const opacity = 0.14 + Math.min(0.5, (n.shared / maxShared) * 0.5)
                return (
                  <line
                    key={n.entity.id}
                    x1={50}
                    y1={48}
                    x2={x}
                    y2={y}
                    stroke="#1A6B4A"
                    strokeOpacity={opacity}
                    strokeWidth={1.5 + (n.shared / maxShared) * 1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                )
              })}
            </svg>

            {/* Center node */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 bg-emerald-deep border-[1.5px] border-emerald-deep text-white text-[13px] font-extrabold py-[10px] px-[14px] rounded-[4px] text-center shadow-[0_4px_12px_rgba(15,68,48,0.2)] z-[2] max-w-[130px]"
              style={{ left: '50%', top: '48%' }}
            >
              {center.nama}
              <span className="block text-[10px] font-semibold text-white/65 mt-[2px]">{center.tipe}</span>
            </div>

            {neighbors.map((n, i) => {
              const angle = (i / neighbors.length) * Math.PI * 2 - Math.PI / 2
              const x = 50 + 37 * Math.cos(angle)
              const y = 48 + 40 * Math.sin(angle)
              return (
                <button
                  key={n.entity.id}
                  onClick={() => {
                    setCenterId(n.entity.id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[4px] text-center max-w-[108px] bg-paper-warm border border-line text-ink-2 text-[11px] font-bold leading-[1.25] py-[6px] px-[9px] transition-[border-color,color] duration-[120ms] hover:border-emerald hover:text-emerald whitespace-nowrap"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {n.entity.nama}
                  <span className="block text-[9px] font-bold text-ink-4 mt-[1px] tracking-[0.02em]">
                    {n.shared} ayat
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-[8px] mb-0 text-[11px] text-ink-4 text-center">
            {totalCoOccur} ayat bersama total · dihitung live dari teks
          </p>
        </div>
      )}

      {/* Example verses from the center */}
      <div className="mt-[22px]">
        <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] uppercase text-gold mb-[8px]">
          Beberapa ayat tentang {center.nama}
          <span className="flex-1 h-px bg-line" />
        </div>
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
      </div>

      {onSearch && (
        <button
          onClick={() => onSearch(center.id)}
          className="mt-3 w-full text-[13px] font-bold bg-emerald text-white border border-emerald rounded-[4px] py-[12px] cursor-pointer hover:bg-emerald-deep transition-colors duration-120"
        >
          Telusur semua {centerStats.contains} ayat {center.nama} →
        </button>
      )}

      {/* Ganti pusat */}
      <div className="mt-[26px] pt-[18px] border-t border-line-soft">
        <h3 className="m-0 mb-[10px] text-[14px] font-extrabold uppercase tracking-[0.02em] text-ink-3">Ganti Pusat</h3>
        {ENTITY_TYPES.map((tipe) => (
          <div key={tipe} className="mb-[14px]">
            <div className="text-[10px] font-extrabold tracking-[0.08em] uppercase text-ink-4 mb-[6px]">{tipe}</div>
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
                      ? 'text-[12px] font-bold rounded-[4px] px-3 py-[7px] cursor-pointer bg-emerald text-white border border-emerald'
                      : 'text-[12px] font-bold rounded-[4px] px-3 py-[7px] cursor-pointer bg-surface text-ink-2 border border-line hover:border-emerald hover:text-emerald transition-colors duration-120'
                  }
                >
                  {e.nama}
                </button>
              ))}
            </div>
          </div>
        ))}
        <footer className="mt-[20px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
          Daftar entitas &amp; deskripsinya dikurasi manual; yang dihitung mesin hanya daftar ayatnya, dari indeks kata yang sama dengan pencarian.
        </footer>
      </div>
    </div>
  )
}
