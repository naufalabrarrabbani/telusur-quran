// Generate ikon PWA / favicon / OG image dari logo HijaLearn
// (sumber: assets-src/icon_logo.svg — SVG favicon hijalearn.id).
// Jalankan: node scripts/build-icons.mjs
import sharp from 'sharp'
import { copyFileSync, mkdirSync } from 'node:fs'

const PAPER = '#FAF9F5'
const EMERALD_DEEP = '#0F4430'
const GOLD = '#C9A633'

import { readFileSync } from 'node:fs'
const svg = readFileSync('assets-src/icon_logo.svg')

async function markPng(size, ratio = 0.8) {
  const inner = Math.round(size * ratio)
  return sharp(svg, { density: 300 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

async function iconWithBg(size, ratio, out) {
  const mark = await markPng(size, ratio)
  const offset = Math.round((size - Math.round(size * ratio)) / 2)
  await sharp({
    create: { width: size, height: size, channels: 4, background: PAPER },
  })
    .composite([{ input: mark, top: offset, left: offset }])
    .png()
    .toFile(out)
  console.log('OK', out)
}

mkdirSync('public/icons', { recursive: true })

// Ikon install PWA (latar paper, sesuai tema app)
await iconWithBg(192, 0.8, 'public/icons/icon-192.png')
await iconWithBg(512, 0.8, 'public/icons/icon-512.png')
await iconWithBg(512, 0.62, 'public/icons/maskable-512.png')
// Apple touch icon
await iconWithBg(180, 0.82, 'public/apple-touch-icon.png')

// Favicon modern (transparan, seperti aslinya) — konvensi file Next di src/app
{
  const mark = await markPng(512, 0.94)
  await sharp(mark).png().toFile('src/app/icon.png')
  console.log('OK src/app/icon.png')
}
// Favicon klasik: pakai file .ico hijalearn.id apa adanya
copyFileSync('assets-src/favicon-src.ico', 'src/app/favicon.ico')
console.log('OK src/app/favicon.ico')
// Logo SVG untuk UI (banner dsb.)
copyFileSync('assets-src/icon_logo.svg', 'public/logo.svg')
console.log('OK public/logo.svg')

// OG image 1200×630: latar emerald, ubin paper berisi logo + teks
{
  const W = 1200
  const H = 630
  const canvasSvg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${EMERALD_DEEP}"/>
    <rect x="90" y="135" width="360" height="360" rx="72" fill="${PAPER}"/>
    <text x="498" y="298" font-family="sans-serif" font-size="74" font-weight="800" fill="#FFFFFF">Telusur Qur'an</text>
    <text x="502" y="356" font-family="sans-serif" font-size="31" font-weight="600" fill="${GOLD}">Cari kata · Cek klaim · Baca tajwid</text>
    <text x="502" y="416" font-family="sans-serif" font-size="30" font-weight="600" fill="rgba(255,255,255,0.65)">hijalearn.id</text>
  </svg>`
  const base = await sharp(Buffer.from(canvasSvg)).png().toBuffer()
  const mark = await markPng(360, 0.78)
  await sharp(base)
    .composite([{ input: mark, top: 135 + Math.round((360 - Math.round(360 * 0.78)) / 2), left: 90 + Math.round((360 - Math.round(360 * 0.78)) / 2) }])
    .png()
    .toFile('public/og-image.png')
  console.log('OK public/og-image.png')
}
