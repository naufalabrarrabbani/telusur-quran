'use client'

import { StatusMarker } from '@/components/ui/StatusMarker'

interface AlKahfTopic {
  title: string
  reference: string
  summary: string
  reviewRequired?: boolean
}

const topics: AlKahfTopic[] = [
  {
    title: 'Empat kisah, satu surah',
    reference: 'Ashab al-Kahf · QS 18:9–26; 18:32–44; 18:60–82; 18:83–98',
    summary:
      'Para ulama membaca kisah penghuni gua, pemilik dua kebun, Musa dan Khidir, serta Dzulqarnain sebagai empat ujian: agama, harta, ilmu, dan kekuasaan.',
  },
  {
    title: '300 dulu, baru 9?',
    reference: 'QS 18:25',
    summary:
      'Kenapa angka 300 disebut sebelum tambahan 9? Perbedaan penafsiran tentang hitungan ini dibahas sebagai pertanyaan, bukan jawaban tunggal.',
    reviewRequired: true,
  },
  {
    title: 'Anjing di dalam gua',
    reference: 'QS 18:18, 22',
    summary:
      'Al-Qur’an menyebut anjing yang menemani para pemuda dan menggambarkan posisinya. Nama “Qitmir” berasal dari tradisi, bukan dari ayat Al-Qur’an.',
  },
  {
    title: 'Dua kebun dan satu kalimat',
    reference: 'QS 18:32–44',
    summary:
      'Kisah dua pemilik kebun mengajak kita melihat kesuburan, rasa percaya diri, dan kalimat yang mengubah cara pandang pemiliknya.',
  },
  {
    title: 'Musa dan Khidir',
    reference: 'QS 18:60–82',
    summary:
      'Perjalanan Musa bersama Khidir membawa tiga peristiwa yang maknanya baru dijelaskan kemudian—dan ujian untuk bersabar sebelum memahami.',
  },
  {
    title: 'Dzulqarnain dan tembok besi',
    reference: 'QS 18:83–98',
    summary:
      'Kisah pembangunan penghalang dengan besi dan tembaga. Ayat menyebut bahwa penghalang itu akan runtuh pada waktunya; keadaan tembok saat ini termasuk perkara gaib.',
  },
  {
    title: 'Sepuluh ayat terakhir dan fitnah Dajjal',
    reference: 'QS 18:1–10, 101–110 · Sahih Muslim 809 · Al-Hakim 1/564',
    summary:
      'Hadits tentang sepuluh ayat hadir dengan redaksi awal dan akhir surah; riwayat lain secara khusus menyebut ayat-ayat terakhir. Kartu ini membedakan janji perlindungan dalam hadits dari penjelasan ulama tentang sebabnya.',
    reviewRequired: true,
  },
  {
    title: 'Jumat dan cahaya di antara dua Jumat',
    reference: 'Riwayat Al-Hakim dan Al-Baihaqi',
    summary:
      'Sebuah riwayat mengaitkan pembacaan Surah Al-Kahf pada hari Jumat dengan cahaya di antara dua Jumat. Perlu pemeriksaan sumber sebelum diterbitkan.',
    reviewRequired: true,
  },
  {
    title: 'Apa itu “Raqim”?',
    reference: 'QS 18:9',
    summary:
      'Makna kata Raqim diperselisihkan dalam penafsiran. Kita mulai dari pertanyaannya dan melihat ragam pendapat ulama.',
  },
  {
    title: 'Jangan menebak jumlah mereka',
    reference: 'QS 18:22',
    summary:
      'Ayat menyebut beberapa dugaan tentang jumlah para pemuda, lalu mengarahkan pembaca agar tidak memastikan sesuatu yang tidak diketahui.',
  },
]

export function AlKahfSeriesScreen({ onBack }: { onBack: () => void }) {
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
          ke ayatnya. Status kartu menunjukkan bagian yang masih perlu ditinjau.
        </p>
      </header>

      <div className="space-y-[10px]">
        {topics.map((topic, index) => (
          <article
            key={topic.title}
            className="bg-surface border border-line rounded-[6px] p-4"
          >
            <div className="mb-[9px]">
              <StatusMarker
                status={topic.reviewRequired ? 'bersyarat' : 'belum'}
                label={topic.reviewRequired ? 'BERSYARAT · REVIEW DOSEN' : 'PERLU CEK'}
              />
            </div>
            <h2 className="m-0 text-[15px] leading-[1.4] font-extrabold text-ink">
              <span className="mr-[6px] text-ink-4 tabular-nums">
                {String(index + 1).padStart(2, '0')}.
              </span>
              {topic.title}
            </h2>
            <p className="mt-[7px] mb-0 text-[12px] leading-[1.6] text-ink-3">
              {topic.summary}
            </p>
            <p className="mt-[10px] mb-0 border-t border-line-soft pt-[8px] text-[10px] leading-[1.5] font-bold text-ink-4">
              {topic.reference}
            </p>
          </article>
        ))}
      </div>

      <footer className="mt-5 border-t border-line-soft pt-[12px] text-[11px] leading-[1.6] text-ink-4">
        Kartu “Bersyarat” wajib ditinjau Dosen sebelum tayang. Teks ayat tidak
        ditulis ulang di sini; rujukan ayat mengarah ke dataset aplikasi.
      </footer>
    </div>
  )
}
