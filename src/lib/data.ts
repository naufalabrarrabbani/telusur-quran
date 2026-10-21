// Data loader — static JSON imports resolved at build time

import versesData from '@/data/verses.json'
import wordIndexData from '@/data/word-index.json'
import surahMetaData from '@/data/surah-meta.json'
import type { Verse, WordIndex, SurahMeta } from '@/lib/search'

export const verses: Verse[] = versesData as Verse[]
export const wordIndex: WordIndex = wordIndexData as unknown as WordIndex
export const surahMeta: SurahMeta[] = surahMetaData as SurahMeta[]

export function getVerse(id: number): Verse | undefined {
  return verses[id]
}

export function getSurah(surahNo: number): SurahMeta | undefined {
  return surahMeta.find(s => s.number === surahNo)
}
