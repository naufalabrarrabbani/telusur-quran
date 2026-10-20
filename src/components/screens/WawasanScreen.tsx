'use client'

interface WawasanScreenProps {
  onNavigate: (screen: string) => void
}

const prophetCalls = [
  { name: 'Musa', count: '24×' },
  { name: 'Adam', count: '4×' },
  { name: 'Nuh', count: '4×' },
  { name: 'Isa', count: '4×' },
  { name: 'Luth', count: '2×' },
  { name: 'Zakariya', count: '1×' },
  { name: 'Yahya', count: '1×' },
]

const titleCalls = [
  { name: 'Ya Ayyuhan-Nabi', ar: 'يَا أَيُّهَا النَّبِيُّ', count: '13×' },
  { name: 'Ya Ayyuhar-Rasul', ar: 'يَا أَيُّهَا الرَّسُولُ', count: '2×' },
  { name: 'Al-Muzzammil', ar: 'يَا أَيُّهَا الْمُزَّمِّلُ', count: '1×' },
  { name: 'Al-Muddatstsir', ar: 'يَا أَيُّهَا الْمُدَّثِّرُ', count: '1×' },
]

export function WawasanScreen({ onNavigate }: WawasanScreenProps) {
  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Kartu Wawasan</h2>
      <p className="mb-[18px] text-[13px] leading-[1.6] text-ink-3">
        Hal-hal yang jarang disadari dari teks Al-Qur&apos;an — tiap kartu dibuka dengan hook, lalu buktinya, konteksnya, dan maknanya.
      </p>

      {/* Hero insight: Ad-Dhuha */}
      <article className="bg-[linear-gradient(160deg,rgba(26,107,74,0.04),var(--color-surface)_50%)] border-[1.5px] border-emerald rounded-[6px] p-[18px_16px] mb-3 shadow-[0_2px_16px_rgba(26,107,74,0.06)]">
        <span className="block text-[10px] font-extrabold tracking-[0.1em] text-emerald uppercase mb-[10px]">
          Pintu Emosi · Buat kamu yang lagi galau
        </span>
        <h3 className="m-0 text-[19px] font-extrabold leading-[1.35] tracking-[-0.01em] text-ink">
          &quot;Tuhanmu tidak meninggalkanmu.&quot;
        </h3>

        {/* Bukti */}
        <div className="mt-[18px]">
          <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
            Bukti · Ayatnya
            <span className="flex-1 h-px bg-line" />
          </div>
          <article className="bg-paper-warm border border-line rounded-[6px] p-4">
            <div className="flex justify-between items-center mb-[10px]">
              <span className="text-[11px] font-extrabold tracking-[0.04em] text-emerald uppercase">QS Ad-Dhuha · 93:3</span>
              <span className="text-[11px] font-semibold text-ink-4">Makkiyah</span>
            </div>
            <p className="text-[23px] leading-[2.05] text-right text-ink m-0" style={{ fontFamily: 'Amiri, serif', direction: 'rtl', unicodeBidi: 'isolate' }}>
              مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ
            </p>
            <p className="text-[13px] leading-[1.7] text-ink-3 mt-[10px] mb-0">
              &quot;Tuhanmu tiada meninggalkan kamu dan tiada (pula) benci kepadamu.&quot;
            </p>
          </article>
        </div>

        {/* Konteks */}
        <div className="mt-[18px]">
          <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
            Konteks
            <span className="flex-1 h-px bg-line" />
          </div>
          <p className="m-0 text-[13px] leading-[1.7] text-ink-3">
            Menurut riwayat yang masyhur: saat wahyu sempat terhenti dan Nabi ﷺ bersedih, surah Ad-Dhuha turun untuk menghibur beliau — ayat ini adalah janji bahwa beliau tidak pernah ditinggalkan.
          </p>
        </div>

        {/* Contrast */}
        <div className="mt-[18px]">
          <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
            Pasangan Kontras · Lapang Dada
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid gap-2">
            <div className="bg-paper-warm border border-line rounded-[6px] p-[14px]">
              <div className="text-[11px] font-extrabold tracking-[0.06em] uppercase text-amber">Nabi Musa — Meminta</div>
              <div className="text-[11px] font-bold text-ink-4 mt-[2px]">QS Thaha · 20:25</div>
              <p className="text-[21px] leading-[2] text-right text-ink mt-2 mb-0" style={{ fontFamily: 'Amiri, serif', direction: 'rtl', unicodeBidi: 'isolate' }}>
                قَالَ رَبِّ ٱشْرَحْ لِى صَدْرِى
              </p>
              <p className="text-[12.5px] leading-[1.65] text-ink-3 mt-[6px] mb-0">
                &quot;Berkata Musa: Ya Tuhanku, lapangkanlah untukku dadaku&quot;
              </p>
            </div>
            <div className="bg-paper-warm border border-line rounded-[6px] p-[14px]">
              <div className="text-[11px] font-extrabold tracking-[0.06em] uppercase text-green">Nabi Muhammad — Diberi Tanpa Meminta</div>
              <div className="text-[11px] font-bold text-ink-4 mt-[2px]">QS Al-Insyirah · 94:1</div>
              <p className="text-[21px] leading-[2] text-right text-ink mt-2 mb-0" style={{ fontFamily: 'Amiri, serif', direction: 'rtl', unicodeBidi: 'isolate' }}>
                أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ
              </p>
              <p className="text-[12.5px] leading-[1.65] text-ink-3 mt-[6px] mb-0">
                &quot;Bukankah Kami telah melapangkan untukmu dadamu?&quot;
              </p>
            </div>
          </div>
          <p className="m-0 mt-[10px] text-[13px] leading-[1.7] text-ink-3">
            Musa meminta dadanya dilapangkan. Muhammad ﷺ tidak meminta — Allah memberikannya lebih dulu.
          </p>
        </div>

        {/* Makna */}
        <div className="mt-[18px]">
          <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
            Makna buatmu
            <span className="flex-1 h-px bg-line" />
          </div>
          <p className="m-0 text-[15px] leading-[1.65] font-bold text-ink bg-gold/8 border-l-[3px] border-l-gold rounded-r-[6px] p-[13px_14px]">
            Kadang yang kamu butuhkan sudah disiapkan sebelum kamu sempat memintanya.
          </p>
        </div>
      </article>

      {/* Second insight: Ya Muhammad 0x */}
      <article className="bg-surface border border-line rounded-[6px] p-[18px_16px] mb-3">
        <span className="block text-[10px] font-extrabold tracking-[0.1em] text-emerald uppercase mb-[10px]">
          Kartu Wawasan
        </span>
        <h3 className="m-0 text-[19px] font-extrabold leading-[1.35] tracking-[-0.01em] text-ink">
          Allah tidak pernah memanggil Nabi Muhammad dengan namanya.
        </h3>

        <div className="mt-[18px]">
          <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
            Bukti · Data Sapaan
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="flex items-center gap-[14px]">
            <div className="text-[56px] font-extrabold tracking-[-0.04em] leading-none text-emerald-deep">0×</div>
            <div className="text-[13px] leading-[1.55] text-ink-2 font-semibold">
              sapaan <span style={{ fontFamily: 'Amiri, serif', fontSize: '17px', direction: 'rtl', unicodeBidi: 'isolate' }} className="text-ink">&quot;يَا مُحَمَّد&quot;</span> (Ya Muhammad) di seluruh Al-Qur&apos;an. Nol.
            </div>
          </div>

          <p className="mt-[14px] mb-[3px] text-[12px] font-extrabold text-ink uppercase tracking-[0.03em]">Padahal nabi lain disapa langsung:</p>
          {prophetCalls.map((c) => (
            <div key={c.name} className="flex justify-between items-baseline gap-[10px] py-[6px] border-b border-line-soft last:border-b-0 text-[13px] text-ink-2 font-semibold">
              <span>{c.name}</span>
              <span className="font-extrabold text-ink whitespace-nowrap tabular-nums">{c.count}</span>
            </div>
          ))}

          <p className="mt-[14px] mb-[3px] text-[12px] font-extrabold text-ink uppercase tracking-[0.03em]">Sapaan beliau selalu gelar:</p>
          {titleCalls.map((c) => (
            <div key={c.name} className="flex justify-between items-baseline gap-[10px] py-[6px] border-b border-line-soft last:border-b-0 text-[13px] text-ink-2 font-semibold">
              <span>{c.name} <span className="text-ink-4" style={{ fontFamily: 'Amiri, serif', fontSize: '15px', direction: 'rtl', unicodeBidi: 'isolate' }}>&quot;{c.ar}&quot;</span></span>
              <span className="font-extrabold text-ink whitespace-nowrap tabular-nums">{c.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-[18px]">
          <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px]">
            Makna
            <span className="flex-1 h-px bg-line" />
          </div>
          <p className="m-0 text-[15px] leading-[1.65] font-bold text-ink bg-gold/8 border-l-[3px] border-l-gold rounded-r-[6px] p-[13px_14px]">
            Nama beliau disebut 4 kali dalam Al-Qur&apos;an — tapi tidak pernah sebagai panggilan. Selalu dengan penghormatan.
          </p>
        </div>

        <button
          onClick={() => onNavigate('hasil-cari')}
          className="mt-3 w-full text-[13px] font-bold bg-transparent text-emerald border border-line rounded-[4px] py-[10px] cursor-pointer transition-[border-color] duration-[120ms] hover:border-emerald"
        >
          Cek sendiri →
        </button>
      </article>

      <footer className="mt-[30px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
        Semua wawasan di sini terkurasi &amp; terverifikasi dari teks — bukan karangan AI.
      </footer>
    </div>
  )
}
