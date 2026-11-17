// Data seri Al-Kahf — "Masuk Gua: Al-Kahf, dibaca pelan-pelan."
// Copy mengikuti dokumen konten v1 yang disetujui (Fase 1 + 2 + 3).
// Aturan mengikat: teks ayat TIDAK PERNAH ditulis di sini — ayat dirender
// dari dataset aplikasi lewat VerseCard (lihat AlKahfSeriesScreen).
// Ilustrasi: aset Flow di public/images/kahf/, didecode saat build dari
// assets-b64/kahf/ (lihat scripts/decode-assets.mjs).

export type KahfStatus = 'lolos' | 'bersyarat' | 'kontested' | 'belum'

export interface KahfBeat {
  title: string
  text: string
}

export interface KahfTopic {
  id: number
  title: string
  tease: string
  image: string
  imageAlt: string
  status: KahfStatus
  /** Label pendek untuk chip di kartu daftar. */
  statusShort: string
  /** Label lengkap untuk drawer detail. */
  statusLabel: string
  reference: string
  /** Referensi ayat "surah:ayat" yang dirender dari dataset. */
  ayat: string[]
  /** Ayat pertama untuk CTA baca (selalu Surah 18). */
  readAyat: number
  readLabel: string
  beats: KahfBeat[]
  /** "Detail yang sering lewat" — ditampilkan sebagai callout. */
  detail: string
  statusNote: string
  closing: string
  related: number[]
}

export const KAHF_TOPICS: KahfTopic[] = [
  {
    id: 1,
    title: 'Empat kisah, satu surah',
    tease: 'Satu surah, empat ujian. Dan ujian yang sama yang dibawa Dajjal di akhir zaman.',
    image: '/images/kahf/kahf-01.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: jalan membelah empat dari mulut gua',
    status: 'belum',
    statusShort: 'Perlu Cek',
    statusLabel: 'PERLU CEK',
    reference: 'QS 18:9–26; 18:32–44; 18:60–82; 18:83–98',
    ayat: ['18:9', '18:83'],
    readAyat: 9,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Isinya',
        text: 'Satu surah memuat empat kisah: penghuni gua (QS 18:9–26), pemilik dua kebun (QS 18:32–44), Musa dan Khidir (QS 18:60–82), Dzulqarnain (QS 18:83–98).',
      },
      {
        title: 'Cara ulama membacanya',
        text: 'Para ulama membaca keempatnya sebagai empat ujian: agama (pemuda gua mempertahankan iman di bawah penguasa zalim), harta (pemilik kebun), ilmu (Musa belajar sabar), kekuasaan (Dzulqarnain memakai kuasanya).',
      },
      {
        title: 'Tiap kisah menunjukkan dua sisi',
        text: 'Ujian yang sama, respons yang berbeda: pemuda gua lari menjaga iman; pemilik kebun yakin hartanya abadi; Musa berjanji sabar lalu tiga kali bertanya; Dzulqarnain menyandarkan temboknya pada rahmat Tuhannya.',
      },
      {
        title: 'Benang merahnya',
        text: 'Kerangka yang umum diajarkan: Dajjal membawa keempat ujian itu sekaligus — agama (meminta disembah), harta (hujan dan kekayaan), ilmu (kabar gaib), kekuasaan (menguasai bumi). Surah ini latihan mingguannya.',
      },
    ],
    detail:
      'Surah ini dibaca tiap Jumat — dan keempat ujian itu juga datang tiap pekan dalam bentuk yang lebih kecil. Latihan yang diulang-ulang, bukan teori yang sekali dibaca.',
    statusNote:
      'Framing empat ujian adalah penafsiran ulama, ditulis dengan atribusi eksplisit; isi kisah dari ayat.',
    closing: 'Empat ujian dalam satu surah. Minggu ini, yang mana yang sedang datang ke lo?',
    related: [7],
  },
  {
    id: 2,
    title: '300 dulu, baru 9?',
    tease: 'Satu angka yang membuat ulama berbeda pendapat selama berabad-abad.',
    image: '/images/kahf/kahf-02.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: matahari dan bulan di atas gurun',
    status: 'bersyarat',
    statusShort: 'Bersyarat',
    statusLabel: 'BERSYARAT',
    reference: 'QS 18:25–26',
    ayat: ['18:25', '18:26'],
    readAyat: 25,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Ayatnya',
        text: 'QS 18:25 menyebut mereka tinggal di dalam gua 300 tahun, ditambah 9.',
      },
      {
        title: 'Pertanyaannya',
        text: 'Kenapa disebut 300 dulu, baru ditambah 9? Kenapa tidak langsung 309?',
      },
      {
        title: 'Pendapat pertama (mayoritas, di antaranya Ibnu Katsir)',
        text: '300 tahun matahari sama dengan 309 tahun bulan. Durasi yang sama, dua kalender. Qur’an berbicara dalam kedua hitungan.',
      },
      {
        title: 'Pendapat kedua',
        text: 'Angka 300 itu perkataan Ahli Kitab; QS 18:26 menjawab: katakanlah, Allah lebih mengetahui berapa lama mereka tinggal. Hitungan pastinya ada di sisi Allah.',
      },
    ],
    detail:
      'Ayatnya sendiri tidak menetapkan satu angka final — ayat 26 mengalihkan dari menghitung ke siapa yang mengetahui. Pola surah ini: pasti di mana yang penting, rendah hati di mana yang tidak.',
    statusNote:
      'Dua pendapat ulama, keduanya dicatat; tidak ada jawaban tunggal yang diklaim.',
    closing: 'Kalau ayatnya sendiri tidak menetapkan angka pastinya — kenapa kita ngotot menetapkan?',
    related: [10],
  },
  {
    id: 3,
    title: 'Anjing di dalam gua',
    tease: 'Ia disebut sampai ke posisi tidurnya. Tapi namanya tidak ada di Qur’an.',
    image: '/images/kahf/kahf-03.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: anjing di mulut gua',
    status: 'belum',
    statusShort: 'Perlu Cek',
    statusLabel: 'PERLU CEK',
    reference: 'QS 18:18, 22',
    ayat: ['18:18', '18:22'],
    readAyat: 18,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Posisinya disebut',
        text: 'QS 18:18: anjing itu terbaring dengan kedua kaki depannya terentang di depan pintu gua. Detail posisi yang sangat spesifik untuk seekor hewan.',
      },
      {
        title: 'Ia ikut dihitung',
        text: 'QS 18:22: anjing itu disebut dalam tebak-tebakan jumlah mereka — yang keempat, yang keenam, yang kedelapan. Ia bagian dari rombongan, bukan tempelan.',
      },
      {
        title: 'Namanya tidak ada di Qur’an',
        text: 'Nama “Qitmir” berasal dari tradisi/riwayat, BUKAN dari Qur’an. Qur’an tidak pernah menyebut namanya. Kartu ini menulisnya apa adanya — jangan sebut Qitmir sebagai fakta Qur’an.',
      },
      {
        title: 'Pelajaran yang sering diambil ulama',
        text: 'Kebersamaan dengan orang saleh mengangkat derajat: anjing yang mengikuti pemuda-pemuda beriman itu diabadikan penyebutannya.',
      },
    ],
    detail:
      'Ia tidak masuk ke dalam gua — ia di ambang pintu, menjaga. Posisinya persis di ayat 18:18: di depan pintu, kaki terentang. Detail kecil yang menunjukkan penjagaan.',
    statusNote:
      'Ayat terverifikasi; nama Qitmir adalah tradisi (ditulis apa adanya); pelajaran kebersamaan adalah penafsiran ulama, dengan atribusi.',
    closing: 'Seekor anjing diabadikan karena menemani orang-orang beriman. Dengan siapa lo berjalan?',
    related: [9, 10],
  },
  {
    id: 4,
    title: 'Dua kebun',
    tease: 'Kebun yang sempurna, dan pemilik yang yakin tidak akan pernah kehilangan apa-apa.',
    image: '/images/kahf/kahf-04.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: dua kebun yang dialiri sungai',
    status: 'lolos',
    statusShort: 'Terverifikasi',
    statusLabel: 'TERVERIFIKASI',
    reference: 'QS 18:32–44',
    ayat: ['18:32', '18:39'],
    readAyat: 32,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Perumpamaannya',
        text: 'QS 18:32: dua kebun — anggur, kurma di sekelilingnya, tanaman di antara keduanya, sungai mengalir di tengah. Gambaran kesempurnaan dunia.',
      },
      {
        title: 'Keyakinan pemiliknya',
        text: 'Ia yakin hartanya tidak akan binasa, kiamat tidak akan datang, dan kalaupun ia kembali kepada Tuhannya, ia akan mendapatkan yang lebih baik (QS 18:35–36, parafrase).',
      },
      {
        title: 'Jawaban sahabatnya',
        text: 'Sahabat yang mukmin itu mengingatkan: ingkarkah kepada yang menciptakanmu dari tanah, lalu dari setetes air? (QS 18:37) — dan mengajarkan kalimat: mā shā’ Allāh, lā quwwata illā billāh (QS 18:39).',
      },
      {
        title: 'Semalam saja',
        text: 'Kebun itu dihancurkan (QS 18:40–42). Pemiliknya membolak-balikkan kedua tangannya, menyesali apa yang telah ia infakkan untuk kebun itu, dan berkata: seandainya aku tidak menyekutukan Tuhanku dengan siapa pun.',
      },
    ],
    detail:
      'Penyesalannya bukan “seandainya aku tidak kaya” — melainkan “seandainya aku tidak menyekutukan”. Ujian harta berujung pada tauhid.',
    statusNote: 'Terverifikasi, langsung dari ayat.',
    closing: 'Kebunnya sempurna. Yang runtuh bukan kebunnya — keyakinannya.',
    related: [1],
  },
  {
    id: 5,
    title: 'Musa & Khidir',
    tease: 'Tiga perbuatan yang tidak masuk akal — sampai penjelasannya datang di akhir.',
    image: '/images/kahf/kahf-05.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: perahu di laut luas',
    status: 'lolos',
    statusShort: 'Terverifikasi',
    statusLabel: 'TERVERIFIKASI',
    reference: 'QS 18:60–82',
    ayat: ['18:60', '18:82'],
    readAyat: 60,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Perjalanannya',
        text: 'QS 18:60: Musa bertekad pergi ke pertemuan dua laut, walau harus berjalan bertahun-tahun. Perjalanan mencari ilmu.',
      },
      {
        title: 'Syaratnya',
        text: 'Jangan bertanya tentang apa pun sampai dijelaskan (QS 18:70). Musa menyanggupi — dan tiga kali tidak tahan.',
      },
      {
        title: 'Tiga perbuatan',
        text: 'Perahu dilubangi (QS 18:71), seorang anak dibunuh (QS 18:74), tembok ditegakkan tanpa upah (QS 18:77). Masing-masing tampak salah di permukaan.',
      },
      {
        title: 'Penjelasannya (QS 18:79–82)',
        text: 'Perahu: ada raja yang merampas setiap perahu yang bagus. Anak: ia akan membebani kedua orang tuanya dengan pembangkangan dan kekafiran, dan Allah akan menggantinya dengan yang lebih baik. Tembok: di bawahnya ada harta dua anak yatim, dan ayah mereka orang saleh.',
      },
    ],
    detail:
      'Khidir menutup: semua itu bukan atas kemauannya sendiri (QS 18:82, parafrase) — ilmu yang ia miliki adalah rahmat, bukan miliknya. Dan Musa, seorang nabi, diperintahkan belajar sabar.',
    statusNote:
      'Terverifikasi, langsung dari ayat. Adab: tidak ada penggambaran figur — ilustrasi hanya laut dan perahu.',
    closing:
      'Tiga hal yang tampak salah — sampai penjelasannya datang. Berapa hal dalam hidup lo yang masih menunggu penjelasan?',
    related: [1],
  },
  {
    id: 6,
    title: 'Dzulqarnain & tembok besi',
    tease: 'Tembok dari besi dan tembaga cair. Ayatnya bilang akan runtuh — tapi tidak bilang kapan, dan tidak bilang di mana.',
    image: '/images/kahf/kahf-06.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: tembok besi di antara dua gunung',
    status: 'bersyarat',
    statusShort: 'Bersyarat',
    statusLabel: 'BERSYARAT',
    reference: 'QS 18:83–98',
    ayat: ['18:96', '18:98'],
    readAyat: 83,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Surah ini menjawab pertanyaan',
        text: 'QS 18:83: mereka bertanya tentang Dzulqarnain. Ayat-ayat berikutnya adalah jawabannya.',
      },
      {
        title: 'Perjalanannya',
        text: 'Ke tempat terbenamnya matahari, ke tempat terbitnya, lalu ke antara dua gunung (QS 18:86–93). Parafrase ayat — tanpa klaim lokasi modern.',
      },
      {
        title: 'Temboknya',
        text: 'Blok-blok besi, lalu tembaga cair dituangkan (QS 18:96–97). Ya’juj dan Ma’juj tidak dapat mendakinya dan tidak dapat melubanginya.',
      },
      {
        title: 'Janjinya',
        text: 'QS 18:98: ini rahmat dari Tuhanku; apabila janji Tuhanku datang, Dia akan menghancurluluhkannya. Tembok itu PASTI runtuh — itu janji ayatnya. Kapan dan di mana: ayatnya tidak bilang, dan itu wilayah ghaib.',
      },
    ],
    detail:
      'Dzulqarnain tidak mengklaim tembok itu sebagai prestasinya — ia menyandarkannya pada rahmat Tuhannya (QS 18:98). Ujian kekuasaan: apa yang dilakukan dengan kekuasaan itu.',
    statusNote:
      'Isi ayat terverifikasi. Identitas Dzulqarnain diperselisihkan ulama — tidak dinyatakan di kartu. Status dan lokasi tembok saat ini adalah perkara ghaib — tidak diklaim.',
    closing:
      'Temboknya pasti runtuh — itu janji ayatnya. Kapan dan di mana, ayatnya tidak bilang. Yang bilang, bukan ayatnya.',
    related: [7],
  },
  {
    id: 7,
    title: 'Sepuluh ayat & Dajjal',
    tease: 'Sepuluh ayat dari awal, atau sepuluh ayat dari akhir? Dua-duanya sahih — dan janjinya sama.',
    image: '/images/kahf/kahf-07.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: cahaya di dalam gua',
    status: 'bersyarat',
    statusShort: 'Bersyarat',
    statusLabel: 'BERSYARAT',
    reference: 'HR Muslim 809; QS 18:1–10, 101–110',
    ayat: ['18:1', '18:110'],
    readAyat: 1,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Janjinya',
        text: 'HR Muslim 809, dari Abu Darda’: siapa menghafal sepuluh ayat dari Surah Al-Kahf, ia dilindungi dari Dajjal.',
      },
      {
        title: 'Awal atau akhir? Dua-duanya',
        text: 'Muslim 809 punya dua redaksi: 809a (jalur Hammam) adalah 10 ayat pertama; 809b (jalur Syu’bah) adalah 10 ayat terakhir. Keduanya dalam Sahih Muslim. Hadits terpisah dari Abu Sa’id al-Khudri (Al-Hakim, An-Nasa’i, At-Tabarani; dinilai sahih oleh Al-Albani): siapa membaca 10 ayat dari akhirnya lalu Dajjal keluar, Dajjal tidak diberi kuasa atasnya. Rekomendasi ulama: hafalkan keduanya.',
      },
      {
        title: 'Kenapa bisa mencegah (penjelasan ulama, BUKAN lafaz hadits)',
        text: 'Imam An-Nawawi: karena keajaiban dan tanda-tanda besar di awal surah — siapa merenungkannya tidak akan terfitnah Dajjal. Al-Munawi: karena keajaiban kisah penghuni gua — siapa mengetahuinya tidak akan takjub pada trik Dajjal; atau karena merenungkan ayatnya membuat waspada; “atau mungkin ada kekhususan lain pada surah ini” (ketidakpastian ini dipertahankan).',
      },
      {
        title: 'Isi sepuluh ayat terakhir (QS 18:101–110)',
        text: 'Ayat 103–106: amal yang tampak hebat tapi sia-sia — penilaian bukan dari spektakel, melainkan iman. Ayat 110 menutup dengan tauhid: Nabi hanyalah manusia biasa, Tuhan itu Satu — klaim ketuhanan Dajjal runtuh dari akarnya; perintah penutup: amal saleh dan jangan sekutukan siapa pun dalam ibadah.',
      },
      {
        title: 'Yang dilakukan',
        text: 'Hafalkan 10 ayat awal dan 10 ayat akhir. Hadits An-Nawwas ibn Sam’an (Muslim): siapa bertemu Dajjal, bacakan ayat-ayat pembuka Al-Kahf kepadanya.',
      },
    ],
    detail:
      'Ketidakpastian Al-Munawi — “atau mungkin ada kekhususan lain pada surah ini” — dipertahankan di kartu, bukan dihapus. Penjelasan ulama bukan teks hadits, dan bedanya ditulis eksplisit.',
    statusNote:
      'Hadits terverifikasi; bagian “kenapa” adalah penjelasan ulama, bukan teks hadits — dan bedanya ditulis eksplisit di kartu.',
    closing:
      'Perlindungannya dijanjikan. Alasannya dijelaskan ulama. Keduanya tidak sama — dan bedanya penting.',
    related: [6],
  },
  {
    id: 8,
    title: 'Jumat & cahaya',
    tease: 'Janji cahaya di antara dua Jumat — dan pemeriksaan derajat haditsnya.',
    image: '/images/kahf/kahf-08.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: cahaya lembut menembus kegelapan',
    status: 'bersyarat',
    statusShort: 'Bersyarat',
    statusLabel: 'BERSYARAT',
    reference: 'HR Hakim/Al-Baihaqi',
    ayat: [],
    readAyat: 1,
    readLabel: 'Baca surahnya',
    beats: [
      {
        title: 'Janjinya',
        text: 'Siapa membaca Surah Al-Kahf pada hari Jumat, cahaya bersinar untuknya di antara dua Jumat. (HR Al-Hakim, Al-Baihaqi, dari Abu Sa’id al-Khudri.)',
      },
      {
        title: 'Sumbernya',
        text: 'Diriwayatkan Al-Hakim dalam Al-Mustadrak dan Al-Baihaqi; dinilai sahih oleh Al-Albani (Sahih al-Jami’ 6470).',
      },
      {
        title: 'Apa maksud “cahaya”?',
        text: 'Penjelasan ulama: cahaya petunjuk yang menerangi pekan itu — bimbingan, bukan cahaya fisik. Ditulis sebagai penjelasan, bukan sebagai teks hadits.',
      },
      {
        title: 'Kapan membacanya',
        text: 'Malam dan hari Jumat. Batas waktu amalannya tidak dirinci di kartu ini.',
      },
    ],
    detail:
      'Janji ini melekat pada surah yang sama yang melindungi dari Dajjal (kartu 07) — satu bacaan mingguan, dua janji.',
    statusNote:
      'Derajat hadits dan detail amalan masih perlu ditinjau; kartu ini tidak menetapkan rincian yang belum diverifikasi.',
    closing:
      'Cahaya di antara dua Jumat. Pertanyaannya bukan cuma dibaca atau tidak — tapi dibaca dengan perhatian atau tidak.',
    related: [7],
  },
  {
    id: 9,
    title: 'Raqim',
    tease: 'Satu kata yang tidak ada yang yakin artinya — dan ayatnya membiarkannya begitu.',
    image: '/images/kahf/kahf-09.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: lempeng batu kuno',
    status: 'kontested',
    statusShort: 'Kontested',
    statusLabel: 'KONTESTED',
    reference: 'QS 18:9',
    ayat: ['18:9'],
    readAyat: 9,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Katanya',
        text: 'QS 18:9: “Ashab al-Kahf wa al-Raqim” — penghuni gua dan Raqim. Satu kata yang menyertai mereka, tanpa penjelasan lanjutan di ayat mana pun.',
      },
      {
        title: 'Pendapat yang paling sering disebut',
        text: 'Raqim adalah lempeng atau batu bertuliskan nama-nama penghuni gua.',
      },
      {
        title: 'Pendapat lain',
        text: 'Nama tempat — lembah atau gunung tempat gua itu berada. Ada pula yang memahaminya sebagai nama negeri.',
      },
      {
        title: 'Tidak ada yang ditetapkan',
        text: 'Para mufassir berbeda pendapat, dan perbedaan itu sendiri yang tercatat. Ayatnya tidak menetapkan satu makna.',
      },
    ],
    detail:
      'Surah ini berulang kali membiarkan detail menggantung — Raqim di sini, jumlah mereka di ayat 22, lamanya tidur di ayat 25–26. Polanya konsisten: yang penting ditegaskan, yang tidak penting dibiarkan.',
    statusNote:
      'Kontested — daftar pendapat masih perlu ditinjau; kartu menyajikan sebagai pertanyaan, bukan jawaban tunggal.',
    closing: 'Satu kata, tiga pendapat, nol kepastian — dan ayatnya baik-baik saja dengan itu.',
    related: [10, 2],
  },
  {
    id: 10,
    title: 'Jangan menebak jumlah mereka',
    tease: 'Ayatnya melarang menebak. Tapi manusia tetap menebak selama 14 abad.',
    image: '/images/kahf/kahf-10.jpg',
    imageAlt: 'Ilustrasi seri Al-Kahf: bayangan samar di dalam gua',
    status: 'lolos',
    statusShort: 'Terverifikasi',
    statusLabel: 'TERVERIFIKASI',
    reference: 'QS 18:22',
    ayat: ['18:22'],
    readAyat: 22,
    readLabel: 'Baca ayatnya',
    beats: [
      {
        title: 'Tebak-tebakannya',
        text: 'QS 18:22: mereka akan berkata tiga, anjingnya yang keempat; lima, anjingnya yang keenam — “menebak-nebak perkara yang ghaib”; tujuh, anjingnya yang kedelapan.',
      },
      {
        title: 'Jawabannya',
        text: '“Tuhanku lebih mengetahui jumlah mereka; tidak ada yang mengetahuinya kecuali sedikit.” (QS 18:22, parafrase.)',
      },
      {
        title: 'Perintahnya',
        text: 'Jangan berbantah tentang mereka kecuali dengan alasan yang jelas, dan jangan bertanya kepada siapa pun tentang mereka. (QS 18:22, parafrase.)',
      },
      {
        title: 'Polanya',
        text: 'Di mana ayatnya diam, manusia disuruh diam. Tebakan tentang yang ghaib disebut dengan namanya: rajman bil-ghaib — melempar ke arah yang tidak terlihat.',
      },
    ],
    detail:
      'Ayat ini tidak melarang bertanya — ia melarang berdebat tentang yang tidak bisa diketahui dan bertanya kepada yang tidak tahu. Bedanya penting.',
    statusNote: 'Terverifikasi, langsung dari ayat.',
    closing: 'Ayatnya tidak melarang penasaran. Ia melarang kepastian palsu.',
    related: [2, 9],
  },
]
