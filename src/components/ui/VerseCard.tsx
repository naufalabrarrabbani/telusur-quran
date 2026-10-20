interface VerseCardProps {
  surah: string
  ayahRef: string
  arabic: string
  translation: string
  juz?: string
  featured?: boolean
  featuredCaption?: string
}

export function VerseCard({
  surah,
  ayahRef,
  arabic,
  translation,
  juz,
  featured,
  featuredCaption,
}: VerseCardProps) {
  const baseClasses = 'bg-surface border border-line rounded-[6px] p-4 mt-[10px]'
  const featuredClasses = featured
    ? 'border-[1.5px] border-emerald bg-[linear-gradient(160deg,rgba(26,107,74,0.03),var(--color-surface)_50%)] shadow-[0_2px_16px_rgba(26,107,74,0.08)] mt-[18px]'
    : ''

  return (
    <article className={`${baseClasses} ${featuredClasses}`}>
      {featured && (
        <div className="flex items-center gap-[6px] text-[11px] font-extrabold tracking-[0.04em] text-emerald uppercase mb-[10px]">
          ★ Ayat Unggulan
        </div>
      )}
      <div className="flex justify-between items-center mb-[10px]">
        <span className="text-[11px] font-extrabold tracking-[0.04em] text-emerald uppercase">
          {surah} · {ayahRef}
        </span>
        {juz && (
          <span className="text-[11px] font-semibold text-ink-4">{juz}</span>
        )}
      </div>
      <p
        className="text-[23px] leading-[2.05] text-right text-ink m-0"
        style={{ fontFamily: 'Amiri, serif', direction: 'rtl', unicodeBidi: 'isolate' }}
        dangerouslySetInnerHTML={{ __html: arabic }}
      />
      <p className="text-[13px] leading-[1.7] text-ink-3 mt-[10px] mb-0">
        {translation}
      </p>
      {featuredCaption && (
        <p className="mt-[10px] pt-[10px] border-t border-line-soft text-[13px] leading-[1.6] text-ink-3 font-semibold">
          {featuredCaption}
        </p>
      )}
    </article>
  )
}
