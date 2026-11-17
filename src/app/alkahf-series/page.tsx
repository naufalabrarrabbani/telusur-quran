import type { Metadata } from 'next'
import { AppShell } from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'Masuk Gua: Seri Al-Kahf — Telusur Qur\'an',
  description: 'Satu surah, empat kisah, dan detail-detail yang mengajak kita kembali ke ayatnya. Al-Kahf, dibaca pelan-pelan.',
}

export default function AlKahfSeries() {
  return <AppShell initialScreen="al-kahf" />
}
