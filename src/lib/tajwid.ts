// Mode Baca (Fase 5A) — pewarnaan tajwid dari edisi quran-tajweed
// (AlQuran Cloud), diparse offline oleh scripts/build-tajweed.py menjadi
// segmen per ayat di /data/tajweed/<surah>.json.
//
// Pemetaan kode -> hukum diverifikasi secara statistik dari konteks huruf
// (lihat brief fase-5-baca-quran.md): mis. kode 'a' selalu nun/tanwin +
// huruf idgham bighunnah, 'u' selalu + lam/ra, 'g' 100% nun/mim bertasydid,
// 'p' 100% di akhir ayat. Tidak ada standar warna tajwid yang universal —
// palet ini pemetaan HijaLearn dan didokumentasikan apa adanya.

export interface TajwidRule {
  name: string
  desc: string
  color: string
  group: string
}

export const TAJWID_RULES: Record<string, TajwidRule> = {
  // Nun sukun & tanwin
  f: { name: 'Ikhfa Haqiqi', desc: 'Nun sukun / tanwin bertemu salah satu dari 15 huruf ikhfa — bunyi nun disamarkan dengan dengung 2 ketukan.', color: '#0F766E', group: 'Nun Sukun & Tanwin' },
  a: { name: 'Idgham Bighunnah', desc: 'Nun sukun / tanwin bertemu ي، ن، م، atau و — melebur ke huruf berikutnya dengan dengung 2 ketukan.', color: '#4F46E5', group: 'Nun Sukun & Tanwin' },
  u: { name: 'Idgham Bilaghunnah', desc: 'Nun sukun / tanwin bertemu ل atau ر — melebur sempurna tanpa dengung.', color: '#7C3AED', group: 'Nun Sukun & Tanwin' },
  i: { name: 'Iqlab', desc: 'Nun sukun / tanwin bertemu ب — bunyi nun berubah menjadi mim samar, dengan dengung 2 ketukan.', color: '#EA580C', group: 'Nun Sukun & Tanwin' },
  // Mim sukun
  c: { name: 'Ikhfa Syafawi', desc: 'Mim sukun bertemu ب — disamarkan di bibir dengan dengung 2 ketukan.', color: '#0891B2', group: 'Mim Sukun' },
  w: { name: 'Idgham Syafawi', desc: 'Mim sukun bertemu م — melebur menjadi mim bertasydid dengan dengung 2 ketukan.', color: '#2563EB', group: 'Mim Sukun' },
  // Ghunnah
  g: { name: 'Ghunnah', desc: 'Nun / mim bertasydid — didengungkan 2 ketukan dari rongga hidung.', color: '#16A34A', group: 'Ghunnah' },
  // Madd
  n: { name: 'Madd Huruf Kecil', desc: 'Madd 2 ketukan pada huruf madd kecil: alif khanajariyyah (ٰ) dan shilah (ࣥ / ࣦ) setelah ha dhomir.', color: '#DB2777', group: 'Madd (Panjang)' },
  o: { name: 'Madd bertemu Hamzah', desc: 'Madd yang bertemu hamzah — Madd Wajib Muttasil bila satu kata, Madd Jaiz Munfasil bila beda kata. Dibaca 4–5 ketukan.', color: '#E11D48', group: 'Madd (Panjang)' },
  m: { name: 'Madd Lazim', desc: 'Madd bertemu sukun asli / tasydid dalam satu kata — termasuk huruf muqatha\'ah di awal surah. Dibaca 6 ketukan.', color: '#9F1239', group: 'Madd (Panjang)' },
  p: { name: 'Madd \'Arid Lissukun', desc: 'Madd di ujung kata/ayat yang sukun karena berhenti — boleh dibaca 2, 4, atau 6 ketukan.', color: '#C026D3', group: 'Madd (Panjang)' },
  // Huruf & kasus khusus
  h: { name: 'Hamzatul Washal', desc: 'Alif washal (ٱ): dibaca bila memulai dari kata ini, gugur (tidak dibaca) bila disambung dari kata sebelumnya.', color: '#A3A380', group: 'Huruf Khusus' },
  s: { name: 'Tidak Dibaca', desc: 'Huruf yang tertulis tetapi tidak diucapkan — mis. alif setelah waw jama\'ah, atau waw yang dibaca sebagai alif.', color: '#8D99AE', group: 'Huruf Khusus' },
  l: { name: 'Lam Syamsiyyah', desc: 'Lam pada "al-" yang melebur ke huruf syamsiyyah sesudahnya — lam-nya tidak dibaca jelas.', color: '#D97706', group: 'Huruf Khusus' },
  q: { name: 'Qalqalah', desc: 'Salah satu huruf qalqalah (ق ط ب ج د) dalam keadaan sukun — bunyinya dipantulkan.', color: '#DC2626', group: 'Huruf Khusus' },
  d: { name: 'Idgham Mutajanisain', desc: 'Dua huruf sejenis makhraj yang bertemu — yang pertama melebur ke yang kedua (mis. د sukun ke ت).', color: '#65A30D', group: 'Huruf Khusus' },
  b: { name: 'Idgham Lam → Ra', desc: 'Kasus khusus: lam pada قُلْ / بَلْ melebur ke huruf ر sesudahnya (mis. قُل رَّبِّ).', color: '#CA8A04', group: 'Huruf Khusus' },
  // Tanda waqf & tanda mushaf (dirender sebagai lencana, bukan warna huruf)
  'waqf-lazim': { name: 'Waqaf Lazim (م)', desc: 'Tanda berhenti wajib — berhenti di sini agar makna tidak rusak.', color: '#B5372A', group: 'Tanda Berhenti' },
  'waqf-jaiz': { name: 'Waqaf Jaiz (ج)', desc: 'Boleh berhenti, boleh juga melanjutkan bacaan.', color: '#2D8B5A', group: 'Tanda Berhenti' },
  'waqf-aula': { name: 'Al-Washl Aula (صلى)', desc: 'Melanjutkan bacaan lebih utama, meski berhenti juga boleh.', color: '#1A6B4A', group: 'Tanda Berhenti' },
  'waqf-qala': { name: 'Al-Waqf Aula (قلى)', desc: 'Berhenti lebih utama, meski melanjutkan juga boleh.', color: '#946B14', group: 'Tanda Berhenti' },
  'waqf-muanaqah': { name: 'Mu\'anaqah (tiga titik)', desc: 'Dua tanda berpasangan: berhenti di salah satunya saja, bukan di keduanya.', color: '#7C3AED', group: 'Tanda Berhenti' },
  saktah: { name: 'Saktah', desc: 'Berhenti sejenak (±2 ketukan) TANPA mengambil napas, lalu lanjut. Titik kanonik: 18:1, 36:52, 75:27, 83:14 (dan 69:28 dalam sebagian riwayat).', color: '#DB2777', group: 'Tanda Berhenti' },
  seen: { name: 'Tanda Seen', desc: 'Huruf shad pada kata ini dibaca seperti seen (hanya di 2:245 dan 7:69).', color: '#8D99AE', group: 'Tanda Berhenti' },
  sajdah: { name: 'Ayat Sajdah', desc: 'Ayat sajdah — disunnahkan sujud tilawah setelah membacanya.', color: '#9E7C1A', group: 'Tanda Berhenti' },
  hizb: { name: 'Rubu\' Hizb', desc: 'Penanda perempat hizb dalam mushaf — penanda struktur, bukan aturan baca.', color: '#9C9C92', group: 'Tanda Berhenti' },
  sifr: { name: 'Sifr Mustadir', desc: 'Huruf di bawah tanda lingkaran kecil ini tidak dibaca bila bacaan disambung (washal).', color: '#8D99AE', group: 'Tanda Berhenti' },
}

export const TAJWID_GROUPS = ['Nun Sukun & Tanwin', 'Mim Sukun', 'Ghunnah', 'Madd (Panjang)', 'Huruf Khusus', 'Tanda Berhenti']

export function isWaqfRule(code: string): boolean {
  return TAJWID_RULES[code]?.group === 'Tanda Berhenti'
}

// ── Data ────────────────────────────────────────────────────────────────────

export type TajwidSeg = [text: string, code: string | null]
export interface TajwidAyah {
  n: number
  seg: TajwidSeg[]
}
export interface TajwidSurah {
  surah: number
  ayahs: TajwidAyah[]
}

const surahCache = new Map<number, TajwidSurah>()

export async function loadTajwidSurah(n: number): Promise<TajwidSurah> {
  const cached = surahCache.get(n)
  if (cached) return cached
  const res = await fetch(`/data/tajweed/${n}.json`)
  const data = (await res.json()) as TajwidSurah
  surahCache.set(n, data)
  return data
}

// ── Penyimpanan lokal (bookmark, posisi baca, setelan) ──────────────────────

const LS_BOOKMARKS = 'tq:bookmarks'
const LS_LASTREAD = 'tq:lastread'
const LS_SETTINGS = 'tq:baca-settings'

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // penyimpanan penuh / mode privat — abaikan, fitur tetap jalan in-memory
  }
}

export function loadBookmarks(): string[] {
  return lsGet<string[]>(LS_BOOKMARKS, [])
}

export function saveBookmarks(refs: string[]) {
  lsSet(LS_BOOKMARKS, refs)
}

export interface LastRead {
  surah: number
  ayah: number
}

export function loadLastRead(): LastRead | null {
  return lsGet<LastRead | null>(LS_LASTREAD, null)
}

export function saveLastRead(lr: LastRead) {
  lsSet(LS_LASTREAD, lr)
}

export interface BacaSettings {
  colors: boolean
  translation: boolean
  fontIdx: number // 0,1,2
}

export function loadBacaSettings(): BacaSettings {
  return lsGet<BacaSettings>(LS_SETTINGS, { colors: true, translation: true, fontIdx: 1 })
}

export function saveBacaSettings(s: BacaSettings) {
  lsSet(LS_SETTINGS, s)
}

export const FONT_SIZES = [23, 27, 31]
