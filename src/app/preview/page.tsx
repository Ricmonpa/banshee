'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import InteractiveBook from '@/components/InteractiveBook'

interface BookAnalysis {
  title: string
  summary: string
  tone: string
  structure: {
    parte_1: string
    parte_2: string
    parte_3: string
  }
}

interface PreviewData {
  transcribedText: string
  analysis: BookAnalysis
  audioUrl: string
}

export default function PreviewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const generatePreview = async () => {
      try {
        // Obtener URL del audio desde localStorage
        const audioUrl = localStorage.getItem('banshee_audio_url')
        
        if (!audioUrl) {
          router.push('/')
          return
        }

        // Limpiar cache anterior para forzar procesamiento real
        localStorage.removeItem('banshee_preview_data')

        console.log('🎯 Processing audio URL:', audioUrl)

        // Generar nuevo preview
        const response = await fetch('/api/generate-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audioUrl }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate preview')
        }

        const data = await response.json()
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('banshee_preview_data', JSON.stringify(data))
        
        setPreviewData(data)
      } catch (err) {
        console.error('Preview error:', err)
        setError('Error al generar el preview. Inténtalo de nuevo.')
      } finally {
        setIsLoading(false)
      }
    }

    generatePreview()
  }, [router])

  const handleCreateAccount = () => {
    // Redirigir al registro manteniendo los datos
    router.push('/auth/register')
  }

  // Si tenemos datos del preview, mostrar el libro interactivo
  if (previewData && !isLoading && !error) {
    const bookData = {
      title: previewData.analysis.title,
      author: "Tu Nombre", // Esto se puede personalizar después
      summary: previewData.analysis.summary,
      tone: previewData.analysis.tone,
      structure: previewData.analysis.structure
    }

    return (
      <InteractiveBook 
        bookData={bookData}
        onCreateAccount={handleCreateAccount}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-banshee-primary mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">
            Analizando tu voz...
          </h2>
          <p className="text-gray-600">
            Estamos creando el ADN de tu libro
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-banshee-accent" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Wow! Acabas de crear el ADN de tu libro.
          </h1>
          <p className="text-gray-600">
            Basado en tu voz, este es el potencial:
          </p>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Título Provisional:
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {previewData.analysis.title}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Mensaje Central:
              </h3>
              <p className="text-lg text-gray-700">
                {previewData.analysis.summary}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Tu Tono de Voz:
              </h3>
              <p className="text-lg text-gray-700">
                {previewData.analysis.tone}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Estructura Sugerida:
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Parte 1:</span> {previewData.analysis.structure.parte_1}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Parte 2:</span> {previewData.analysis.structure.parte_2}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Parte 3:</span> {previewData.analysis.structure.parte_3}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleCreateAccount}
            className="btn-primary text-lg px-8 py-4 mb-4"
          >
            ✨ Crear mi cuenta gratis para guardar
          </button>
          <p className="text-sm text-gray-500">
            Tu progreso se guardará automáticamente
          </p>
        </div>
      </div>
    </div>
  )
}