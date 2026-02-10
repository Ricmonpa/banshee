'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import VoiceRecorder from '@/components/VoiceRecorder'
import Logo from '@/components/Logo'

export default function HomePage() {
  const [showRecorder, setShowRecorder] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-void text-cream">
      {/* Hero */}
      <header className="flex flex-col items-center justify-center flex-1 px-6 py-20 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-12 md:mb-16">
            <Logo size="xl" variant="dark" />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-6 animate-fade-in">
            Que tu voz haga un libro.
            <br />
            <span className="text-gold/95">Y que un libro haga tu voz.</span>
          </h1>

          <p className="font-sans text-lg md:text-xl text-cream/80 mb-12 md:mb-16 max-w-lg mx-auto leading-relaxed">
            Editorial boutique para líderes que escriben legados
          </p>

          <button
            onClick={() => setShowRecorder(true)}
            className="btn-primary border-gold text-cream hover:bg-gold hover:text-void inline-flex items-center justify-center gap-3 text-lg py-4 px-10"
          >
            <Mic className="w-5 h-5" strokeWidth={1.5} />
            Comenzar mi libro
          </button>
        </div>
      </header>

      {/* Footer minimalista */}
      <footer className="py-6 px-6 border-t border-cream/10">
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