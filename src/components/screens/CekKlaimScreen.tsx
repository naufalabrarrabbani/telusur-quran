'use client'

import { useState } from 'react'
import { StatusMarker } from '@/components/ui/StatusMarker'

interface CekKlaimScreenProps {
  onNavigate: (screen: string) => void
}

export function CekKlaimScreen({ onNavigate }: CekKlaimScreenProps) {
  const [adamMode, setAdamMode] = useState<'exact' | 'contains'>('contains')
  const [verifyClicked, setVerifyClicked] = useState(false)

  const adamN = adamMode === 'exact' ? 20 : 25
  const isaN = adamMode === 'exact' ? 16 : 25
  const isSama = adamMode === 'contains'

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

      {/* Setan 88x */}
      <article className="bg-surface border border-line rounded-[6px] p-4 mb-[10px]">
        <div className="flex justify-between items-start gap-2">
          <h3 className="m-0 text-[16px] font-extrabold leading-[1.35]">Setan disebut 88 kali</h3>
          <StatusMarker status="lolos" label="LOLOS" />
        </div>
        <div className="flex items-baseline gap-[10px] mt-3">
          <span className="text-[36px] font-extrabold tracking-[-0.03em] text-emerald-deep leading-none">88×</span>
          <span className="text-[13px] text-ink-3 font-semibold leading-[1.45]">
            Mode <strong>Lemma</strong> — 70 bentuk tunggal + 18 bentuk jamak <span style={{ fontFamily: 'Amiri, serif', fontSize: '15px', direction: 'rtl', unicodeBidi: 'isolate' }}>شياطين</span>
          </span>
        </div>
        <button
          onClick={() => onNavigate('hasil-cari')}
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
          <span className="text-[36px] font-extrabold tracking-[-0.03em] text-emerald-deep leading-none">136×</span>
          <span className="text-[13px] text-ink-3 font-semibold leading-[1.45]">
            Benar jika dihitung <strong>termasuk awalan</strong> (و / ل / ب). Kata persisnya: <strong>129×</strong>.
          </span>
        </div>
      </article>

      {/* Dunia = Akhirat */}
      <article className="bg-surface border border-line rounded-[6px] p-4 mb-[10px] opacity-55">
        <div className="flex justify-between items-start gap-2">
          <h3 className="m-0 text-[16px] font-extrabold leading-[1.35]">Dunia = Akhirat, 115 = 115?</h3>
          <StatusMarker status="belum" label="BELUM DICEK" />
        </div>
        <p className="mt-[6px] mb-0 text-[13px] leading-[1.6] text-ink-3">
          Klaim populer: kata <em>ad-dunya</em> dan <em>al-akhirah</em> disebut sama-sama 115 kali. Curiga sensitif mode hitung — belum kami verifikasi.
        </p>
        <button
          onClick={() => setVerifyClicked(true)}
          disabled={verifyClicked}
          className={`mt-3 w-full text-[13px] font-bold bg-transparent border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] ${
            verifyClicked ? 'border-green text-green' : 'text-emerald hover:border-emerald'
          }`}
        >
          {verifyClicked ? '✓ Masuk antrean verifikasi' : 'Minta verifikasi'}
        </button>
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
    </div>
  )
}
