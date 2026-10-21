// Entitas Graf — daftar & deskripsi DIKURASI MANUAL (breakdown §7: tagging
// entitas tidak boleh full-otomatis). Yang dihitung mesin hanya daftar
// ayatnya: setiap entitas dipetakan dari indeks kata yang sama dengan
// pencarian (mode CONTAINS), jadi angka di graf selalu bisa dicek ulang
// lewat tab Hasil Cari.

export type EntityType = 'Nabi' | 'Tokoh' | 'Malaikat' | 'Makhluk' | 'Kaum' | 'Tempat' | 'Tema'

export interface EntityData {
  /** Kunci pencarian (kamus transliterasi di lib/search) */
  id: string
  nama: string
  ar: string
  tipe: EntityType
  deskripsi: string
}

export const ENTITY_TYPES: EntityType[] = ['Nabi', 'Tokoh', 'Malaikat', 'Makhluk', 'Kaum', 'Tempat', 'Tema']

export const ENTITIES: EntityData[] = [
  // ── Nabi ──────────────────────────────────────────────────────────────
  { id: 'adam', nama: 'Adam', ar: 'آدم', tipe: 'Nabi', deskripsi: 'Manusia pertama dan nabi pertama; kisahnya membuka tema godaan, taubat, dan janji Allah (antara lain Al-Baqarah & Al-A\'raf).' },
  { id: 'nuh', nama: 'Nuh', ar: 'نوح', tipe: 'Nabi', deskripsi: 'Nabi yang berdakwah berabad-abad dan membangun bahtera; kisah banjirnya diceritakan di banyak surah, utuh di QS Hud & Nuh.' },
  { id: 'hud', nama: 'Hud', ar: 'هود', tipe: 'Nabi', deskripsi: 'Diutus kepada kaum \'Ad yang kuat dan sombong; kisahnya terutama di QS Hud & Al-A\'raf.' },
  { id: 'shalih', nama: 'Shalih', ar: 'صالح', tipe: 'Nabi', deskripsi: 'Diutus kepada Tsamud dengan mukjizat unta betina (Hud, Al-A\'raf, Asy-Syams).' },
  { id: 'ibrahim', nama: 'Ibrahim', ar: 'إبراهيم', tipe: 'Nabi', deskripsi: 'Bapak para nabi; pencari kebenaran yang menghancurkan berhala dan dilempar ke api — yang menjadi dingin (Al-Anbiya).' },
  { id: 'luth', nama: 'Luth', ar: 'لوط', tipe: 'Nabi', deskripsi: 'Nabi untuk kaum Sodom; kisahnya berulang sebagai peringatan, antara lain di Hud, Al-Hijr, dan Asy-Syu\'ara\'.' },
  { id: 'ismail', nama: 'Ismail', ar: 'إسماعيل', tipe: 'Nabi', deskripsi: 'Putra Ibrahim; diasosiasikan dengan pembangunan Ka\'bah dan kisah penyembelihan (Ash-Shaffat).' },
  { id: 'ishaq', nama: 'Ishaq', ar: 'إسحاق', tipe: 'Nabi', deskripsi: 'Putra Ibrahim dari Sarah; kabar gembira kelahirannya disampaikan malaikat (Hud & Adz-Dzariyat).' },
  { id: 'yaqub', nama: 'Ya\'qub', ar: 'يعقوب', tipe: 'Nabi', deskripsi: 'Ayah Yusuf dan Bani Israil; kesedihan dan kesabarannya atas Yusuf diabadikan di QS Yusuf.' },
  { id: 'yusuf', nama: 'Yusuf', ar: 'يوسف', tipe: 'Nabi', deskripsi: 'Nabinya mimpi, penjara, dan pengampunan; satu-satunya nabi yang kisahnya diceritakan utuh dalam satu surah (QS Yusuf).' },
  { id: 'ayyub', nama: 'Ayyub', ar: 'أيوب', tipe: 'Nabi', deskripsi: 'Simbol kesabaran dalam penyakit dan kehilangan; doanya diabadikan di Al-Anbiya & Shad.' },
  { id: 'syuaib', nama: 'Syu\'aib', ar: 'شعيب', tipe: 'Nabi', deskripsi: 'Diutus ke Madyan; menegur kecurangan timbangan (Hud, Al-A\'raf, Al-\'Ankabut).' },
  { id: 'musa', nama: 'Musa', ar: 'موسى', tipe: 'Nabi', deskripsi: 'Nabi yang namanya paling sering disebut (136× mode + Awalan); kisahnya dengan Firaun dan Bani Israil memenuhi banyak surah.' },
  { id: 'harun', nama: 'Harun', ar: 'هارون', tipe: 'Nabi', deskripsi: 'Saudara Musa dan juru bicaranya; disebut antara lain dalam peristiwa anak sapi (Thaha & Al-A\'raf).' },
  { id: 'dawud', nama: 'Dawud', ar: 'داوود', tipe: 'Nabi', deskripsi: 'Raja-nabi penerima Zabur; kisahnya dengan Thalut & Jalut di Al-Baqarah, dan gunung-gunung ikut bertasbih bersamanya (Saba\').' },
  { id: 'sulaiman', nama: 'Sulaiman', ar: 'سليمان', tipe: 'Nabi', deskripsi: 'Raja-nabi yang memahami bahasa hewan; kisahnya dengan Ratu Saba di An-Naml dan dengan angin di Shad.' },
  { id: 'yunus', nama: 'Yunus', ar: 'يونس', tipe: 'Nabi', deskripsi: 'Nabi yang ditelan ikan; doanya dalam kegelapan (Al-Anbiya 87) menjadi salah satu doa paling masyhur.' },
  { id: 'zakariya', nama: 'Zakariya', ar: 'زكريا', tipe: 'Nabi', deskripsi: 'Pengasuh Maryam yang berdoa di usia senja dan dikaruniai Yahya (Maryam & Ali \'Imran).' },
  { id: 'yahya', nama: 'Yahya', ar: 'يحيى', tipe: 'Nabi', deskripsi: 'Putra Zakariya; disebut sebagai pemimpin, penahan diri, dan nabi yang saleh (Maryam & Ali \'Imran).' },
  { id: 'isa', nama: 'Isa', ar: 'عيسى', tipe: 'Nabi', deskripsi: 'Putra Maryam, Al-Masih; kelahiran, mukjizat, dan perdebatan tentangnya tersebar di Ali \'Imran, Maryam, dan Al-Ma\'idah.' },
  { id: 'muhammad', nama: 'Muhammad ﷺ', ar: 'محمد', tipe: 'Nabi', deskripsi: 'Nabi terakhir; namanya disebut 4× (plus Ahmad 1×), tetapi tidak pernah disapa dengan nama — selalu dengan gelar.' },

  // ── Tokoh ─────────────────────────────────────────────────────────────
  { id: 'firaun', nama: 'Firaun', ar: 'فرعون', tipe: 'Tokoh', deskripsi: 'Penguasa Mesir penentang Musa; "Firaun" adalah gelar, bukan nama pribadi. Kisahnya tersebar sebagai lawan dalam kisah Musa di banyak surah.' },
  { id: 'qarun', nama: 'Qarun', ar: 'قارون', tipe: 'Tokoh', deskripsi: 'Si kaya dari kaum Musa yang ditelan bumi bersama hartanya (Al-Qashash).' },
  { id: 'thalut', nama: 'Thalut', ar: 'طالوت', tipe: 'Tokoh', deskripsi: 'Raja pertama Bani Israil pilihan Allah; memimpin pasukan melawan Jalut (Al-Baqarah 246–251).' },
  { id: 'dzulkarnain', nama: 'Dzulkarnain', ar: 'ذو القرنين', tipe: 'Tokoh', deskripsi: 'Penguasa adil pembangun dinding penghalang Ya\'juj & Ma\'juj; seluruh kisahnya di Al-Kahf 83–98. Identitasnya diperselisihkan ulama.' },
  { id: 'yajuj', nama: 'Ya\'juj & Ma\'juj', ar: 'يأجوج ومأجوج', tipe: 'Tokoh', deskripsi: 'Kaum perusak yang dikurung di balik dinding Dzulkarnain; disebut di Al-Kahf 94 dan Al-Anbiya 96.' },
  { id: 'luqman', nama: 'Luqman', ar: 'لقمان', tipe: 'Tokoh', deskripsi: 'Orang bijak yang wasiatnya kepada anaknya diabadikan dalam surah yang memakai namanya (QS Luqman).' },
  { id: 'maryam', nama: 'Maryam', ar: 'مريم', tipe: 'Tokoh', deskripsi: 'Satu-satunya perempuan yang namanya menjadi nama surah; ibunda Isa, namanya muncul 34× dalam semua bentuk katanya.' },
  { id: 'imran', nama: '\'Imran', ar: 'عمران', tipe: 'Tokoh', deskripsi: 'Ayah Maryam; namanya diabadikan sebagai nama keluarga besar dalam judul surah ke-3: Ali \'Imran (keluarga \'Imran).' },

  // ── Malaikat & makhluk ────────────────────────────────────────────────
  { id: 'malaikat', nama: 'Malaikat', ar: 'الملائكة', tipe: 'Malaikat', deskripsi: 'Makhluk yang selalu taat; keluarga katanya muncul 73× (mode keluarga kata) — bukan 88 seperti klaim viral.' },
  { id: 'jibril', nama: 'Jibril', ar: 'جبريل', tipe: 'Malaikat', deskripsi: 'Malaikat pembawa wahyu; namanya tak pernah muncul tanpa awalan — hanya wa-Jibril dan li-Jibril (3×).' },
  { id: 'mikail', nama: 'Mikail', ar: 'ميكال', tipe: 'Malaikat', deskripsi: 'Malaikat yang disebut satu kali, berpasangan dengan Jibril di Al-Baqarah 98.' },
  { id: 'iblis', nama: 'Iblis', ar: 'إبليس', tipe: 'Makhluk', deskripsi: 'Makhluk dari api yang menolak sujud kepada Adam; adegan penolakannya diceritakan 7× di 7 surah.' },
  { id: 'jin', nama: 'Jin', ar: 'الجن', tipe: 'Makhluk', deskripsi: 'Makhluk yang diciptakan dari api; ada surah khusus bernama Al-Jinn. Kata persis "al-jin" muncul 19×.' },

  // ── Kaum ──────────────────────────────────────────────────────────────
  { id: 'ad', nama: 'Kaum \'Ad', ar: 'عاد', tipe: 'Kaum', deskripsi: 'Kaum Nabi Hud yang kuat dan membangun bangunan tinggi; dihancurkan angin dingin (Al-Fajr, Hud, Al-Ahqaf).' },
  { id: 'tsamud', nama: 'Kaum Tsamud', ar: 'ثمود', tipe: 'Kaum', deskripsi: 'Kaum Nabi Shalih, pemahat gunung menjadi rumah; dihancurkan suara yang mengguntur (Al-Fajr, An-Naml).' },
  { id: 'israil', nama: 'Bani Israil', ar: 'إسرائيل', tipe: 'Kaum', deskripsi: 'Keturunan Ya\'qub (Israil); kaum yang paling banyak diceritakan interaksinya dengan para nabi, terutama Musa.' },

  // ── Tempat ────────────────────────────────────────────────────────────
  { id: 'makkah', nama: 'Makkah', ar: 'مكة', tipe: 'Tempat', deskripsi: 'Kota Ka\'bah; disebut dengan nama Makkah 1× (Al-Fath 24) dan dengan nama Bakkah 1× (Ali \'Imran 96).' },
  { id: 'madinah', nama: 'Madinah / Kota', ar: 'المدينة', tipe: 'Tempat', deskripsi: 'Kata al-madinah ("kota itu") muncul 14× — sebagian merujuk kota Nabi, sebagian kota lain dalam kisah, mis. kota Yusuf dan kota Ashabul Kahf.' },

  // ── Tema ──────────────────────────────────────────────────────────────
  { id: 'sabar', nama: 'Sabar', ar: 'صبر', tipe: 'Tema', deskripsi: 'Tema yang akarnya muncul di puluhan ayat; digandengkan dengan shalat (2:45) dan janji pahala tanpa batas (39:10).' },
  { id: 'syukur', nama: 'Syukur', ar: 'شكر', tipe: 'Tema', deskripsi: 'Tema pasangan sabar; antara lain di Ibrahim 7 — janji bahwa syukur menambah nikmat.' },
  { id: 'iman', nama: 'Iman', ar: 'الإيمان', tipe: 'Tema', deskripsi: 'Tema sentral Al-Qur\'an; sapaan "wahai orang-orang yang beriman" sendiri muncul di 89 ayat.' },
  { id: 'doa', nama: 'Doa', ar: 'الدعاء', tipe: 'Tema', deskripsi: 'Pola respons Allah terhadap doa adalah tema tersendiri — lihat kata fastajabna ("maka Kami kabulkan"), 4× di Al-Anbiya.' },
  { id: 'dunia', nama: 'Dunia', ar: 'الدنيا', tipe: 'Tema', deskripsi: 'Kata ad-dunya muncul 115× — sama banyak dengan keluarga kata akhirat bila aturan hitungnya dibuka (lihat Cek Klaim).' },
  { id: 'akhirat', nama: 'Akhirat', ar: 'الآخرة', tipe: 'Tema', deskripsi: 'Keluarga kata al-akhirah = 115× bila semua bentuk berawalan dihitung; kata persisnya saja 71×.' },
]
