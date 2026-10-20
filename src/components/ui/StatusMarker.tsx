'use client'

type StatusType = 'lolos' | 'bersyarat' | 'kontested' | 'belum'

interface StatusMarkerProps {
  status: StatusType
  label: string
}

const statusStyles: Record<StatusType, string> = {
  lolos: 'text-green',
  bersyarat: 'text-gold',
  kontested: 'text-amber',
  belum: 'text-ink-4',
}

const dotStyles: Record<StatusType, string> = {
  lolos: 'bg-green',
  bersyarat: 'bg-gold',
  kontested: 'bg-amber',
  belum: 'bg-ink-4',
}

export function StatusMarker({ status, label }: StatusMarkerProps) {
  return (
    <span className={`inline-flex items-center gap-[5px] text-[11px] font-extrabold tracking-[0.04em] whitespace-nowrap ${statusStyles[status]}`}>
      <span className={`w-[7px] h-[7px] rounded-[1px] ${dotStyles[status]}`} />
      {label}
    </span>
  )
}
