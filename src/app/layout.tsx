import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Telusur Qur\'an — HijaLearn',
  description: 'Cari kata, tokoh, atau fakta di Al-Qur\'an. Semua ayat ketemu, semua angka ditampilkan dengan aturan hitungnya.',
  openGraph: {
    title: 'Telusur Qur\'an — HijaLearn',
    description: 'Mesin penelusuran Al-Qur\'an berbasis akar kata, graf entitas, dan galeri cek klaim.',
    siteName: 'Telusur Qur\'an',
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
