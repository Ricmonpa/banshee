'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'
import VoiceRecorder from '@/components/VoiceRecorder'
import Logo from '@/components/Logo'

export default function HomePage() {
  const [showRecorder, setShowRecorder] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="space-y-4">
          <Logo size="xl" />
          <p className="text-xl text-gray-600">
            Que tu voz haga un libro.
          </p>
        </div>

        {/* CTA Principal */}
        <button
          onClick={() => setShowRecorder(true)}
          className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4"
        >
          <Mic className="w-6 h-6" />
          Empezar a grabar
        </button>

        {/* Login secundario */}
        <p className="text-sm text-gray-500">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="text-banshee-primary hover:underline">
            Iniciar sesión
          </a>
        </p>
      </div>

      {/* Modal de grabación */}
      {showRecorder && (
        <VoiceRecorder onClose={() => setShowRecorder(false)} />
      )}
    </div>
  )
}