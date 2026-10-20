'use client'

import { useState } from 'react'
import { VerseCard } from '@/components/ui/VerseCard'

interface HasilCariScreenProps {
  onNavigate: (screen: string) => void
}

type Mode = 'exact' | 'contains' | 'lemma' | 'root'

const modeData: Record<Mode, { num: string; badge: string; note: string }> = {
  exact: { num: '63', badge: 'Mode: KATA PERSIS (satu bentuk saja)', note: 'Hanya token yang persis berbentuk الشيطان. Bentuk lain tidak ikut terhitung.' },
  contains: { num: '—', badge: 'Mode: + AWALAN', note: 'Angka mode Termasuk Awalan belum dihitung dari indeks — versi data penuh menampilkannya.' },
  lemma: { num: '88', badge: 'Mode: LEMMA (semua bentuk kata)', note: 'Semua bentuk kata dari lemma yang sama dihitung: tunggal, jamak, dan yang berawalan.' },
  root: { num: '—', badge: 'Mode: AKAR KATA (paling longgar)', note: 'Mode paling longgar: semua kata seakar ikut terhitung. Angkanya belum dihitung dari indeks.' },
}

const modes: { id: Mode; label: string }[] = [
  { id: 'exact', label: 'Kata Persis' },
  { id: 'contains', label: '+ Awalan' },
  { id: 'lemma', label: 'Lemma' },
  { id: 'root', label: 'Akar Kata' },
]

const barData = [
  { form: 'الشيطان', width: '100%', n: 63 },
  { form: 'شياطين', width: '29%', n: 18 },
  { form: 'شيطان', width: '7%', n: 4 },
  { form: 'شيطانًا', width: '4%', n: 2 },
  { form: 'للشيطان', width: '3%', n: 1 },
]

export function HasilCariScreen({ onNavigate }: HasilCariScreenProps) {
  const [activeMode, setActiveMode] = useState<Mode>('lemma')
  const current = modeData[activeMode]

  return (
    <div>
      <button
        onClick={() => onNavigate('beranda')}
        className="bg-none border-none cursor-pointer p-0 text-[13px] font-bold text-ink-4 inline-flex items-center gap-[5px] mb-3 hover:text-emerald"
      >
        ← Kembali
      </button>

      <p className="text-[13px] text-ink-3 font-semibold mb-1">
        Hasil untuk <span className="text-ink font-extrabold">&quot;setan&quot;</span> · <span style={{ fontFamily: 'Amiri, serif', fontSize: '15px', direction: 'rtl', unicodeBidi: 'isolate' }}>شيطان</span>
      </p>

      <div className="text-left mt-1">
        <div className="text-[80px] font-extrabold tracking-[-0.05em] leading-[0.95] text-emerald-deep">
          {current.num}
        </div>
        <div className="text-[15px] font-semibold text-ink-2 mt-1">kali disebut dalam Al-Qur&apos;an</div>
        <span className="inline-block mt-[10px] text-[12px] font-bold bg-emerald/12 text-emerald border border-emerald/20 rounded-[4px] py-[5px] px-[10px]">
          {current.badge}
        </span>
        <p className="mt-2 mb-0 text-[12px] text-ink-4 leading-[1.55] min-h-[18px]">{current.note}</p>
      </div>

      {/* Mode selector */}
      <div className="flex bg-paper-warm border border-line rounded-[6px] p-[3px] gap-[3px] mt-4" role="group" aria-label="Mode hitung">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMode(m.id)}
            className={`flex-1 text-[12px] font-bold py-[9px] px-1 rounded-[4px] border-none cursor-pointer transition-all duration-[120ms] ${
              activeMode === m.id
                ? 'bg-emerald-deep text-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                : 'bg-transparent text-ink-3'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Featured verse */}
      <VerseCard
        surah="QS Al-A'raf"
        ayahRef="7:17"
        juz="Makkiyah"
        featured
        arabic={'ثُمَّ <span class="text-gold underline decoration-gold/35 underline-offset-[6px]">لَءَاتِيَنَّهُم مِّنۢ بَيْنِ أَيْدِيهِمْ وَمِنْ خَلْفِهِمْ وَعَنْ أَيْمَٰنِهِمْ وَعَن شَمَآئِلِهِمْ</span> ۖ وَلَا تَجِدُ أَكْثَرَهُمْ شَٰكِرِينَ'}
        translation={'"Kemudian saya akan mendatangi mereka dari muka dan dari belakang mereka, dari kanan dan dari kiri mereka. Dan Engkau tidak akan mendapati kebanyakan mereka bersyukur (taat)."'}
        featuredCaption="Sumpah Iblis: menyerang manusia dari segala arah — depan, belakang, kanan, kiri."
      />

      {/* Per bentuk kata */}
      <div className="bg-surface border border-line rounded-[6px] p-4 mt-[18px]">
        <h3 className="m-0 mb-3 text-[13px] font-extrabold uppercase tracking-[0.03em] text-ink-3">Per bentuk kata</h3>
        {barData.map((b) => (
          <div key={b.form} className="grid grid-cols-[70px_1fr_32px] items-center gap-[10px] mb-[10px] last:mb-0">
            <span className="text-[20px] text-right text-ink leading-[1.2]" style={{ fontFamily: 'Amiri, serif' }}>{b.form}</span>
            <div className="h-2 bg-paper-deep rounded-[3px] overflow-hidden">
              <div className="h-full rounded-[3px] bg-[linear-gradient(90deg,var(--color-emerald),var(--color-green))]" style={{ width: b.width }} />
            </div>
            <span className="text-[14px] font-extrabold text-right text-ink">{b.n}</span>
          </div>
        ))}
      </div>

      {/* Note strip */}
      <div className="mt-[14px] bg-gold/8 border-l-[3px] border-l-gold py-3 px-[14px] text-[13px] leading-[1.6] text-ink-2 rounded-r-[6px]">
        Pencarian teks biasa cuma nemu <strong className="text-gold font-extrabold">70</strong> — <strong className="text-gold font-extrabold">18</strong> bentuk jamak <span style={{ fontFamily: 'Amiri, serif', fontSize: '16px', direction: 'rtl', unicodeBidi: 'isolate' }}>شياطين</span> lolos kalau nggak pakai lemma.
      </div>

      {/* Verses */}
      <div className="flex items-baseline justify-between mt-7 mb-[10px] pb-2 border-b border-line-soft">
        <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Ayat-ayatnya</h2>
      </div>
      <div className="flex flex-wrap gap-[6px] -mt-[2px] mb-3" aria-label="Kelompok tema">
        <span className="text-[12px] font-bold text-ink-3 bg-paper-warm border border-line rounded-[4px] py-[6px] px-[10px]">Strategi &amp; Janji Setan</span>
        <span className="text-[12px] font-bold text-ink-3 bg-paper-warm border border-line rounded-[4px] py-[6px] px-[10px]">Godaan Setan</span>
        <span className="text-[12px] font-bold text-ink-3 bg-paper-warm border border-line rounded-[4px] py-[6px] px-[10px]">Berlindung dari Setan</span>
      </div>

      <VerseCard
        surah="QS Fathir"
        ayahRef="35:6"
        juz="Makkiyah"
        arabic={'إِنَّ <span class="text-gold underline decoration-gold/35 underline-offset-[6px]">ٱلشَّيْطَٰنَ</span> لَكُمْ عَدُوٌّۭ فَٱتَّخِذُوهُ عَدُوًّا ۚ إِنَّمَا يَدْعُوا۟ حِزْبَهُۥ لِيَكُونُوا۟ مِنْ أَصْحَٰبِ ٱلسَّعِيرِ'}
        translation={'"Sesungguhnya syaitan itu adalah musuh bagimu, maka anggaplah ia musuh(mu), karena sesungguhnya syaitan-syaitan itu hanya mengajak golongannya supaya mereka menjadi penghuni neraka yang menyala-nyala."'}
      />
      <VerseCard
        surah="QS Al-Baqarah"
        ayahRef="2:268"
        juz="Madaniyah"
        arabic={'<span class="text-gold underline decoration-gold/35 underline-offset-[6px]">ٱلشَّيْطَٰنُ</span> يَعِدُكُمُ ٱلْفَقْرَ وَيَأْمُرُكُم بِٱلْفَحْشَآءِ ۖ وَٱللَّهُ يَعِدُكُم مَّغْفِرَةًۭ مِّنْهُ وَفَضْلًۭا ۗ وَٱللَّهُ وَٰسِعٌ عَلِيمٌۭ'}
        translation={'"Syaitan menjanjikan (menakut-nakuti) kamu dengan kemiskinan dan menyuruh kamu berbuat kejahatan (kikir); sedang Allah menjadikan untukmu ampunan daripada-Nya dan karunia."'}
      />

      <p className="text-[12px] text-ink-4 mt-3">Menampilkan 2 dari 88 ayat · di versi penuh, daftar dikelompokkan per bentuk kata dan bisa difilter per surah.</p>
    </div>
  )
}
