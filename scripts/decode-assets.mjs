// Aset biner (ikon PNG/ICO & OG image) disimpan di repo sebagai teks
// base64 di folder assets-b64/ karena jalur push ke GitHub yang tersedia
// (MCP push-files / contents API) hanya bisa menulis file teks UTF-8.
// Skrip ini men-decode semuanya ke lokasi aslinya. Terhubung sebagai
// "prebuild" di package.json sehingga berjalan otomatis sebelum
// `next build` — lokal maupun di Vercel. Idempoten.
// Regenerasi .b64 setelah mengganti aset: node scripts/build-icons.mjs
// lalu base64-kan hasilnya (lihat daftar pasangan di bawah).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname } from 'node:path'

const PAIRS = [
  ['assets-b64/icon-192.png.b64', 'public/icons/icon-192.png'],
  ['assets-b64/icon-512.png.b64', 'public/icons/icon-512.png'],
  ['assets-b64/maskable-512.png.b64', 'public/icons/maskable-512.png'],
  ['assets-b64/apple-touch-icon.png.b64', 'public/apple-touch-icon.png'],
  ['assets-b64/og-image.png.b64', 'public/og-image.png'],
  ['assets-b64/app-icon.png.b64', 'src/app/icon.png'],
  ['assets-b64/favicon.ico.b64', 'src/app/favicon.ico'],
]

// Konvensi folder: semua assets-b64/ui/<nama>.png.b64 → public/icons/ui/<nama>.png
// (ikon antarmuka Icons8 yang diwarnai mengikuti palet aplikasi — lihat
// src/components/ui/UiIcon.tsx). Tambah ikon cukup jatuhkan .b64 baru di sana.
try {
  for (const f of readdirSync('assets-b64/ui')) {
    if (!f.endsWith('.png.b64')) continue
    const dest = `public/icons/ui/${f.slice(0, -4)}`
    const b64 = readFileSync(`assets-b64/ui/${f}`, 'utf8').replace(/\s+/g, '')
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, Buffer.from(b64, 'base64'))
    console.log('decode ui', f, '->', dest)
  }
} catch (e) {
  console.warn('lewati folder ui -', e.message)
}

for (const [src, dest] of PAIRS) {
  try {
    const b64 = readFileSync(src, 'utf8').replace(/\s+/g, '')
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, Buffer.from(b64, 'base64'))
    console.log('decode', src, '->', dest)
  } catch (e) {
    console.warn('lewati', src, '-', e.message)
  }
}
