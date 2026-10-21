// Quranic search engine — runs entirely client-side against precomputed indices

// ── Types ──────────────────────────────────────────────────────────────────

export interface Verse {
  surah_no: number
  ayah_no: number
  surah_name_latin: string
  text_uthmani: string
  text_simple: string
  text_normalized: string
  translation_id: string
  juz: number
  page: number
  makkiyah: boolean
}

export interface WordIndex {
  [token: string]: { verse_id: number; position: number }[]
}

export interface SurahMeta {
  number: number
  name_arabic: string
  name_latin: string
  english_name_translation: string
  ayah_count: number
  revelation_type: string
}

export interface SearchResult {
  query: string
  arabicTerm: string
  mode: 'exact' | 'contains' | 'lemma' | 'root'
  totalCount: number
  verseIds: number[]
  breakdown?: { form: string; count: number }[]
}

// ── Harakat stripping ──────────────────────────────────────────────────────

const HARAKAT_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\uFE70-\uFE7F]/g
const TATWEEL_RE = /\u0640/g

export function normalize(text: string): string {
  return text
    .replace(HARAKAT_RE, '')
    .replace(TATWEEL_RE, '')
    .replace(/\uFEFF/g, '')
    .trim()
}

// ── Transliteration map ────────────────────────────────────────────────────

// primary: form used for EXACT search
// contains: form used for CONTAINS substring search  
// lemmaRoot: short root pattern for LEMMA search (finds ALL forms containing this)
interface TranslitEntry {
  primary: string[]    // exact token forms
  contains: string     // substring for CONTAINS mode
  lemmaRoot: string    // shortest root for LEMMA mode
}

const TRANSLIT_MAP: Record<string, TranslitEntry> = {
  'setan':    { primary: ['شيطان'], contains: 'شيطان', lemmaRoot: 'شيط|شياطين' },
  'syaitan':  { primary: ['شيطان'], contains: 'شيطان', lemmaRoot: 'شيط|شياطين' },
  'syetan':   { primary: ['شيطان'], contains: 'شيطان', lemmaRoot: 'شيط|شياطين' },
  'sabar':    { primary: ['صبر'], contains: 'صبر', lemmaRoot: 'صبر' },
  'firaun':   { primary: ['فرعون'], contains: 'فرعون', lemmaRoot: 'فرعون' },
  'musa':     { primary: ['موسى'], contains: 'موسى', lemmaRoot: 'موسى' },
  'adam':     { primary: ['آدم'], contains: 'آدم', lemmaRoot: 'آدم' },
  'isa':      { primary: ['عيسى'], contains: 'عيسى', lemmaRoot: 'عيسى' },
  'muhammad': { primary: ['محمد'], contains: 'محمد', lemmaRoot: 'محمد' },
  'nabi':     { primary: ['النبي'], contains: 'النبي', lemmaRoot: 'نبي' },
  'dunia':    { primary: ['الدنيا'], contains: 'الدنيا', lemmaRoot: 'دنيا' },
  'akhirat':  { primary: ['الآخرة'], contains: 'آخر', lemmaRoot: 'آخر' },
  'allah':    { primary: ['الله'], contains: 'الله', lemmaRoot: 'الله' },
  'quran':    { primary: ['القران'], contains: 'قران', lemmaRoot: 'قران' },
  'malaikat': { primary: ['الملائكة'], contains: 'ملائك', lemmaRoot: 'ملائك' },
  'surga':    { primary: ['الجنة'], contains: 'جن', lemmaRoot: 'جنة|جنات' },
  'neraka':   { primary: ['النار'], contains: 'نار', lemmaRoot: 'نار' },
  'ibrahim':  { primary: ['ابراهيم'], contains: 'براهيم', lemmaRoot: 'براهيم' },
  'yusuf':    { primary: ['يوسف'], contains: 'يوسف', lemmaRoot: 'يوسف' },
  'nuh':      { primary: ['نوح'], contains: 'نوح', lemmaRoot: 'نوح' },
  'maryam':   { primary: ['مريم'], contains: 'مريم', lemmaRoot: 'مريم' },
  'hari':     { primary: ['يوم'], contains: 'يوم', lemmaRoot: 'يوم' },
  // ── Perluasan kamus (22 Okt 2026) — setiap entri terverifikasi ke word-index;
  //    bentuk yang tidak muncul di teks tidak dimasukkan.
  'yunus':    { primary: ['يونس'], contains: 'يونس', lemmaRoot: 'يونس' },
  'ayyub':    { primary: ['أيوب'], contains: 'يوب', lemmaRoot: 'يوب' },
  'yaqub':    { primary: ['يعقوب'], contains: 'يعقوب', lemmaRoot: 'يعقوب' },
  'ishaq':    { primary: ['إسحاق'], contains: 'سحاق', lemmaRoot: 'سحاق' },
  'ismail':   { primary: ['إسماعيل'], contains: 'سماعيل', lemmaRoot: 'سماعيل' },
  'dawud':    { primary: ['داوود'], contains: 'داوود', lemmaRoot: 'داوود' },
  'sulaiman': { primary: ['سليمان'], contains: 'سليمان', lemmaRoot: 'سليمان' },
  'harun':    { primary: ['هارون'], contains: 'هارون', lemmaRoot: 'هارون' },
  'zakariya': { primary: ['زكريا'], contains: 'زكريا', lemmaRoot: 'زكريا' },
  'yahya':    { primary: ['يحيى'], contains: 'يحيى', lemmaRoot: 'يحيى' },
  'luth':     { primary: ['لوط'], contains: 'لوط', lemmaRoot: 'لوط' },
  'hud':      { primary: ['هود'], contains: 'هود', lemmaRoot: 'هود' },
  'shalih':   { primary: ['صالح'], contains: 'صالح', lemmaRoot: 'صالح' },
  'saleh':    { primary: ['صالح'], contains: 'صالح', lemmaRoot: 'صالح' },
  'syuaib':   { primary: ['شعيب'], contains: 'شعيب', lemmaRoot: 'شعيب' },
  'idris':    { primary: ['إدريس'], contains: 'دريس', lemmaRoot: 'دريس' },
  'ilyas':    { primary: ['إلياس'], contains: 'لياس', lemmaRoot: 'لياس' },
  'thalut':   { primary: ['طالوت'], contains: 'طالوت', lemmaRoot: 'طالوت' },
  'jalut':    { primary: ['جالوت'], contains: 'جالوت', lemmaRoot: 'جالوت' },
  'qarun':    { primary: ['قارون'], contains: 'قارون', lemmaRoot: 'قارون' },
  'haman':    { primary: ['هامان'], contains: 'هامان', lemmaRoot: 'هامان' },
  'samiri':   { primary: ['السامري'], contains: 'سامري', lemmaRoot: 'سامري' },
  'luqman':   { primary: ['لقمان'], contains: 'لقمان', lemmaRoot: 'لقمان' },
  'dzulkarnain': { primary: ['القرنين'], contains: 'القرنين', lemmaRoot: 'القرنين' },
  'imran':    { primary: ['عمران'], contains: 'عمران', lemmaRoot: 'عمران' },
  'jibril':   { primary: ['جبريل', 'وجبريل', 'لجبريل'], contains: 'جبر', lemmaRoot: 'جبر' },
  'mikail':   { primary: ['ميكال', 'وميكال'], contains: 'ميكا', lemmaRoot: 'ميكا' },
  'iblis':    { primary: ['إبليس'], contains: 'بليس', lemmaRoot: 'بليس' },
  'jin':      { primary: ['الجن'], contains: 'الجن', lemmaRoot: 'الجن|الجان' },
  'shalat':   { primary: ['الصلاة'], contains: 'صلاة', lemmaRoot: 'صلاة|صلات' },
  'sholat':   { primary: ['الصلاة'], contains: 'صلاة', lemmaRoot: 'صلاة|صلات' },
  'solat':    { primary: ['الصلاة'], contains: 'صلاة', lemmaRoot: 'صلاة|صلات' },
  'zakat':    { primary: ['الزكاة'], contains: 'زكاة', lemmaRoot: 'زكا' },
  'puasa':    { primary: ['الصيام'], contains: 'صيام', lemmaRoot: 'صيام|صوم' },
  'haji':     { primary: ['الحج'], contains: 'حج', lemmaRoot: 'الحج|حج' },
  'umrah':    { primary: ['العمرة', 'والعمرة', 'بالعمرة'], contains: 'عمرة', lemmaRoot: 'عمرة' },
  'doa':      { primary: ['الدعاء'], contains: 'دعاء', lemmaRoot: 'دعا' },
  'dzikir':   { primary: ['الذكر'], contains: 'ذكر', lemmaRoot: 'ذكر' },
  'zikir':    { primary: ['الذكر'], contains: 'ذكر', lemmaRoot: 'ذكر' },
  'shalawat': { primary: ['صلوات'], contains: 'صلوات', lemmaRoot: 'صلوات' },
  'sujud':    { primary: ['السجود'], contains: 'سجد', lemmaRoot: 'سجد' },
  'kurban':   { primary: ['قربان', 'قربانا', 'بقربان'], contains: 'قربان', lemmaRoot: 'قربان' },
  'qurban':   { primary: ['قربان', 'قربانا', 'بقربان'], contains: 'قربان', lemmaRoot: 'قربان' },
  'iman':     { primary: ['الإيمان'], contains: 'إيمان', lemmaRoot: 'إيمان' },
  'islam':    { primary: ['الإسلام'], contains: 'إسلام', lemmaRoot: 'إسلام' },
  'muslim':   { primary: ['المسلمين'], contains: 'مسلم', lemmaRoot: 'مسلم' },
  'takwa':    { primary: ['التقوى'], contains: 'تقوى', lemmaRoot: 'تقوى|المتقين' },
  'taqwa':    { primary: ['التقوى'], contains: 'تقوى', lemmaRoot: 'تقوى|المتقين' },
  'syukur':   { primary: ['شكر'], contains: 'شكر', lemmaRoot: 'شكر' },
  'taubat':   { primary: ['التوبة'], contains: 'توبة', lemmaRoot: 'توب' },
  'kafir':    { primary: ['الكفار'], contains: 'كفار', lemmaRoot: 'كفر' },
  'munafik':  { primary: ['المنافقون'], contains: 'نافق', lemmaRoot: 'نافق' },
  'syirik':   { primary: ['المشركون'], contains: 'شرك', lemmaRoot: 'شرك' },
  'musyrik':  { primary: ['المشركون'], contains: 'شرك', lemmaRoot: 'شرك' },
  'fitnah':   { primary: ['الفتنة'], contains: 'فتنة', lemmaRoot: 'فتن' },
  'ghaib':    { primary: ['الغيب'], contains: 'غيب', lemmaRoot: 'غيب' },
  'wahyu':    { primary: ['وحي'], contains: 'وحي', lemmaRoot: 'وحي' },
  'rasul':    { primary: ['الرسول'], contains: 'رسول', lemmaRoot: 'رسول|رسل' },
  'hidayah':  { primary: ['الهدى'], contains: 'هدى', lemmaRoot: 'هدى' },
  'rahmat':   { primary: ['الرحمة'], contains: 'رحمة', lemmaRoot: 'رحمة' },
  'rezeki':   { primary: ['الرزق'], contains: 'رزق', lemmaRoot: 'رزق' },
  'rizki':    { primary: ['الرزق'], contains: 'رزق', lemmaRoot: 'رزق' },
  'jihad':    { primary: ['جهادا'], contains: 'جهاد', lemmaRoot: 'جهاد|جاهد' },
  'hijrah':   { primary: ['هاجر'], contains: 'هاجر', lemmaRoot: 'هاجر' },
  'azab':     { primary: ['العذاب'], contains: 'عذاب', lemmaRoot: 'عذاب' },
  'syafaat':  { primary: ['الشفاعة'], contains: 'شفاعة', lemmaRoot: 'شفاع' },
  'taurat':   { primary: ['التوراة'], contains: 'توراة', lemmaRoot: 'توراة' },
  'injil':    { primary: ['الإنجيل'], contains: 'نجيل', lemmaRoot: 'نجيل' },
  'zabur':    { primary: ['الزبور'], contains: 'زبور', lemmaRoot: 'زبور' },
  'makkah':   { primary: ['مكة'], contains: 'مكة', lemmaRoot: 'مكة' },
  'mekah':    { primary: ['مكة'], contains: 'مكة', lemmaRoot: 'مكة' },
  'bakkah':   { primary: ['بكة'], contains: 'بكة', lemmaRoot: 'بكة' },
  'madinah':  { primary: ['المدينة'], contains: 'مدينة', lemmaRoot: 'مدينة' },
  'kaabah':   { primary: ['الكعبة'], contains: 'كعبة', lemmaRoot: 'كعبة' },
  'kabah':    { primary: ['الكعبة'], contains: 'كعبة', lemmaRoot: 'كعبة' },
  'masjid':   { primary: ['المسجد'], contains: 'مسجد', lemmaRoot: 'مسجد|مساجد' },
  'kiamat':   { primary: ['القيامة'], contains: 'قيامة', lemmaRoot: 'قيامة' },
  'barzakh':  { primary: ['برزخ'], contains: 'برزخ', lemmaRoot: 'برزخ' },
  'hisab':    { primary: ['الحساب'], contains: 'حساب', lemmaRoot: 'حساب' },
  'mizan':    { primary: ['الميزان'], contains: 'ميزان', lemmaRoot: 'ميزان|موازين' },
  'timbangan': { primary: ['الميزان'], contains: 'ميزان', lemmaRoot: 'ميزان|موازين' },
  'shirath':  { primary: ['الصراط'], contains: 'صراط', lemmaRoot: 'صراط' },
  'sirath':   { primary: ['الصراط'], contains: 'صراط', lemmaRoot: 'صراط' },
  'jahanam':  { primary: ['جهنم'], contains: 'جهنم', lemmaRoot: 'جهنم' },
  'jahannam': { primary: ['جهنم'], contains: 'جهنم', lemmaRoot: 'جهنم' },
  'firdaus':  { primary: ['الفردوس'], contains: 'فردوس', lemmaRoot: 'فردوس' },
  'bulan':    { primary: ['الشهر'], contains: 'شهر', lemmaRoot: 'شهر' },
  'ramadhan': { primary: ['رمضان'], contains: 'رمضان', lemmaRoot: 'رمضان' },
  'ramadan':  { primary: ['رمضان'], contains: 'رمضان', lemmaRoot: 'رمضان' },
  'qadar':    { primary: ['القدر'], contains: 'قدر', lemmaRoot: 'قدر' },
  'ad':       { primary: ['عاد'], contains: 'عاد', lemmaRoot: 'عاد' },
  'tsamud':   { primary: ['ثمود'], contains: 'ثمود', lemmaRoot: 'ثمود' },
  'israil':   { primary: ['إسرائيل'], contains: 'سرائيل', lemmaRoot: 'سرائيل' },
  'yajuj':    { primary: ['يأجوج'], contains: 'أجوج', lemmaRoot: 'أجوج' },
  // Keluarga muamalah & dosa besar (ditambahkan 22 Okt — sempat terlewat)
  'riba':     { primary: ['الربا'], contains: 'ربا', lemmaRoot: 'ربا' },
  'zina':     { primary: ['الزنا', 'الزاني', 'الزانية'], contains: 'زان', lemmaRoot: 'زنا|زان|يزن' },
  'khamr':    { primary: ['الخمر'], contains: 'خمر', lemmaRoot: 'خمر' },
  'miras':    { primary: ['الخمر'], contains: 'خمر', lemmaRoot: 'خمر' },
  'maisir':   { primary: ['الميسر', 'والميسر'], contains: 'ميسر', lemmaRoot: 'ميسر' },
  'judi':     { primary: ['الميسر', 'والميسر'], contains: 'ميسر', lemmaRoot: 'ميسر' },
  'sihir':    { primary: ['السحر'], contains: 'سحر', lemmaRoot: 'سحر' },
  'dosa':     { primary: ['الذنب'], contains: 'ذنب', lemmaRoot: 'ذنب' },
  'amanah':   { primary: ['الأمانة'], contains: 'أمانات', lemmaRoot: 'أمانة|أمانات|أمانت' },
  // الإخلاص sebagai masdar tidak pernah muncul telanjang (0x) — yang ada bentuk-bentuk mukhlis/mukhlas
  'ikhlas':   { primary: ['المخلصين', 'مخلصين', 'مخلصا'], contains: 'خلص', lemmaRoot: 'خلص' },
}

export function transliterate(input: string): string[] {
  const lower = input.trim().toLowerCase()
  const entry = TRANSLIT_MAP[lower]
  if (entry) {
    return entry.primary.map(normalize)
  }
  return []
}

// Get the right search term based on mode for transliterated queries
function getTranslitTerm(query: string, mode: 'exact' | 'contains' | 'lemma' | 'root'): string | null {
  const lower = query.trim().toLowerCase()
  const entry = TRANSLIT_MAP[lower]
  if (!entry) return null
  if (mode === 'exact') return normalize(entry.primary[0])
  if (mode === 'contains') return normalize(entry.contains)
  // lemma/root: use the shortest root pattern
  return normalize(entry.lemmaRoot)
}

// ── Detect Arabic ──────────────────────────────────────────────────────────

function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

// ── Resolve query to Arabic normalized forms ───────────────────────────────

function resolveArabicTerms(query: string): string[] {
  const trimmed = query.trim()
  if (isArabic(trimmed)) {
    return [normalize(trimmed)]
  }
  const forms = transliterate(trimmed)
  if (forms.length > 0) return forms
  // fallback: return the raw input normalized
  return [normalize(trimmed)]
}

// ── Search functions ───────────────────────────────────────────────────────

export function searchExact(
  term: string,
  verses: Verse[],
  wordIndex: WordIndex
): { count: number; verseIds: number[] } {
  const normalized = normalize(term)
  const entries = wordIndex[normalized]
  if (!entries) return { count: 0, verseIds: [] }
  const uniqueVerses = [...new Set(entries.map(e => e.verse_id))]
  return { count: entries.length, verseIds: uniqueVerses }
}

export function searchContains(
  term: string,
  _verses: Verse[],
  wordIndex: WordIndex
): { count: number; verseIds: number[] } {
  const normalized = normalize(term)
  const verseSet = new Set<number>()
  let count = 0
  const tokens = Object.keys(wordIndex)
  for (const token of tokens) {
    if (token.includes(normalized)) {
      const entries = wordIndex[token]
      count += entries.length
      for (const e of entries) verseSet.add(e.verse_id)
    }
  }
  return { count, verseIds: [...verseSet].sort((a, b) => a - b) }
}

export function searchLemma(
  term: string,
  _verses: Verse[],
  wordIndex: WordIndex
): { count: number; verseIds: number[]; breakdown: { form: string; count: number }[] } {
  const normalized = normalize(term)
  // Support pipe-separated patterns for multi-form lemmas (e.g. شيط|شياطين)
  const patterns = normalized.split('|').map(p => p.trim()).filter(Boolean)
  const verseSet = new Set<number>()
  const breakdown: { form: string; count: number }[] = []
  let totalCount = 0
  const tokens = Object.keys(wordIndex)

  for (const token of tokens) {
    const matches = patterns.some(pattern => token.includes(pattern))
    if (matches) {
      const entries = wordIndex[token]
      breakdown.push({ form: token, count: entries.length })
      totalCount += entries.length
      for (const e of entries) verseSet.add(e.verse_id)
    }
  }

  breakdown.sort((a, b) => b.count - a.count)
  return { count: totalCount, verseIds: [...verseSet].sort((a, b) => a - b), breakdown }
}

// ── Main search dispatcher ─────────────────────────────────────────────────

export function search(
  query: string,
  mode: 'exact' | 'contains' | 'lemma' | 'root',
  verses: Verse[],
  wordIndex: WordIndex
): SearchResult {
  const trimmed = query.trim()
  const isAr = isArabic(trimmed)
  
  // For transliterated queries, use mode-specific term resolution
  const translitTerm = !isAr ? getTranslitTerm(trimmed, mode) : null
  
  // Determine the search term based on mode
  let searchTerm: string
  if (isAr) {
    searchTerm = normalize(trimmed)
  } else if (translitTerm) {
    searchTerm = translitTerm
  } else {
    searchTerm = normalize(trimmed)
  }
  
  // Display term (for UI)
  const displayTerm = isAr ? normalize(trimmed) : (transliterate(trimmed)[0] || normalize(trimmed))

  if (mode === 'exact') {
    // For exact: try the primary form(s)
    const forms = !isAr ? (TRANSLIT_MAP[trimmed.toLowerCase()]?.primary.map(normalize) || [searchTerm]) : [searchTerm]
    const allVerseIds = new Set<number>()
    let totalCount = 0
    for (const form of forms) {
      const r = searchExact(form, verses, wordIndex)
      totalCount += r.count
      for (const id of r.verseIds) allVerseIds.add(id)
    }
    return {
      query, arabicTerm: displayTerm, mode, totalCount,
      verseIds: [...allVerseIds].sort((a, b) => a - b),
    }
  }

  if (mode === 'contains') {
    const r = searchContains(searchTerm, verses, wordIndex)
    return {
      query, arabicTerm: displayTerm, mode, totalCount: r.count,
      verseIds: r.verseIds,
    }
  }

  if (mode === 'lemma' || mode === 'root') {
    const r = searchLemma(searchTerm, verses, wordIndex)
    return {
      query, arabicTerm: displayTerm, mode, totalCount: r.count,
      verseIds: r.verseIds, breakdown: r.breakdown,
    }
  }

  return { query, arabicTerm: displayTerm, mode, totalCount: 0, verseIds: [] }
}

// ── Highlight helper ───────────────────────────────────────────────────────

type HighlightMode = 'exact' | 'contains' | 'lemma' | 'root'

/**
 * Build the word matcher for highlighting. It mirrors the ACTIVE search mode
 * exactly — a word is highlighted iff the search in that mode counts it.
 * (Sebelumnya highlight hanya tahu bentuk primary, jadi ayat yang tertangkap
 * mode Lemma/+Awalan lewat pola lain tidak ter-highlight sama sekali.)
 */
function buildHighlighter(searchQuery: string, mode: HighlightMode): (normalizedWord: string) => boolean {
  const trimmed = searchQuery.trim()
  if (isArabic(trimmed)) {
    const term = normalize(trimmed)
    return mode === 'exact'
      ? (w) => w === term
      : (w) => w.includes(term)
  }
  const entry = TRANSLIT_MAP[trimmed.toLowerCase()]
  if (!entry) {
    const term = normalize(trimmed)
    return (w) => w.includes(term)
  }
  if (mode === 'exact') {
    const forms = entry.primary.map(normalize)
    return (w) => forms.includes(w)
  }
  if (mode === 'contains') {
    const pattern = normalize(entry.contains)
    return (w) => w.includes(pattern)
  }
  const patterns = normalize(entry.lemmaRoot).split('|').map((p) => p.trim()).filter(Boolean)
  return (w) => patterns.some((p) => w.includes(p))
}

export interface MatchedToken {
  pos: number
  token: string
}

/**
 * Token predicate that mirrors search() for the active mode, applied to
 * word-index tokens (ejaan imla'i). Dipakai untuk highlight berbasis posisi:
 * teks Utsmani ejaannya berbeda sistematis dari token indeks (ٱلدُّنْيَا vs
 * الدنيا، الشيطن vs الشيطان), jadi mencocokkan string ke teks Utsmani mentah
 * PASTI meleset — yang setia adalah posisi tokennya (indeks menunjuk token
 * text_simple, terverifikasi 99,95%).
 */
function buildTokenPredicate(searchQuery: string, mode: HighlightMode): (token: string) => boolean {
  const trimmed = searchQuery.trim()
  if (isArabic(trimmed)) {
    const term = normalize(trimmed)
    return mode === 'exact' ? (t) => t === term : (t) => t.includes(term)
  }
  const entry = TRANSLIT_MAP[trimmed.toLowerCase()]
  if (!entry) {
    const term = normalize(trimmed)
    return (t) => t.includes(term)
  }
  if (mode === 'exact') {
    const forms = entry.primary.map(normalize)
    return (t) => forms.includes(t)
  }
  if (mode === 'contains') {
    const pattern = normalize(entry.contains)
    return (t) => t.includes(pattern)
  }
  const patterns = normalize(entry.lemmaRoot).split('|').map((p) => p.trim()).filter(Boolean)
  return (t) => patterns.some((p) => t.includes(p))
}

/** Semua token yang cocok dengan query+mode, dikelompokkan per ayat, dari word-index. */
export function matchedTokensByVerse(
  searchQuery: string,
  mode: HighlightMode,
  wordIndex: WordIndex
): Map<number, MatchedToken[]> {
  const predicate = buildTokenPredicate(searchQuery, mode)
  const map = new Map<number, MatchedToken[]>()
  for (const token of Object.keys(wordIndex)) {
    if (!predicate(token)) continue
    for (const e of wordIndex[token]) {
      const arr = map.get(e.verse_id)
      if (arr) arr.push({ pos: e.position, token })
      else map.set(e.verse_id, [{ pos: e.position, token }])
    }
  }
  return map
}

/**
 * Highlight kata pada teks Utsmani berdasarkan posisi token yang cocok.
 * Bila jumlah kata Utsmani == simple, posisi memetakan 1:1 (dengan koreksi
 * drift ±1 yang diverifikasi ke token simple). Bila beda (360-an ayat, kata
 * bergandeng di ejaan Utsmani), posisi dipetakan proporsional. Fallback
 * terakhir: predicate yang sama dites ke kata Utsmani yang dinormalisasi.
 */
export function highlightArabic(
  uthmaniText: string,
  simpleText: string,
  matched: MatchedToken[] | undefined,
  searchQuery: string,
  mode: HighlightMode = 'exact'
): string {
  const parts = uthmaniText.split(/(\s+)/)
  const uWordIdx: number[] = [] // index ke parts untuk tiap kata ke-i
  parts.forEach((part, i) => {
    if (!/^\s+$/.test(part) && part !== '') uWordIdx.push(i)
  })
  const sWords = simpleText.split(/\s+/).filter(Boolean)
  const highlighted = new Set<number>() // nomor urut kata (0-based, basis kata)

  if (matched && matched.length > 0) {
    if (uWordIdx.length === sWords.length && sWords.length > 0) {
      for (const m of matched) {
        let placed = false
        for (const q of [m.pos, m.pos - 1, m.pos + 1]) {
          if (q >= 0 && q < sWords.length && normalize(sWords[q]) === m.token) {
            highlighted.add(q)
            placed = true
            break
          }
        }
        if (!placed && m.pos >= 0 && m.pos < uWordIdx.length) highlighted.add(m.pos)
      }
    } else if (sWords.length > 1 && uWordIdx.length > 0) {
      for (const m of matched) {
        const q = Math.round((m.pos * (uWordIdx.length - 1)) / (sWords.length - 1))
        if (q >= 0 && q < uWordIdx.length) highlighted.add(q)
      }
    }
  }

  // Fallback: predicate mode dites ke kata Utsmani ternormalisasi
  const matches = buildHighlighter(searchQuery, mode)
  uWordIdx.forEach((partIdx, wordNo) => {
    if (!highlighted.has(wordNo) && matches(normalize(parts[partIdx]))) {
      highlighted.add(wordNo)
    }
  })

  let wordNo = -1
  return parts
    .map((part) => {
      if (/^\s+$/.test(part) || part === '') return part
      wordNo++
      return highlighted.has(wordNo)
        ? `<span class="text-gold underline decoration-gold/35 underline-offset-[6px]">${part}</span>`
        : part
    })
    .join('')
}
