'use client'

import {
  usePwaInstall,
  dismissPwaBanner,
  promptPwaInstall,
} from '@/lib/pwa-install'

interface InstallBannerProps {
  /** true bila halaman punya TabBar di bawah (app shell); false untuk /cari */
  withTabBar?: boolean
}

// Banner CTA memasang PWA. Android/Chrome: memakai event
// beforeinstallprompt asli. iOS Safari tidak punya event itu — tampilkan
// instruksi manual (Bagikan -> Tambah ke Layar Utama). Tidak tampil bila
// sudah terpasang atau pernah ditutup (sebagai gantinya muncul tombol
// install kecil di pojok kanan atas Beranda).
export function InstallBanner({ withTabBar = true }: InstallBannerProps) {
  const pwa = usePwaInstall()
  const visible = !pwa.installed && !pwa.dismissed && (pwa.deferred !== null || pwa.isIOS)

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: withTabBar ? 'calc(76px + env(safe-area-inset-bottom))' : 'calc(16px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        padding: '0 20px',
        zIndex: 30,
      }}
    >
      <div className="bg-emerald-deep text-white rounded-[8px] shadow-[0_10px_36px_rgba(15,68,48,0.4)] p-[13px_14px] flex gap-[11px] items-center relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Logo HijaLearn"
          className="flex-none w-[38px] h-[38px] bg-paper rounded-[9px] p-[5px]"
        />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold leading-[1.3]">Pasang jadi aplikasi 📲</div>
          {pwa.isIOS ? (
            <p className="m-0 mt-[2px] text-[12px] leading-[1.5] text-white/75">
              Ketuk ikon{' '}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-[-1px]">
                <path d="M12 15V4" />
                <path d="M8 7l4-4 4 4" />
                <path d="M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
              </svg>{' '}
              <strong className="text-white">Bagikan</strong>, lalu pilih{' '}
              <strong className="text-white">“Tambah ke Layar Utama”</strong>.
            </p>
          ) : (
            <p className="m-0 mt-[2px] text-[12px] leading-[1.5] text-white/75">
              Buka lebih cepat dari layar utama, tanpa bilah browser.
            </p>
          )}
        </div>
        {!pwa.isIOS && pwa.deferred && (
          <button
            onClick={promptPwaInstall}
            className="flex-none bg-gold-light text-emerald-deep border-none rounded-[6px] px-[13px] py-[8px] text-[12.5px] font-extrabold cursor-pointer"
          >
            Instal
          </button>
        )}
        <button
          onClick={dismissPwaBanner}
          aria-label="Tutup banner instal"
          className="flex-none self-start bg-none border-none cursor-pointer text-white/60 hover:text-white text-[14px] font-bold p-0 leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
