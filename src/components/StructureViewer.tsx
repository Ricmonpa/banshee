'use client'

interface Chapter {
  roman?: string
  title: string
  page?: number
}

interface StructureViewerProps {
  bookTitle: string
  chapters: Chapter[]
  className?: string
}

export default function StructureViewer({
  bookTitle,
  chapters,
  className = '',
}: StructureViewerProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-sm bg-[#faf8f5]
        shadow-book border border-black/[0.06]
        ${className}
      `}
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0),
          linear-gradient(180deg, #fdfcfa 0%, #f8f5f0 100%)
        `,
        backgroundSize: '20px 20px, 100% 100%',
      }}
    >
      <div className="absolute bottom-8 right-8 font-serif text-[10px] text-warm-gray/40 tracking-[0.2em] uppercase select-none pointer-events-none">
        Banshee Editorial
      </div>

      <div className="relative px-10 sm:px-14 md:px-20 py-14 md:py-20 max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl text-carbon mb-4">
          {bookTitle}
        </h1>
        <p className="font-serif text-xs tracking-[0.35em] text-gold uppercase mb-12">
          Contenido
        </p>

        <ul className="space-y-0">
          {chapters.map((chapter, i) => (
            <li key={chapter.roman}>
              {i > 0 && (
                <div className="border-t border-gold/20 my-6" aria-hidden />
              )}
              <div className="flex items-baseline justify-between gap-4 py-2">
                <div className="flex items-baseline gap-3 min-w-0">
                  {chapter.roman ? (
                    <span className="font-serif text-carbon text-lg shrink-0">
                      {chapter.roman}.
                    </span>
                  ) : null}
                  <span className="font-sans text-carbon text-base md:text-lg">
                    {chapter.title}
                  </span>
                </div>
                {chapter.page != null && (
                  <span className="font-serif text-sm text-warm-gray tabular-nums shrink-0">
                    {chapter.page}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 pt-6 border-t border-gold/20">
          <span className="font-serif text-sm text-warm-gray tabular-nums">5</span>
        </div>
      </div>
    </div>
  )
}
