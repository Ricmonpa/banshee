'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import VoiceRecorder from '@/components/VoiceRecorder'
import Logo from '@/components/Logo'

export default function HomePage() {
  const [showRecorder, setShowRecorder] = useState(false)

  return (
    <div className="min-h-[100dvh] flex flex-col bg-void text-cream">
      {/* Hero: contenido que cabe en una pantalla en móviles */}
      <header className="flex flex-1 flex-col items-center justify-center px-4 py-4 sm:py-6 md:py-20 min-h-0">
        <div className="max-w-2xl mx-auto text-center w-full">
          <div className="mb-3 sm:mb-6 md:mb-12 shrink-0">
            <Logo size="lg" variant="dark" className="md:hidden" />
            <Logo size="xl" variant="dark" className="hidden md:block" />
          </div>

          <h1 className="font-serif text-[1.75rem] leading-tight mb-3 sm:text-4xl sm:mb-6 md:text-5xl lg:text-6xl text-cream animate-fade-in">
            Que tu voz haga un libro.
            <br />
            <span className="text-gold/95">Y que un libro haga tu voz.</span>
          </h1>

          <p className="font-sans text-sm sm:text-lg md:text-xl text-cream/80 mb-4 sm:mb-8 md:mb-12 max-w-lg mx-auto leading-relaxed">
            Editorial boutique para líderes que escriben legados
          </p>

          <button
            onClick={() => setShowRecorder(true)}
            className="btn-primary border-gold text-cream hover:bg-gold hover:text-void inline-flex items-center justify-center gap-2 text-base sm:text-lg py-3 sm:py-4 px-8 sm:px-10 shrink-0"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
            Comenzar mi libro
          </button>
        </div>
      </header>

      {/* Footer minimalista */}
      <footer className="py-4 sm:py-6 px-4 sm:px-6 border-t border-cream/10 shrink-0">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cream/60 font-sans">
          <span className="font-serif italic text-cream/50">Since 2025</span>
          <a href="/auth/login" className="hover:text-cream transition-colors duration-400">
            Iniciar sesión
          </a>
          <span className="text-cream/40">Powered by AI. Crafted by Humans.</span>
        </div>
      </footer>

      {showRecorder && (
        <VoiceRecorder onClose={() => setShowRecorder(false)} />
      )}
    </div>
  )
}