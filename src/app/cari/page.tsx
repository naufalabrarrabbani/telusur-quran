import type { Metadata } from 'next'
import { CariPage } from '@/components/screens/CariPage'

export const metadata: Metadata = {
  title: 'Hasil Pencarian — Telusur Qur\'an',
  description: 'Hasil penelusuran kata di Al-Qur\'an dengan mode hitung yang transparan: kata persis, awalan, lemma, dan akar kata.',
}

export default function Cari() {
  return <CariPage />
}
