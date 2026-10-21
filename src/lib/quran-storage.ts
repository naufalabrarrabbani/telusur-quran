// localStorage helpers for Baca Qur'an feature

const KEYS = {
  LAST_READ: 'tq_last_read',
  SAVED_AYAT: 'tq_saved_ayat',
  READ_SURAHS: 'tq_read_surahs',
  STREAK: 'tq_streak',
  STREAK_DATE: 'tq_streak_date',
  ARABIC_FONT: 'tq_arabic_font',
  ARABIC_FONT_SIZE: 'tq_arabic_font_size',
  SHOW_TAJWID: 'tq_show_tajwid',
  SHOW_TRANSLATION: 'tq_show_translation',
} as const

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable
  }
}

// Last read position
export function getLastRead(): { surah: number; ayat: number } | null {
  return safeGet<{ surah: number; ayat: number } | null>(KEYS.LAST_READ, null)
}

export function setLastRead(surah: number, ayat: number): void {
  safeSet(KEYS.LAST_READ, { surah, ayat })
}

// Saved ayat (bookmarks)
export function getSavedAyat(): { surah: number; ayat: number }[] {
  return safeGet<{ surah: number; ayat: number }[]>(KEYS.SAVED_AYAT, [])
}

export function toggleSavedAyat(surah: number, ayat: number): boolean {
  const saved = getSavedAyat()
  const idx = saved.findIndex((s) => s.surah === surah && s.ayat === ayat)
  if (idx >= 0) {
    saved.splice(idx, 1)
    safeSet(KEYS.SAVED_AYAT, saved)
    return false
  } else {
    saved.push({ surah, ayat })
    safeSet(KEYS.SAVED_AYAT, saved)
    return true
  }
}

export function isSavedAyat(surah: number, ayat: number): boolean {
  return getSavedAyat().some((s) => s.surah === surah && s.ayat === ayat)
}

// Read surahs tracking
export function getReadSurahs(): number[] {
  return safeGet<number[]>(KEYS.READ_SURAHS, [])
}

export function markSurahRead(surah: number): void {
  const read = getReadSurahs()
  if (!read.includes(surah)) {
    read.push(surah)
    safeSet(KEYS.READ_SURAHS, read)
  }
}

// Streak tracking
export function getStreak(): number {
  return safeGet<number>(KEYS.STREAK, 0)
}

export function updateStreak(): void {
  const today = new Date().toISOString().slice(0, 10)
  const lastDate = safeGet<string | null>(KEYS.STREAK_DATE, null)

  if (lastDate === today) return // already counted today

  if (lastDate) {
    const last = new Date(lastDate)
    const now = new Date(today)
    const diffMs = now.getTime() - last.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    if (diffDays === 1) {
      safeSet(KEYS.STREAK, getStreak() + 1)
    } else if (diffDays > 1) {
      safeSet(KEYS.STREAK, 1)
    }
  } else {
    safeSet(KEYS.STREAK, 1)
  }
  safeSet(KEYS.STREAK_DATE, today)
}

// Migrasi satu kali dari penyimpanan BacaScreen lama (Fase 5A, kunci 'tq:*')
// ke skema penyimpanan ini ('tq_*'). Idempoten: kunci lama dihapus setelah
// digabung, jadi aman dipanggil berulang dari beberapa layar.
export function migrateLegacyBookmarks(): void {
  if (typeof window === 'undefined') return
  try {
    const legacyBookmarks = localStorage.getItem('tq:bookmarks')
    if (legacyBookmarks) {
      const refs = JSON.parse(legacyBookmarks) as string[]
      const saved = getSavedAyat()
      for (const ref of refs) {
        const [s, a] = ref.split(':').map(Number)
        if (s && a && !saved.some((x) => x.surah === s && x.ayat === a)) {
          saved.push({ surah: s, ayat: a })
        }
      }
      safeSet(KEYS.SAVED_AYAT, saved)
      localStorage.removeItem('tq:bookmarks')
    }
    const legacyLastRead = localStorage.getItem('tq:lastread')
    if (legacyLastRead && !getLastRead()) {
      const lr = JSON.parse(legacyLastRead) as { s?: number; a?: number }
      if (lr.s && lr.a) setLastRead(lr.s, lr.a)
      localStorage.removeItem('tq:lastread')
    }
  } catch {
    // abaikan — migrasi gagal tidak boleh mematahkan layar baca
  }
}

// Arabic font preference
export function getArabicFont(): string {
  return safeGet<string>(KEYS.ARABIC_FONT, 'Amiri')
}

export function setArabicFont(font: string): void {
  safeSet(KEYS.ARABIC_FONT, font)
}

// Arabic font size
export function getArabicFontSize(): number {
  return safeGet<number>(KEYS.ARABIC_FONT_SIZE, 28)
}

export function setArabicFontSize(size: number): void {
  safeSet(KEYS.ARABIC_FONT_SIZE, size)
}

// Tajwid visibility
export function getShowTajwid(): boolean {
  return safeGet<boolean>(KEYS.SHOW_TAJWID, true)
}

export function setShowTajwid(val: boolean): void {
  safeSet(KEYS.SHOW_TAJWID, val)
}

// Translation visibility
export function getShowTranslation(): boolean {
  return safeGet<boolean>(KEYS.SHOW_TRANSLATION, true)
}

export function setShowTranslation(val: boolean): void {
  safeSet(KEYS.SHOW_TRANSLATION, val)
}
