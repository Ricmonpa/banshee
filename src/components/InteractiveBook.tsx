'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

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

  const pages = [
    // Página 0: Prólogo
    {
      title: "Prólogo",
      content: `Este libro nace de una idea poderosa que merece ser compartida con el mundo. 

${bookData.summary}

Con un tono ${bookData.tone}, esta obra promete ser un viaje transformador para quienes se atrevan a adentrarse en sus páginas.

La voz del autor resuena con autenticidad y propósito, creando una conexión única con cada lector.`
    },
    // Página 1: Índice
    {
      title: "Índice",
      content: `CONTENIDO

Prólogo ........................... 3

Parte I: ${bookData.structure.parte_1} ........... 7

Parte II: ${bookData.structure.parte_2} .......... 45

Parte III: ${bookData.structure.parte_3} ......... 83

Epílogo .......................... 121

Agradecimientos .................. 125`
    },
    // Página 2: Mensaje Central
    {
      title: "El Corazón del Libro",
      content: `MENSAJE CENTRAL

"${bookData.summary}"

Este es el hilo conductor que atraviesa toda la obra, el mensaje que el autor desea grabar en el corazón de cada lector.

Cada capítulo, cada reflexión, cada historia compartida gira en torno a esta verdad fundamental que ha nacido de la experiencia y la sabiduría del autor.`
    },
    // Página 3: Estructura - Parte 1
    {
      title: "Estructura de la Obra",
      content: `DESARROLLO NARRATIVO

INICIO
${bookData.structure.parte_1}
El punto de partida que establece las bases y conecta con el lector.

DESARROLLO  
${bookData.structure.parte_2}
El núcleo de la obra donde se desarrollan las ideas principales.`
    },
    // Página 4: Estructura - Parte 2
    {
      title: "Estructura de la Obra",
      content: `CONCLUSIÓN
${bookData.structure.parte_3}
La síntesis final que deja una impresión duradera.

Tono narrativo: ${bookData.tone}

Esta estructura garantiza un flujo natural que guía al lector desde el primer contacto hasta la transformación final.`
    }
  ]

  const nextPage = () => {
    // En móvil: avanza de página en página
    // En escritorio: avanza de 2 en 2 (excepto si es impar al final)
    const isMobile = window.innerWidth < 768
    
    if (isMobile) {
      if (currentPage < pages.length) {
        setCurrentPage(currentPage + 1)
      }
    } else {
      // Escritorio: avanza de 2 en 2, pero si estamos en la penúltima página, avanza de 1 en 1
      if (currentPage + 1 < pages.length) {
        setCurrentPage(currentPage + 2)
      } else if (currentPage < pages.length) {
        setCurrentPage(currentPage + 1)
      }
    }
  }

  const prevPage = () => {
    const isMobile = window.innerWidth < 768
    
    if (isMobile) {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1)
      }
    } else {
      // Escritorio: retrocede de 2 en 2
      if (currentPage >= 2) {
        setCurrentPage(currentPage - 2)
      } else if (currentPage > 0) {
        setCurrentPage(0)
      }
    }
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Tu libro está listo!
          </h1>
          <p className="text-gray-600">
            Haz clic en el libro para ver el preview completo
          </p>
        </div>

        {/* Libro cerrado */}
        <div 
          className="relative cursor-pointer transform hover:scale-105 transition-transform duration-300"
          onClick={() => setIsOpen(true)}
        >
          <div className="w-64 h-80 bg-gradient-to-br from-amber-200 to-amber-400 rounded-r-lg shadow-2xl relative">
            {/* Lomo del libro */}
            <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-b from-amber-300 to-amber-600 rounded-l-lg"></div>
            
            {/* Portada */}
            <div className="ml-4 p-6 h-full flex flex-col justify-between">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4 leading-tight">
                  {bookData.title}
                </h2>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium">
                  Por {bookData.author}
                </p>
              </div>
            </div>

            {/* Efecto de páginas */}
            <div className="absolute right-1 top-1 w-1 h-78 bg-white opacity-30 rounded-r"></div>
            <div className="absolute right-2 top-2 w-1 h-76 bg-white opacity-20 rounded-r"></div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Haz clic en el libro para explorarlo
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 md:p-8">
      {/* Libro abierto */}
      <div className="relative max-w-4xl w-full max-h-[90vh] md:max-h-none">
        {/* Botón cerrar */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-8 md:-top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* Páginas del libro */}
        <div className="bg-gradient-to-br from-amber-50 to-cream-100 rounded-lg shadow-2xl overflow-hidden h-full">
          {/* Página especial para call-to-action */}
          {currentPage >= pages.length ? (
            /* Página completa para call-to-action */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 md:px-8 py-12 md:py-20">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
                ¿Te gusta lo que ves?
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-12 leading-relaxed max-w-2xl">
                Este es solo el comienzo. Crea tu cuenta gratuita para guardar tu progreso y continuar desarrollando tu libro con la ayuda de nuestro Coach IA.
              </p>
              <button
                onClick={onCreateAccount}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 md:py-5 px-8 md:px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-base md:text-lg"
              >
                ✨ Crear mi cuenta gratis
              </button>
            </div>
          ) : (
            <>
              {/* Vista móvil: Una página por pantalla */}
              <div className="md:hidden h-full">
                <div className="w-full px-4 min-h-[400px] h-full">
                  <div className="h-full flex flex-col justify-center py-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                      {pages[currentPage]?.title}
                    </h3>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line overflow-y-auto flex-1">
                      {pages[currentPage]?.content}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista escritorio: Dos páginas por pantalla */}
              <div className="hidden md:flex flex-row h-full">
                {/* Página izquierda */}
                <div className="w-1/2 px-8 border-r border-amber-200 min-h-[500px]">
                  <div className="h-full flex flex-col justify-center py-20">
                    <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                      {pages[currentPage]?.title}
                    </h3>
                    <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line overflow-y-auto">
                      {pages[currentPage]?.content}
                    </div>
                  </div>
                </div>

                {/* Página derecha */}
                <div className="w-1/2 px-8 min-h-[500px]">
                  {currentPage + 1 < pages.length ? (
                    <div className="h-full flex flex-col justify-center py-20">
                      <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                        {pages[currentPage + 1]?.title}
                      </h3>
                      <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line overflow-y-auto">
                        {pages[currentPage + 1]?.content}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        ¿Te gusta lo que ves?
                      </h3>
                      <p className="text-base text-gray-600 mb-8 leading-relaxed max-w-lg">
                        Este es solo el comienzo. Crea tu cuenta gratuita para guardar tu progreso y continuar desarrollando tu libro con la ayuda de nuestro Coach IA.
                      </p>
                      <button
                        onClick={onCreateAccount}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        ✨ Crear mi cuenta gratis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Controles de navegación */}
          <div className="flex justify-between items-center p-4 bg-amber-100 border-t border-amber-200">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>

            <div className="text-sm text-gray-500">
              <span className="md:hidden">Página {currentPage + 1} de {pages.length + 1}</span>
              <span className="hidden md:inline">Página {currentPage + 1} de {pages.length}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage >= pages.length}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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