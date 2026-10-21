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
  'surga':    { primary: ['الجنة'], contains: 'جن', lemmaRoot: 'جن' },
  'neraka':   { primary: ['النار'], contains: 'نار', lemmaRoot: 'نار' },
  'ibrahim':  { primary: ['ابراهيم'], contains: 'براهيم', lemmaRoot: 'براهيم' },
  'yusuf':    { primary: ['يوسف'], contains: 'يوسف', lemmaRoot: 'يوسف' },
  'nuh':      { primary: ['نوح'], contains: 'نوح', lemmaRoot: 'نوح' },
  'maryam':   { primary: ['مريم'], contains: 'مريم', lemmaRoot: 'مريم' },
  'hari':     { primary: ['يوم'], contains: 'يوم', lemmaRoot: 'يوم' },
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

/** Wrap occurrences of normalizedTerm in the Uthmani text with a <mark> style span */
export function highlightArabic(uthmaniText: string, searchQuery: string): string {
  const arabicTerms = resolveArabicTerms(searchQuery)
  const words = uthmaniText.split(/(\s+)/)
  const highlighted = words.map(word => {
    if (/^\s+$/.test(word)) return word
    const normalizedWord = normalize(word)
    for (const term of arabicTerms) {
      if (normalizedWord.includes(term) || term.includes(normalizedWord)) {
        return `<span class="text-gold underline decoration-gold/35 underline-offset-[6px]">${word}</span>`
      }
    }
    return word
  })
  return highlighted.join('')
}
