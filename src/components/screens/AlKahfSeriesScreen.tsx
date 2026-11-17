'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { StatusMarker } from '@/components/ui/StatusMarker'
import { VerseCard } from '@/components/ui/VerseCard'
import { UiIcon } from '@/components/ui/UiIcon'
import { loadData } from '@/lib/data'
import type { Verse } from '@/lib/search'
import { KAHF_TOPICS, type KahfTopic } from '@/lib/al-kahf-data'

interface AlKahfSeriesScreenProps {
  onBack: () => void
  /** Buka tab Baca di Surah 18, digulir ke ayat yang diminta. */
  onReadAyat: (surahNo: number, ayat: number) => void
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
      {children}
      <span className="flex-1 h-px bg-line" />
    </div>
  )
}

/* -------------------- Kartu daftar -------------------- */

function SeriesCard({
  topic,
  index,
  onOpen,
}: {
  topic: KahfTopic
  index: number
  onOpen: () => void
}) {
  return (
    <article
      onClick={onOpen}
      className="bg-surface border border-line rounded-[6px] overflow-hidden cursor-pointer transition-colors duration-100 hover:border-emerald"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={topic.image}
        alt={topic.imageAlt}
        width={960}
        height={540}
        loading="lazy"
        className="block w-full aspect-video object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-[8px]">
          <span className="text-[11px] font-extrabold tracking-[0.08em] text-ink-4 tabular-nums">
            KARTU {String(index + 1).padStart(2, '0')}
          </span>
          <StatusMarker status={topic.status} label={topic.statusShort} />
        </div>
        <h2 className="m-0 text-[16px] leading-[1.4] font-extrabold tracking-[-0.01em] text-ink">
          {topic.title}
        </h2>
        <p className="mt-[6px] mb-0 text-[13px] leading-[1.6] text-ink-3">
          {topic.tease}
        </p>
        <div className="flex justify-between items-center gap-2 border-t border-line-soft pt-[8px] mt-[12px] text-[11px] font-bold text-ink-4">
          <span className="min-w-0 truncate">{topic.reference}</span>
          <span className="inline-flex flex-none items-center gap-[4px] text-emerald">
            Lihat breakdown <UiIcon name="forward-emerald" size={12} />
          </span>
        </div>
      </div>
    </article>
  )
}

/* -------------------- Drawer breakdown -------------------- */

function DetailDrawer({
  card,
  verses,
  onClose,
  onSelectTopic,
  onRead,
}: {
  card: KahfTopic
  verses: Verse[] | null
  onClose: () => void
  onSelectTopic: (id: number) => void
  onRead: (ayat: number) => void
}) {
  const [mounted, setMounted] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Pindah kartu terkait: gulir sheet kembali ke atas.
  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 })
  }, [card.id])

  const ayatVerses = useMemo(() => {
    if (!verses || card.ayat.length === 0) return []
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

  const relatedTopics = card.related
    .map((id) => KAHF_TOPICS.find((t) => t.id === id))
    .filter((t): t is KahfTopic => Boolean(t))

  const drawerNode = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 drawer-overlay"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="w-full sm:max-w-[500px] bg-paper rounded-t-[12px] sm:rounded-[12px] overflow-y-auto drawer-sheet max-h-[92vh]"
        // dvh, BUKAN vh: di iOS Safari satuan vh diukur dari viewport terbesar
        // (termasuk area di balik toolbar), jadi sheet 92vh bisa lebih tinggi
        // dari area terlihat dan header sticky + tombol close-nya terdorong
        // keluar layar ke atas. dvh selalu mengikuti viewport yang terlihat.
        style={{ maxHeight: '92dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-paper/95 backdrop-blur-sm border-b border-line-soft px-4 py-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-extrabold tracking-[0.1em] text-emerald uppercase">
            Seri Al-Kahf · Kartu {String(card.id).padStart(2, '0')}
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt={card.imageAlt}
            width={960}
            height={540}
            className="block w-full aspect-video object-cover rounded-[6px]"
          />

          <div className="mt-3 mb-3">
            <StatusMarker status={card.status} label={card.statusLabel} />
          </div>
          <h2 className="m-0 text-[22px] font-extrabold leading-[1.3] tracking-[-0.015em] text-ink">
            {card.title}
          </h2>
          <p className="mt-[10px] mb-0 text-[14px] leading-[1.6] font-semibold text-ink-2">
            {card.tease}
          </p>

          <div className="mt-[22px]">
            <SectionTitle>Breakdown</SectionTitle>
            <div className="space-y-[14px]">
              {card.beats.map((beat, i) => (
                <div key={beat.title} className="flex gap-[10px]">
                  <span className="flex-none w-[24px] h-[24px] rounded-[4px] bg-emerald/8 text-emerald text-[12px] font-extrabold grid place-items-center tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-[14px] leading-[1.5] font-bold text-ink">
                      {beat.title}
                    </p>
                    <p className="mt-[3px] mb-0 text-[13px] leading-[1.7] text-ink-3">
                      {beat.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {card.ayat.length > 0 && (
            <div className="mt-[22px]">
              <SectionTitle>Ayatnya · Dari Dataset</SectionTitle>
              {verses ? (
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
              )}
            </div>
          )}

          <div className="mt-[22px]">
            <SectionTitle>Detail yang sering lewat</SectionTitle>
            <p className="m-0 text-[14px] leading-[1.65] font-bold text-ink bg-gold/8 border-l-[3px] border-l-gold rounded-r-[6px] p-[13px_14px]">
              {card.detail}
            </p>
          </div>

          <div className="mt-[22px]">
            <SectionTitle>Status</SectionTitle>
            <p className="m-0 text-[13px] leading-[1.7] text-ink-3">{card.statusNote}</p>
            <p className="mt-[8px] mb-0 text-[11px] leading-[1.6] text-ink-4">
              Rujukan: {card.reference}
            </p>
          </div>

          <div className="mt-[22px]">
            <SectionTitle>Pertanyaan penutup</SectionTitle>
            <p className="m-0 text-[15px] leading-[1.65] font-bold text-ink">
              {card.closing}
            </p>
          </div>

          <div className="mt-[22px]">
            <button
              onClick={() => onRead(card.readAyat)}
              className="w-full inline-flex items-center justify-center gap-[6px] text-[13px] font-bold bg-emerald text-white border border-emerald rounded-[4px] py-[11px] cursor-pointer hover:bg-emerald-deep transition-colors"
            >
              {card.readLabel} · QS 18 <UiIcon name="forward-white" size={13} />
            </button>
          </div>

          {relatedTopics.length > 0 && (
            <div className="mt-[18px]">
              <p className="m-0 mb-[8px] text-[11px] font-extrabold tracking-[0.08em] text-ink-4 uppercase">
                Kartu terkait
              </p>
              <div className="flex flex-wrap gap-[7px]">
                {relatedTopics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTopic(t.id)}
                    className="text-[13px] font-semibold text-ink-2 bg-paper-warm border border-line rounded-[4px] py-[7px] px-3 cursor-pointer transition-[border-color,color] duration-[120ms] hover:border-gold hover:text-gold"
                  >
                    {String(t.id).padStart(2, '0')} · {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}
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

/* -------------------- Layar seri -------------------- */

export function AlKahfSeriesScreen({ onBack, onReadAyat }: AlKahfSeriesScreenProps) {
  const [verses, setVerses] = useState<Verse[] | null>(null)
  const [openTopicId, setOpenTopicId] = useState<number | null>(null)

  useEffect(() => {
    loadData().then((data) => {
      setVerses(data.verses)
    })
  }, [])

  const openTopic = useMemo(
    () => (openTopicId != null ? KAHF_TOPICS.find((t) => t.id === openTopicId) ?? null : null),
    [openTopicId]
  )

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-[6px] bg-transparent border-0 p-0 text-[13px] font-bold text-emerald cursor-pointer"
      >
        <span aria-hidden="true">←</span> Beranda
      </button>

      <header className="mb-5">
        <p className="m-0 text-[10px] font-extrabold tracking-[0.12em] uppercase text-emerald">
          Seri Al-Kahf
        </p>
        <h1 className="mt-1 mb-2 text-[22px] leading-[1.3] font-extrabold tracking-[-0.02em] text-ink">
          Masuk Gua: Al-Kahf, dibaca pelan-pelan.
        </h1>
        <p className="m-0 text-[13px] leading-[1.65] text-ink-3">
          Satu surah, empat kisah, dan detail-detail yang mengajak kita kembali
          ke ayatnya. Ketuk kartu untuk buka breakdown-nya. Status kartu
          menunjukkan bagian yang masih perlu ditinjau.
        </p>
      </header>

      <div className="space-y-[14px]">
        {KAHF_TOPICS.map((topic, index) => (
          <SeriesCard
            key={topic.id}
            topic={topic}
            index={index}
            onOpen={() => setOpenTopicId(topic.id)}
          />
        ))}
      </div>

      <footer className="mt-5 border-t border-line-soft pt-[12px] text-[11px] leading-[1.6] text-ink-4">
        Kartu “Bersyarat” wajib ditinjau Dosen sebelum tayang. Teks ayat tidak
        ditulis ulang di sini; rujukan ayat mengarah ke dataset aplikasi.
      </footer>

      {openTopic && (
        <DetailDrawer
          card={openTopic}
          verses={verses}
          onClose={() => setOpenTopicId(null)}
          onSelectTopic={setOpenTopicId}
          onRead={(ayat) => {
            setOpenTopicId(null)
            onReadAyat(18, ayat)
          }}
        />
      )}
    </div>
  )
}
