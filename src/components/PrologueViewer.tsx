'use client'

interface PrologueViewerProps {
  bookTitle: string
  sectionLabel: string
  content: string
  pageNumber?: number
  className?: string
}

export default function PrologueViewer({
  bookTitle,
  sectionLabel,
  content,
  pageNumber = 3,
  className = '',
}: PrologueViewerProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-sm
        bg-[#faf8f5]
        shadow-book
        border border-black/[0.06]
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
      {/* Marca de agua sutil */}
      <div
        className="absolute bottom-8 right-8 font-serif text-[10px] text-warm-gray/40 tracking-[0.2em] uppercase select-none pointer-events-none"
        aria-hidden
      >
        Banshee Editorial
      </div>

      <div className="relative px-10 sm:px-14 md:px-20 py-14 md:py-20 max-w-2xl mx-auto">
        {/* Título del libro - serif grande */}
        <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-carbon leading-tight mb-12 md:mb-16">
          {bookTitle}
        </h1>

        {/* Etiqueta de sección: small caps dorado */}
        <p className="font-serif text-xs tracking-[0.35em] text-gold uppercase mb-8">
          {sectionLabel}
        </p>

        {/* Contenido: serif legible, line-height generoso */}
        <div
          className="font-serif text-lg md:text-xl text-carbon leading-[1.85] whitespace-pre-line"
          style={{ letterSpacing: '0.01em' }}
        >
          {content}
        </div>

        {/* Número de página al pie */}
        <div className="mt-16 md:mt-20 pt-6 border-t border-gold/20">
          <span className="font-serif text-sm text-warm-gray tabular-nums">
            {pageNumber}
          </span>
        </div>
      </div>
    </div>
  )
}
