// State install PWA bersama — dipakai banner CTA (InstallBanner) dan
// tombol install kecil di pojok kanan atas Beranda. Banner yang ditutup
// tidak membuang opsi install selamanya: tombol pojok mengambil alih.
import { useSyncExternalStore } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PwaState {
  deferred: BeforeInstallPromptEvent | null
  isIOS: boolean
  dismissed: boolean
  installed: boolean
}

const DISMISS_KEY = 'tq:pwa-dismissed'

let state: PwaState = { deferred: null, isIOS: false, dismissed: false, installed: false }
const listeners = new Set<() => void>()
let initialized = false

function emit() {
  listeners.forEach((f) => f())
}

function init() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  let dismissed = false
  try {
    dismissed = !!localStorage.getItem(DISMISS_KEY)
  } catch {
    // abaikan
  }
  state = {
    ...state,
    installed: standalone,
    dismissed,
    isIOS: /iphone|ipad|ipod/i.test(window.navigator.userAgent),
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    state = { ...state, deferred: e as BeforeInstallPromptEvent }
    emit()
  })
  window.addEventListener('appinstalled', () => {
    state = { ...state, installed: true, deferred: null }
    emit()
  })
}

function subscribe(fn: () => void) {
  init()
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function getSnapshot(): PwaState {
  return state
}

export function usePwaInstall(): PwaState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function dismissPwaBanner() {
  state = { ...state, dismissed: true }
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // abaikan
  }
  emit()
}

export function reopenPwaBanner() {
  state = { ...state, dismissed: false }
  try {
    localStorage.removeItem(DISMISS_KEY)
  } catch {
    // abaikan
  }
  emit()
}

export async function promptPwaInstall() {
  const d = state.deferred
  if (!d) return
  await d.prompt()
  const choice = await d.userChoice
  if (choice.outcome === 'accepted') {
    state = { ...state, installed: true, deferred: null }
    emit()
  }
}
