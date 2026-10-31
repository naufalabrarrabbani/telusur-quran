'use client'

import { UiIcon } from '@/components/ui/UiIcon'

interface MetodologiScreenProps {
  onNavigate: (screen: string) => void
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-[10px] text-[10px] font-extrabold tracking-[0.12em] text-gold uppercase mb-[10px] mt-[22px]">
      {children}
      <span className="flex-1 h-px bg-line" />
    </div>
  )
}

const MODES = [
  {
    nama: 'Kata Persis',
    isi: 'Hanya token yang persis cocok dengan kata yang dicari. Bentuk lain — walau satu kata dasar — tidak ikut terhitung. Mode paling ketat.',
  },
  {
    nama: '+ Awalan',
    isi: 'Token yang mengandung kata yang dicari, termasuk yang berawalan huruf seperti wa- (dan), li- (untuk), bi- (dengan). Di sinilah banyak klaim angka berubah hasil.',
  },
  {
    nama: 'Lemma',
    isi: 'Semua bentuk dari kata dasar (lemma) yang sama dihitung: tunggal, jamak, dan yang berawalan. Contoh: "setan" = 70 bentuk tunggal + 18 bentuk jamak (syayathin) = 88.',
  },
  {
    nama: 'Akar Kata',
    isi: 'Mode paling longgar: semua kata yang seakar ikut terhitung, termasuk turunan yang maknanya sudah bergeser. Berguna untuk menelusuri tema, bukan untuk klaim angka yang ketat.',
  },
]

const STATUS = [
  { label: 'TERVERIFIKASI / LOLOS', warna: 'text-green', isi: 'Klaim tereproduksi persis dari teks dengan aturan hitung yang dinyatakan.' },
  { label: 'LOLOS BERSYARAT', warna: 'text-gold', isi: 'Klaim benar hanya pada mode hitung tertentu. Syaratnya selalu ditulis di kartu — tanpa syarat itu, klaimnya tidak sah.' },
  { label: 'KONTESTED', warna: 'text-amber', isi: 'Klaim tidak tereproduksi pada metode hitung terbuka mana pun yang kami coba. Kartunya tetap ditampilkan, beserta hitungan kami, supaya publik menilai sendiri.' },
  { label: 'BUKTI OK · KONTEKS BELUM DICEK', warna: 'text-ink-4', isi: 'Angka/ayatnya sudah terverifikasi mesin, tetapi pendalaman tafsirnya masih antre diteliti dari kitab rujukan. Kami labeli apa adanya daripada menunggu sempurna.' },
]

export function MetodologiScreen({ onNavigate }: MetodologiScreenProps) {
  return (
    <div>
      <button
        onClick={() => onNavigate('beranda')}
        className="bg-none border-none cursor-pointer text-[12px] font-bold text-emerald p-0 mb-3"
      >
        <UiIcon name="back-emerald" size={12} className="mr-[5px] align-[-1px]" />Beranda
      </button>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Metodologi &amp; Sumber</h2>
      <p className="mb-[18px] text-[13px] leading-[1.6] text-ink-3">
        Telusur Qur&apos;an dibangun di atas satu aturan: <strong className="text-ink-2">tidak ada angka yang tampil tanpa aturan hitungnya.</strong> Halaman ini membuka semua aturan itu — sumber teks, cara menghitung, arti label, dan cara kami mengoreksi kesalahan sendiri.
      </p>

      <SectionTitle>Dari mana teksnya</SectionTitle>
      <p className="m-0 text-[13px] leading-[1.7] text-ink-3">
        Teks Arab memakai edisi Utsmani &amp; Simple yang bersumber dari proyek <strong className="text-ink-2">Tanzil</strong>, terjemahan memakai edisi Bahasa Indonesia <strong className="text-ink-2">Kementerian Agama RI</strong> — keduanya didistribusikan sebagai dataset oleh AlQuran Cloud. Totalnya 6.236 ayat.
      </p>
      <p className="mt-2 mb-0 text-[13px] leading-[1.7] text-ink-3">
        Indeks kata dibangun dari teks yang sama persis dengan yang ditampilkan. <strong className="text-ink-2">Teks ayat di aplikasi ini selalu diambil dari data tersebut — tidak pernah ditulis tangan dan tidak pernah dihasilkan AI.</strong> Bila ada perbedaan dengan mushaf cetak yang kamu pegang, ikuti mushafmu dan laporkan ke kami.
      </p>

      <SectionTitle>Empat mode hitung</SectionTitle>
      <p className="m-0 mb-2 text-[13px] leading-[1.7] text-ink-3">
        Satu pertanyaan bisa punya empat jawaban yang semuanya benar — tergantung modenya. Contoh paling terkenal: nama <strong className="text-ink-2">Adam = 20</strong> dan <strong className="text-ink-2">Isa = 16</strong> pada mode Kata Persis (tidak sama), tetapi <strong className="text-ink-2">25 = 25</strong> pada mode + Awalan (sama). Klaim viral biasanya hanya menyebut jawaban yang paling menguntungkan.
      </p>
      {MODES.map((m) => (
        <div key={m.nama} className="py-[8px] border-b border-line-soft last:border-b-0">
          <div className="text-[13px] font-extrabold text-ink">{m.nama}</div>
          <p className="m-0 mt-[2px] text-[13px] leading-[1.65] text-ink-3">{m.isi}</p>
        </div>
      ))}

      <SectionTitle>Arti label status</SectionTitle>
      {STATUS.map((s) => (
        <div key={s.label} className="py-[8px] border-b border-line-soft last:border-b-0">
          <div className={`text-[12px] font-extrabold tracking-[0.03em] ${s.warna}`}>● {s.label}</div>
          <p className="m-0 mt-[2px] text-[13px] leading-[1.65] text-ink-3">{s.isi}</p>
        </div>
      ))}

      <SectionTitle>Koreksi terbuka</SectionTitle>
      <p className="m-0 text-[13px] leading-[1.7] text-ink-3">
        Wasit yang tidak pernah mengaku salah tidak bisa dipercaya. Dua koreksi kami sendiri selama verifikasi batch pertama:
      </p>
      <ul className="mt-2 mb-0 pl-[18px] text-[13px] leading-[1.7] text-ink-3">
        <li>Klaim dunia = akhirat sempat kami vonis gugur (112) karena melewatkan 3 token berawalan — hitungan yang benar adalah <strong className="text-ink-2">115 = 115, LOLOS BERSYARAT</strong>.</li>
        <li>Refrain &quot;celakalah para pendusta&quot; sempat terhitung 11× — kemunculannya di QS Ath-Thur 52:11 terlewat; yang benar <strong className="text-ink-2">12× di 3 surah</strong>.</li>
      </ul>
      <p className="mt-2 mb-0 text-[13px] leading-[1.7] text-ink-3">
        Menemukan kesalahan lain? Sampaikan ke HijaLearn — koreksi akan kami catat di halaman ini, bukan kami hapus diam-diam.
      </p>

      <SectionTitle>Mode Baca &amp; warna tajwid</SectionTitle>
      <p className="m-0 text-[13px] leading-[1.7] text-ink-3">
        Teks di mode Baca berasal dari <strong className="text-ink-2">edisi tajwid AlQuran Cloud</strong> (teks beranotasi hukum tajwid), dengan ejaan <strong className="text-ink-2">rasm imla&apos;i</strong> — ejaan sebagian kata bisa berbeda dari rasm Utsmani di mode Telusur (mis. <em>fi</em> ditulis في di sini, فى di sana); isi dan bacaannya sama. Terjemahannya tetap edisi Kemenag yang sama.
      </p>
      <p className="mt-2 mb-0 text-[13px] leading-[1.7] text-ink-3">
        Pewarnaan huruf mengikuti anotasi edisi tersebut apa adanya; yang kami kerjakan adalah memetakannya ke legenda warna dan nama hukum berbahasa Indonesia. Pemetaan tiap kode anotasi ke hukumnya kami verifikasi dari konteks hurufnya (mis. kode idgham selalu jatuh pada nun/tanwin yang bertemu huruf idgham). <strong className="text-ink-2">Tidak ada standar warna tajwid yang universal</strong> — tiap mushaf berbeda — jadi legenda kami adalah keputusan produk yang dinyatakan terbuka, dan akan ditinjau berkala bersama penelaah kami (dosen Lc.). Tanda berhenti (waqaf) dan saktah (18:1, 36:52, 75:27, 83:14; 69:28 dalam sebagian riwayat) berasal dari tanda yang memang ada di teks edisi tersebut.
      </p>

      <SectionTitle>Pembaruan hitungan: berbasis akar kata (Nov 2026)</SectionTitle>
      <p className="m-0 text-[13px] leading-[1.7] text-ink-3">
        Sejak November 2026, sebagian kata kunci dihitung berbasis <strong className="text-ink-2">akar kata</strong> (root),
        bukan lagi substring. Akar kata diambil dari anotasi morfologi <strong className="text-ink-2">Quranic Arabic Corpus</strong> yang
        diverifikasi manual per kata. Hasilnya: hitungan lebih lengkap (bentuk ber-hamzah/vokal-panjang yang lolos dari
        pencocokan substring kini tertangkap) dan bebas dari jebakan substring lintas-akar.
        Perubahan angka yang terjadi: <strong className="text-ink-2">takut 99→115</strong> (tambahan bentuk خيفة, خائف, تخويفا yang
        terlewat), <strong className="text-ink-2">marah 20→21</strong> (مغاضبا, QS 21:87), <strong className="text-ink-2">putus asa 12→16</strong> (القانطين QS 15:55,
        قنوط QS 41:49). Angka baru = lebih lengkap &amp; terverifikasi, sejalan dengan janji wasit kami.
      </p>

      <SectionTitle>Sumber &amp; rujukan</SectionTitle>
      <ul className="m-0 pl-[18px] text-[13px] leading-[1.8] text-ink-3">
        <li><strong className="text-ink-2">Teks:</strong> Tanzil (teks Al-Qur&apos;an terverifikasi), via dataset AlQuran Cloud.</li>
        <li><strong className="text-ink-2">Terjemahan:</strong> Kementerian Agama Republik Indonesia.</li>
        <li><strong className="text-ink-2">Morfologi (akar kata):</strong> <a href="https://corpus.quran.com" target="_blank" rel="noreferrer" className="font-semibold text-emerald underline decoration-emerald/30 underline-offset-2">Quranic Arabic Corpus</a> © 2011 Kais Dukes, lisensi GNU GPL — anotasi terverifikasi manual per kata; teks ayat tetap dari Tanzil, QAC hanya dipakai untuk akar katanya.</li>
        <li><strong className="text-ink-2">Tafsir &amp; konteks:</strong> Tafsir Kemenag, Tafsir Al-Mishbah (M. Quraish Shihab), Tafsir Ibnu Katsir.</li>
        <li><strong className="text-ink-2">Asbabun nuzul:</strong> Al-Wahidi; Lubab an-Nuqul karya As-Suyuthi.</li>
        <li><strong className="text-ink-2">Konkordansi:</strong> Al-Mu&apos;jam al-Mufahras li Alfazh al-Qur&apos;an (Muhammad Fuad Abdul Baqi).</li>
        <li><strong className="text-ink-2">Ikon antarmuka:</strong> <a href="https://icons8.com" target="_blank" rel="noreferrer" className="font-semibold text-emerald underline decoration-emerald/30 underline-offset-2">Icons8</a> (set Material Rounded), diwarnai mengikuti palet aplikasi.</li>
      </ul>
      <p className="mt-2 mb-0 text-[13px] leading-[1.7] text-ink-3">
        Konteks yang bersumber dari riwayat yang diperselisihkan selalu dilabeli di kartunya — riwayat masyhur tidak pernah kami sajikan sebagai kepastian.
      </p>

      <footer className="mt-[30px] border-t border-line-soft pt-[14px] text-[11px] leading-[1.6] text-ink-4">
        Telusur Qur&apos;an dibangun oleh <strong className="text-ink-3">HijaLearn</strong> (hijalearn.id) · Teks Al-Qur&apos;an © Tanzil · Terjemahan © Kementerian Agama RI · Data morfologi © Quranic Arabic Corpus (Kais Dukes, GPL) · 2026.
      </footer>
    </div>
  )
}
