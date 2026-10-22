// Ikon antarmuka dari Icons8 (set Material Rounded), diambil via MCP Icons8
// lalu diwarnai mengikuti palet aplikasi. Berkas PNG-nya tinggal di
// public/icons/ui/<nama>-<warna>.png, didecode saat build dari
// assets-b64/ui/*.b64 (lihat scripts/decode-assets.mjs).
// Atribusi: Icons8 — dicantumkan di halaman Metodologi & Sumber.
export function UiIcon({
  name,
  size = 16,
  className = '',
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/ui/${name}.png`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`inline-block flex-none select-none ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
