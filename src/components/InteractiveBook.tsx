'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import PrologueViewer from './PrologueViewer'
import StructureViewer from './StructureViewer'

interface BookData {
  title: string
  author: string
  summary: string
  tone: string
  structure: {
    parte_1: string
    parte_2: string
    parte_3: string
  }
}

interface InteractiveBookProps {
  bookData: BookData
  onCreateAccount: () => void
}

export default function InteractiveBook({ bookData, onCreateAccount }: InteractiveBookProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const prologueContent = `Este libro nace de una idea poderosa que merece ser compartida con el mundo.

${bookData.summary}

Con un tono ${bookData.tone}, esta obra promete ser un viaje transformador para quienes se atrevan a adentrarse en sus páginas.

La voz del autor resuena con autenticidad y propósito, creando una conexión única con cada lector.`

  const tocChapters = [
    { roman: '', title: 'Prólogo', page: 3 },
    { roman: 'I', title: bookData.structure.parte_1, page: 7 },
    { roman: 'II', title: bookData.structure.parte_2, page: 45 },
    { roman: 'III', title: bookData.structure.parte_3, page: 83 },
    { roman: 'Epílogo', title: 'Epílogo', page: 121 },
    { roman: 'Agradecimientos', title: 'Agradecimientos', page: 125 },
  ]

  const heartContent = `"${bookData.summary}"

Este es el hilo conductor que atraviesa toda la obra, el mensaje que el autor desea grabar en el corazón de cada lector.

Cada capítulo, cada reflexión, cada historia compartida gira en torno a esta verdad fundamental que ha nacido de la experiencia y la sabiduría del autor.`

  const structureContent1 = `INICIO
${bookData.structure.parte_1}
El punto de partida que establece las bases y conecta con el lector.

DESARROLLO
${bookData.structure.parte_2}
El núcleo de la obra donde se desarrollan las ideas principales.`

  const structureContent2 = `CONCLUSIÓN
${bookData.structure.parte_3}
La síntesis final que deja una impresión duradera.

Tono narrativo: ${bookData.tone}

Esta estructura garantiza un flujo natural que guía al lector desde el primer contacto hasta la transformación final.`

  const pages: Array<
    | { type: 'prologue'; sectionLabel: string; content: string; pageNum: number }
    | { type: 'toc'; chapters: typeof tocChapters }
  > = [
    { type: 'prologue', sectionLabel: 'Prólogo', content: prologueContent, pageNum: 3 },
    { type: 'toc', chapters: tocChapters },
    { type: 'prologue', sectionLabel: 'El Corazón del Libro', content: heartContent, pageNum: 7 },
    { type: 'prologue', sectionLabel: 'Estructura de la Obra', content: structureContent1, pageNum: 9 },
    { type: 'prologue', sectionLabel: 'Estructura de la Obra', content: structureContent2, pageNum: 11 },
  ]

  const renderPage = (pageIndex: number) => {
    const p = pages[pageIndex]
    if (!p) return null
    if (p.type === 'toc') {
      return (
        <StructureViewer
          bookTitle={bookData.title}
          chapters={p.chapters}
          className="h-full min-h-[420px] md:min-h-[520px] overflow-y-auto"
        />
      )
    }
    return (
      <PrologueViewer
        bookTitle={bookData.title}
        sectionLabel={p.sectionLabel}
        content={p.content}
        pageNumber={p.pageNum}
        className="h-full min-h-[420px] md:min-h-[520px] overflow-y-auto"
      />
    )
  }

  const nextPage = () => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      if (currentPage < pages.length) setCurrentPage(currentPage + 1)
    } else {
      if (currentPage + 1 < pages.length) setCurrentPage(currentPage + 2)
      else if (currentPage < pages.length) setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      if (currentPage > 0) setCurrentPage(currentPage - 1)
    } else {
      if (currentPage >= 2) setCurrentPage(currentPage - 2)
      else if (currentPage > 0) setCurrentPage(0)
    }
  }

  // ——— Vista: Libro cerrado (luxury cover)
  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream page-texture p-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-carbon mb-2">
            Tu libro está listo
          </h1>
          <p className="text-warm-gray font-sans text-lg">
            Toca el libro para abrirlo
          </p>
        </div>

        <button
          type="button"
          className="relative cursor-pointer transform hover:scale-[1.02] transition-transform duration-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-4 rounded-sm"
          onClick={() => setIsOpen(true)}
        >
          <div className="w-64 md:w-72 h-80 md:h-96 bg-void rounded-sm shadow-book relative overflow-hidden">
            <div className="absolute inset-0 border border-gold/30 rounded-sm" />
            <div className="absolute left-0 top-0 w-2 h-full bg-void border-r border-gold/20 rounded-l-sm" />
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              <h2 className="font-serif text-xl md:text-2xl text-cream leading-tight text-center">
                {bookData.title}
              </h2>
              <p className="font-sans text-sm text-gold/90 text-center tracking-wide">
                {bookData.author}
              </p>
            </div>
          </div>
        </button>

        <p className="mt-10 text-sm text-warm-gray font-sans">
          Haz clic en el libro para explorarlo
        </p>
      </div>
    )
  }

  // ——— Vista: Libro abierto (páginas con PrologueViewer / StructureViewer)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/95 p-4 md:p-8">
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-10 md:-top-12 right-0 text-cream/80 hover:text-cream transition-colors duration-400 z-10"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <div className="bg-cream-dark rounded-sm shadow-book overflow-hidden flex flex-col flex-1 min-h-0 border border-gold/10">
          {currentPage >= pages.length ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
              <h3 className="font-serif text-2xl md:text-3xl text-carbon mb-6 md:mb-8">
                ¿Te gusta lo que ves?
              </h3>
              <p className="text-carbon/80 font-sans text-base md:text-lg mb-10 md:mb-12 leading-relaxed max-w-xl">
                Este es solo el comienzo. Crea tu cuenta para guardar tu progreso y continuar desarrollando tu libro con la ayuda de nuestro Coach IA.
              </p>
              <button
                onClick={onCreateAccount}
                className="btn-primary-inverse text-lg px-10 py-4"
              >
                Crear mi cuenta
              </button>
            </div>
          ) : (
            <>
              <div className="md:hidden flex-1 overflow-y-auto">
                <div className="p-4">{renderPage(currentPage)}</div>
              </div>
              <div className="hidden md:grid md:grid-cols-2 flex-1 min-h-0 overflow-hidden">
                <div className="border-r border-gold/20 overflow-y-auto p-4">
                  {renderPage(currentPage)}
                </div>
                <div className="overflow-y-auto p-4">
                  {currentPage + 1 < pages.length ? (
                    renderPage(currentPage + 1)
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16">
                      <h3 className="font-serif text-2xl text-carbon mb-6">
                        ¿Te gusta lo que ves?
                      </h3>
                      <p className="text-carbon/80 font-sans mb-8 max-w-md leading-relaxed">
                        Crea tu cuenta para guardar tu progreso y continuar con tu libro.
                      </p>
                      <button
                        onClick={onCreateAccount}
                        className="btn-primary-inverse"
                      >
                        Crear mi cuenta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between items-center px-4 py-3 bg-cream border-t border-gold/20 shrink-0">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 text-carbon/70 hover:text-carbon disabled:opacity-40 disabled:cursor-not-allowed font-sans text-sm transition-colors duration-400"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
            <span className="font-serif text-sm text-warm-gray tabular-nums">
              {currentPage + 1} — {pages.length + 1}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage >= pages.length}
              className="flex items-center gap-2 px-4 py-2 text-carbon/70 hover:text-carbon disabled:opacity-40 disabled:cursor-not-allowed font-sans text-sm transition-colors duration-400"
            >
              Siguiente
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
