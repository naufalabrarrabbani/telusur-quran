'use client'

import { useState, useEffect, useMemo } from 'react'
import { StatusMarker } from '@/components/ui/StatusMarker'
import { search, searchExact, type Verse, type WordIndex } from '@/lib/search'
import { loadData } from '@/lib/data'

const AKHIRAT_FORMS = ['الآخرة', 'بالآخرة', 'والآخرة', 'وللآخرة', 'وبالآخرة', 'للآخرة']

interface CekKlaimScreenProps {
  onNavigate: (screen: string) => void
  onSearch?: (query: string) => void
}

export function CekKlaimScreen({ onNavigate, onSearch }: CekKlaimScreenProps) {
  const [adamMode, setAdamMode] = useState<'exact' | 'contains'>('contains')
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

  // Real data: Adam & Isa counts
  const adamResult = useMemo(() => {
    if (!verses || !wordIndex) return null
    return search('adam', adamMode, verses, wordIndex)
  }, [adamMode, verses, wordIndex])
  const isaResult = useMemo(() => {
    if (!verses || !wordIndex) return null
    return search('isa', adamMode, verses, wordIndex)
  }, [adamMode, verses, wordIndex])

  const adamN = adamResult?.totalCount ?? 0
  const isaN = isaResult?.totalCount ?? 0
  const isSama = adamN === isaN

  // Real data: Setan (lemma)
  const setanResult = useMemo(() => {
    if (!verses || !wordIndex) return null
    return search('setan', 'lemma', verses, wordIndex)
  }, [verses, wordIndex])

  // Real data: Musa
  const musaContains = useMemo(() => {
    if (!verses || !wordIndex) return null
    return search('musa', 'contains', verses, wordIndex)
  }, [verses, wordIndex])
  const musaExact = useMemo(() => {
    if (!verses || !wordIndex) return null
    return search('musa', 'exact', verses, wordIndex)
  }, [verses, wordIndex])

  // Real data: Dunia = Akhirat — keluarga kata al-akhirah dihitung per bentuk
  const duniaExact = useMemo(() => {
    if (!verses || !wordIndex) return null
    return search('dunia', 'exact', verses, wordIndex)
  }, [verses, wordIndex])
  const akhiratForms = useMemo(() => {
    if (!verses || !wordIndex) return null
    return AKHIRAT_FORMS.map((form) => ({ form, count: searchExact(form, verses, wordIndex).count }))
  }, [verses, wordIndex])
  const akhiratFamily = akhiratForms?.reduce((a, f) => a + f.count, 0) ?? 0

  if (loading || !verses || !wordIndex) {
    return (
      <div>
        <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Cek Klaim</h2>
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-ink-3 font-semibold">Memuat data Qur&apos;an...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Cek Klaim</h2>
      <p className="mb-[18px] text-[13px] leading-[1.6] text-ink-3">
        Pola-pola angka yang beredar di media sosial — dicek ulang pakai teks aslinya. Setiap kartu menampilkan aturan hitungnya.
      </p>

      {/* Adam = Isa */}
      <article className="bg-surface border border-line rounded-[6px] p-4 mb-[10px]">
        <div className="flex justify-between items-start gap-2">
          <h3 className="m-0 text-[16px] font-extrabold leading-[1.35]">Adam = Isa?</h3>
          <StatusMarker status="bersyarat" label="LOLOS BERSYARAT" />
        </div>
        <p className="mt-[6px] mb-0 text-[13px] leading-[1.6] text-ink-3">
          Katanya dua nama ini disebut sama banyak. Bener nggak? Coba ganti aturan hitungnya:
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[6px] mt-4 mb-1 text-center">
          <div>
            <div className="text-[44px] font-extrabold tracking-[-0.04em] leading-none text-emerald-deep transition-colors duration-150">
              {adamN}
            </div>
            <div className="text-[12px] font-bold text-ink-4 mt-1">
              Adam · <span style={{ fontFamily: 'Amiri, serif', fontSize: '14px', direction: 'rtl', unicodeBidi: 'isolate' }}>آدم</span>
            </div>
          </div>
          <div className="text-[11px] font-extrabold text-ink-4 border border-line rounded-[4px] w-8 h-8 grid place-items-center">VS</div>
          <div>
            <div className="text-[44px] font-extrabold tracking-[-0.04em] leading-none text-emerald-deep transition-colors duration-150">
              {isaN}
            </div>
            <div className="text-[12px] font-bold text-ink-4 mt-1">
              Isa · <span style={{ fontFamily: 'Amiri, serif', fontSize: '14px', direction: 'rtl', unicodeBidi: 'isolate' }}>عيسى</span>
            </div>
          </div>
        </div>
        <div className={`text-center text-[17px] font-extrabold tracking-[0.01em] mt-2 mb-[2px] min-h-[24px] transition-colors duration-150 ${isSama ? 'text-green' : 'text-red'}`}>
          {isSama ? 'SAMA! ✓' : 'NGGAK SAMA ✕'}
        </div>
        <div className="flex bg-paper-warm border border-line rounded-[6px] p-[3px] gap-[3px] mt-3" role="group" aria-label="Mode hitung Adam Isa">
          <button
            onClick={() => setAdamMode('exact')}
            className={`flex-1 text-[13px] font-bold py-2 px-[6px] rounded-[4px] border-none cursor-pointer transition-all duration-[120ms] ${
              adamMode === 'exact' ? 'bg-emerald-deep text-white' : 'bg-transparent text-ink-3'
            }`}
          >
            Kata Persis
          </button>
          <button
            onClick={() => setAdamMode('contains')}
            className={`flex-1 text-[13px] font-bold py-2 px-[6px] rounded-[4px] border-none cursor-pointer transition-all duration-[120ms] ${
              adamMode === 'contains' ? 'bg-emerald-deep text-white' : 'bg-transparent text-ink-3'
            }`}
          >
            + Awalan
          </button>
        </div>
        <p className="mt-2 mb-0 text-[12px] leading-[1.6] text-ink-4 text-center">
          Hasilnya tergantung aturan hitung — makanya di sini aturan selalu ditampilkan.
        </p>
      </article>

      {/* Setan */}
      <article className="bg-surface border border-line rounded-[6px] p-4 mb-[10px]">
        <div className="flex justify-between items-start gap-2">
          <h3 className="m-0 text-[16px] font-extrabold leading-[1.35]">Setan disebut {setanResult?.totalCount ?? '...'} kali</h3>
          <StatusMarker status="lolos" label="LOLOS" />
        </div>
        <div className="flex items-baseline gap-[10px] mt-3">
          <span className="text-[36px] font-extrabold tracking-[-0.03em] text-emerald-deep leading-none">{setanResult?.totalCount ?? '...'}×</span>
          <span className="text-[13px] text-ink-3 font-semibold leading-[1.45]">
            Mode <strong>Lemma</strong> — semua bentuk kata شيطان
          </span>
        </div>
        <button
          onClick={() => onSearch ? onSearch('setan') : onNavigate('beranda')}
          className="mt-3 w-full text-[13px] font-bold bg-transparent text-emerald border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald"
        >
          Lihat ayat-ayatnya →
        </button>
      </article>

      {/* Musa 136x */}
      <article className="bg-surface border border-line rounded-[6px] p-4 mb-[10px]">
        <div className="flex justify-between items-start gap-2">
          <h3 className="m-0 text-[16px] font-extrabold leading-[1.35]">Musa: nama paling sering disebut</h3>
          <StatusMarker status="bersyarat" label="LOLOS BERSYARAT" />
        </div>
        <div className="flex items-baseline gap-[10px] mt-3">
          <span className="text-[36px] font-extrabold tracking-[-0.03em] text-emerald-deep leading-none">{musaContains?.totalCount ?? '...'}×</span>
          <span className="text-[13px] text-ink-3 font-semibold leading-[1.45]">
            Benar jika dihitung <strong>termasuk awalan</strong> (و / ل / ب). Kata persisnya: <strong>{musaExact?.totalCount ?? '...'}×</strong>.
          </span>
        </div>
      </article>

      {/* Dunia = Akhirat */}
      <article className="bg-surface border border-line rounded-[6px] p-4 mb-[10px]">
        <div className="flex justify-between items-start gap-2">
          <h3 className="m-0 text-[16px] font-extrabold leading-[1.35]">Dunia = Akhirat, 115 = 115?</h3>
          <StatusMarker status="bersyarat" label="LOLOS BERSYARAT" />
        </div>
        <div className="flex items-baseline gap-[10px] mt-3">
          <span className="text-[36px] font-extrabold tracking-[-0.03em] text-emerald-deep leading-none">
            {duniaExact?.totalCount ?? '...'} <span className="text-gold text-[24px]">=</span> {akhiratForms ? akhiratFamily : '...'}
          </span>
        </div>
        <p className="mt-[6px] mb-0 text-[13px] leading-[1.6] text-ink-3">
          Benar — dengan syarat yang dinyatakan terbuka. Kata <em>ad-dunya</em> hanya punya satu bentuk ({duniaExact?.totalCount ?? '...'}×). Kata <em>al-akhirah</em> kata persisnya hanya {akhiratForms?.[0]?.count ?? '...'}×; angka 115 tercapai bila <strong>seluruh keluarga katanya</strong> (6 bentuk berawalan) dihitung. Rinciannya, dihitung live dari indeks yang sama:
        </p>
        {akhiratForms && (
          <div className="mt-[10px]">
            {akhiratForms.map((f) => (
              <div key={f.form} className="flex justify-between items-baseline gap-[10px] py-[6px] border-b border-line-soft last:border-b-0 text-[13px] text-ink-2 font-semibold">
                <span style={{ fontFamily: 'Amiri, serif', fontSize: '16px', direction: 'rtl', unicodeBidi: 'isolate' }}>{f.form}</span>
                <span className="font-extrabold text-ink whitespace-nowrap tabular-nums">{f.count}×</span>
              </div>
            ))}
          </div>
        )}
        {onSearch && (
          <button
            onClick={() => onSearch('akhirat')}
            className="mt-3 w-full text-[13px] font-bold bg-transparent text-emerald border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald"
          >
            Cek sendiri → cari &quot;akhirat&quot;
          </button>
        )}
      </article>

      {/* Hari 365 */}
      <article className="bg-surface border border-line rounded-[6px] p-4 mb-[10px]">
        <div className="flex justify-between items-start gap-2">
          <h3 className="m-0 text-[16px] font-extrabold leading-[1.35]">Kata &quot;hari&quot; disebut 365 kali</h3>
          <StatusMarker status="kontested" label="KONTESTED" />
        </div>
        <p className="mt-[6px] mb-0 text-[13px] leading-[1.6] text-ink-3">
          Klaim populer yang sensitif cara hitung — hasilnya berubah tergantung bentuk kata mana saja yang ikut dihitung. Kartu ini tetap ditampilkan supaya publik bisa menilai sendiri.
        </p>
      </article>

      <button
        onClick={() => onNavigate('metodologi')}
        className="mt-1 w-full text-[13px] font-bold bg-transparent text-emerald border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald"
      >
        Bagaimana kami menghitung &amp; memberi vonis? → Metodologi &amp; Sumber
      </button>
    </div>
  )
}
