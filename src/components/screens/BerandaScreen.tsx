'use client'

import { StatusMarker } from '@/components/ui/StatusMarker'
import { UiIcon } from '@/components/ui/UiIcon'
import { usePwaInstall, promptPwaInstall, reopenPwaBanner } from '@/lib/pwa-install'

interface BerandaScreenProps {
  onNavigate: (screen: string) => void
  onSearch?: (query: string) => void
  /** Buka kartu Wawasan tertentu (Pintu Emosi) berdasarkan id kartunya */
  onEmotion?: (cardId: number) => void
}

// Tiap emosi menunjuk id kartu Wawasan yang ayatnya jadi jangkar:
// Galau -> Ad-Dhuha (id 3), Cemas -> 13:28, Sendirian -> 2:186,
// Takut Gagal -> 94:5-6, Bersyukur -> 14:7.
const emotions = [
  { label: 'GALAU', desc: 'Ngerasa ditinggal', icon: 'https://img.icons8.com/doodle/48/heart-with-arrow.png', cardId: 3 },
  { label: 'CEMAS', desc: 'Pikiran nggak berhenti', icon: 'https://img.icons8.com/doodle/48/brain.png', cardId: 31 },
  { label: 'SENDIRIAN', desc: 'Nggak ada yang ngerti', icon: 'https://img.icons8.com/doodle/48/ghost--v1.png', cardId: 32 },
  { label: 'TAKUT GAGAL', desc: 'Belum mulai udah ragu', icon: 'https://img.icons8.com/doodle/48/puzzle.png', cardId: 33 },
  { label: 'BERSYUKUR', desc: 'Lagi di titik yang baik', icon: 'https://img.icons8.com/doodle/48/pray.png', cardId: 34, wide: true },
]

const tags: { query: string; goto?: string; anchor?: string }[] = [
  { query: 'setan' },
  { query: 'sabar' },
  { query: 'Firaun' },
  { query: 'shalat' },
  { query: 'iblis' },
  // 'dunia vs akhirat' bukan kata kamus — sebagai pencarian mentah hasilnya
  // jalan buntu. Klaim ini rumahnya di Cek Klaim (sudah ada seksi khususnya
  // dengan syarat hitung yang dinyatakan terbuka), jadi chip ini menavigasi
  // ke sana dan menggulir langsung ke seksinya.
  { query: 'dunia vs akhirat', goto: 'cek-klaim', anchor: 'klaim-dunia-akhirat' },
]

export function BerandaScreen({ onNavigate, onSearch, onEmotion }: BerandaScreenProps) {
  const pwa = usePwaInstall()
  // Setelah banner install ditutup, opsi install pindah ke tombol kecil
  // pojok kanan atas sini — tidak hilang selamanya.
  const showInstallCorner = !pwa.installed && pwa.dismissed
  const handleInstallCorner = async () => {
    if (pwa.deferred) {
      await promptPwaInstall()
    } else {
      // iOS / prompt belum tersedia: tampilkan lagi banner instruksinya
      reopenPwaBanner()
    }
  }

  const handleSearch = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    if (onSearch) {
      onSearch(trimmed)
    }
  }

  return (
    <div>
      {/* Brand */}
      <div className="flex items-center gap-3 mt-1">
        <div className="w-[42px] h-[42px] flex-none rounded-[6px] grid place-items-center bg-emerald-deep text-gold-light">
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <circle cx={5} cy={12} r={2.2} fill="currentColor" stroke="none" />
            <circle cx={19} cy={5.5} r={2.2} fill="currentColor" stroke="none" />
            <circle cx={19} cy={18.5} r={2.2} fill="currentColor" stroke="none" />
            <path d="M7 11l9.8-4.4M7 13l9.8 4.4" />
          </svg>
        </div>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] leading-[1.15]">
            Telusur <span className="text-emerald">Qur&apos;an</span>
          </h1>
          <small className="block text-[10px] font-bold tracking-[0.12em] text-ink-4 mt-[1px] uppercase">by HijaLearn</small>
        </div>
        {showInstallCorner && (
          <button
            onClick={handleInstallCorner}
            className="ml-auto flex-none flex items-center gap-[5px] text-[11px] font-extrabold text-emerald-deep bg-emerald/8 border border-emerald/25 rounded-full px-[11px] py-[7px] cursor-pointer hover:border-emerald transition-colors"
            aria-label="Pasang Telusur Qur'an sebagai aplikasi"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11" />
              <path d="M7 11l5 5 5-5" />
              <path d="M4 20h16" />
            </svg>
            Instal App
          </button>
        )}
      </div>

      <p className="mt-[14px] text-[16px] leading-[1.6] text-ink-2 font-medium">
        Cari <strong className="text-ink font-bold">kata</strong>, <strong className="text-ink font-bold">tokoh</strong>, atau <strong className="text-ink font-bold">fakta</strong> — semua ayatnya ketemu.
      </p>

      {/* Emotion grid */}
      <h2 className="mt-[26px] mb-[3px] text-[18px] font-extrabold tracking-[-0.01em] text-ink">Lagi ngerasain apa?</h2>
      <p className="mb-3 text-[13px] leading-[1.55] text-ink-3">Masuk lewat perasaanmu — ada ayat yang pas buat tiap keadaan.</p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Pintu emosi">
        {emotions.map((e) => (
          <button
            key={e.label}
            onClick={() => (onEmotion ? onEmotion(e.cardId) : onNavigate('wawasan'))}
            className={`text-left text-[13px] font-bold text-ink-2 bg-surface border border-gold rounded-[6px] p-[14px_13px] cursor-pointer transition-[border-color,box-shadow] duration-[120ms] leading-[1.4] hover:border-gold hover:shadow-[0_2px_10px_rgba(158,124,26,0.1)] ${e.wide ? 'col-span-2' : ''}`}
          >
            <span className="block mb-2 w-8 h-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.icon} alt="" width={32} height={32} />
            </span>
            <span className="block text-[11px] text-ink-4 font-semibold mb-1 tracking-[0.04em]">{e.label}</span>
            {e.desc}
          </button>
        ))}
      </div>

      {/* Search */}
      <form
        className="flex items-center gap-[10px] bg-surface border-[1.5px] border-line rounded-[6px] p-[5px_5px_5px_14px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mt-[22px] focus-within:border-emerald transition-[border-color] duration-150"
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.querySelector('input') as HTMLInputElement
          handleSearch(input.value)
        }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="flex-none text-ink-4">
          <circle cx={11} cy={11} r={7} />
          <path d="M20 20l-3.8-3.8" />
        </svg>
        <input
          type="text"
          placeholder="Cari kata, tokoh, atau klaim..."
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-ink text-[15px] font-medium placeholder:text-ink-4"
        />
        <button type="submit" className="flex-none bg-emerald-deep text-white border-none rounded-[4px] text-[14px] font-bold py-[10px] px-4 cursor-pointer hover:bg-emerald active:scale-[0.97] transition-colors duration-[120ms]">
          Cari
        </button>
      </form>
      <div className="flex flex-wrap gap-[7px] mt-[10px]" role="group" aria-label="Contoh pencarian">
        {tags.map((t) => (
          <button
            key={t.query}
            onClick={() => {
              if (t.goto) {
                onNavigate(t.goto)
                if (t.anchor) {
                  setTimeout(() => {
                    document.getElementById(t.anchor!)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 350)
                }
              } else {
                handleSearch(t.query)
              }
            }}
            className="text-[13px] font-semibold text-ink-2 bg-paper-warm border border-line rounded-[4px] py-[7px] px-3 cursor-pointer transition-[border-color,color] duration-[120ms] hover:border-gold hover:text-gold"
          >
            {t.query}
          </button>
        ))}
      </div>

      {/* Cek Klaim section */}
      <div className="flex items-baseline justify-between mt-7 mb-[10px] pb-2 border-b border-line-soft">
        <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Cek Klaim Terverifikasi</h2>
        <button onClick={() => onNavigate('cek-klaim')} className="bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0">
          Lihat semua →
        </button>
      </div>
      <div className="grid grid-cols-2 gap-[10px]">
        <button onClick={() => onNavigate('cek-klaim')} className="bg-surface border border-line rounded-[6px] p-4 cursor-pointer text-left w-full transition-[border-color,box-shadow] duration-[120ms] hover:border-emerald hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="text-[32px] font-extrabold tracking-[-0.04em] leading-none text-emerald-deep">
            25 <span className="text-gold text-[22px]">=</span> 25
          </div>
          <p className="mt-[6px] mb-2 text-[13px] font-semibold leading-[1.45] text-ink-2">
            Nama <strong>Adam</strong> dan <strong>Isa</strong> disebut sama banyak
          </p>
          <StatusMarker status="bersyarat" label="LOLOS BERSYARAT" />
        </button>
        <button onClick={() => handleSearch('setan')} className="bg-surface border border-line rounded-[6px] p-4 cursor-pointer text-left w-full transition-[border-color,box-shadow] duration-[120ms] hover:border-emerald hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="text-[32px] font-extrabold tracking-[-0.04em] leading-none text-emerald-deep">
            88<span className="text-gold text-[22px]">×</span>
          </div>
          <p className="mt-[6px] mb-2 text-[13px] font-semibold leading-[1.45] text-ink-2">
            Kata <strong>setan</strong> dalam semua bentuk katanya
          </p>
          <StatusMarker status="lolos" label="LOLOS" />
        </button>
      </div>

      {/* Graf Entitas teaser */}
      <div className="flex items-baseline justify-between mt-7 mb-[10px] pb-2 border-b border-line-soft">
        <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Graf Entitas</h2>
        <button onClick={() => onNavigate('graf')} className="bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0">
          Buka graf →
        </button>
      </div>
      <button onClick={() => onNavigate('graf')} className="mt-[10px] bg-surface border border-line rounded-[6px] p-4 cursor-pointer text-left w-full transition-[border-color] duration-[120ms] hover:border-emerald">
        <div className="flex items-center gap-2 flex-wrap mb-[10px]">
          <span className="text-[12px] font-extrabold border border-emerald text-emerald bg-emerald/7 rounded-[4px] py-[6px] px-[11px]">Dzulqarnain</span>
          <span className="text-gold font-extrabold text-[14px]">→</span>
          <span className="text-[12px] font-bold bg-paper-warm border border-line rounded-[4px] py-[6px] px-[11px]">Ya&apos;juj &amp; Ma&apos;juj</span>
          <span className="text-gold font-extrabold text-[14px]">→</span>
          <span className="text-[12px] font-bold bg-paper-warm border border-line rounded-[4px] py-[6px] px-[11px]">Tembok Besi</span>
        </div>
        <p className="m-0 text-[13px] leading-[1.55] text-ink-3">
          Satu tokoh, satu rangkaian ayat (Al-Kahf 83–98), lima simpul keterkaitan. Ketuk untuk melihat tokoh sebagai peta.
        </p>
      </button>

      {/* Baca Qur'an teaser (Fase 5A) */}
      <div className="flex items-baseline justify-between mt-7 mb-[10px] pb-2 border-b border-line-soft">
        <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Baru · Baca Qur&apos;an</h2>
        <button onClick={() => onNavigate('baca')} className="bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0">
          Mulai baca →
        </button>
      </div>
      <button onClick={() => onNavigate('baca')} className="mt-[10px] bg-surface border border-line rounded-[6px] p-4 cursor-pointer text-left w-full transition-[border-color] duration-[120ms] hover:border-emerald">
        <p className="m-0 text-[15px] font-extrabold text-ink">
          Baca dengan warna tajwid <UiIcon name="palette-deep" size={15} className="align-[-2px] ml-[3px]" />
        </p>
        <p className="mt-[4px] mb-0 text-[13px] leading-[1.55] text-ink-3">
          Tiap warna ada hukumnya — ikhfa, idgham, madd, qalqalah — dan tanda berhenti pun berwarna. Ketuk hurufnya untuk tahu artinya, simpan ayat favoritmu dengan bintang.
        </p>
      </button>

      <footer className="mt-[30px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
        Angka terverifikasi dari teks Tanzil. Metodologi hitung selalu ditampilkan — tidak ada klaim tanpa aturan main.
        <button onClick={() => onNavigate('metodologi')} className="block mt-[6px] bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0">
          Metodologi &amp; Sumber →
        </button>
      </footer>
    </div>
  )
}
