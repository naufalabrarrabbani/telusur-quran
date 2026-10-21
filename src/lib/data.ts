// Data loader — fetches JSON at runtime from /data/ (static assets in public/)

import type { Verse, WordIndex, SurahMeta } from '@/lib/search'

interface QuranData {
  verses: Verse[]
  wordIndex: WordIndex
  surahMeta: SurahMeta[]
}

let cached: QuranData | null = null
let loading: Promise<QuranData> | null = null

export async function loadData(): Promise<QuranData> {
  if (cached) return cached
  if (loading) return loading

  loading = (async () => {
    const [versesRes, wordIndexRes, surahMetaRes] = await Promise.all([
      fetch('/data/verses.json'),
      fetch('/data/word-index.json'),
      fetch('/data/surah-meta.json'),
    ])
    const verses = (await versesRes.json()) as Verse[]
    const wordIndex = (await wordIndexRes.json()) as unknown as WordIndex
    const surahMeta = (await surahMetaRes.json()) as SurahMeta[]
    cached = { verses, wordIndex, surahMeta }
    return cached
  })()

  return loading
}

export function getVerse(verses: Verse[], id: number): Verse | undefined {
  return verses[id]
}

export function getSurah(surahMeta: SurahMeta[], surahNo: number): SurahMeta | undefined {
  return surahMeta.find(s => s.number === surahNo)
}
