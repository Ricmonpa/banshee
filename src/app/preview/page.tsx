'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import InteractiveBook from '@/components/InteractiveBook'
import LeadGate from '@/components/LeadGate'

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
  const [leadCaptured, setLeadCaptured] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLeadCaptured(window.localStorage.getItem('banshee_lead_captured') === 'true')
    }
  }, [])

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

  const handleLeadSuccess = () => setLeadCaptured(true)

  const handleContinueToQuestionnaire = () => {
    router.push('/cuestionario')
  }

  // CANDADO 1: si hay preview y aún no hemos capturado lead, mostrar formulario
  if (previewData && !isLoading && !error && leadCaptured !== true) {
    return (
      <LeadGate
        title="Tu prólogo está listo"
        subtitle="Déjanos tu email y nombre para verlo."
        onSuccess={handleLeadSuccess}
      />
    )
  }

  // Si tenemos datos del preview y lead capturado, mostrar el libro interactivo
  if (previewData && !isLoading && !error && leadCaptured === true) {
    const authorName =
      (typeof window !== 'undefined' && window.localStorage.getItem('banshee_lead_name')) ||
      'Tu nombre'
    const bookData = {
      title: previewData.analysis.title,
      author: authorName,
      summary: previewData.analysis.summary,
      tone: previewData.analysis.tone,
      structure: previewData.analysis.structure
    }

    return (
      <InteractiveBook
        bookData={bookData}
        onContinue={handleContinueToQuestionnaire}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream page-texture">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          </div>
          <h2 className="font-serif text-2xl text-carbon">
            Analizando tu voz...
          </h2>
          <p className="font-sans text-warm-gray">
            Estamos creando el ADN de tu libro
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream page-texture">
        <div className="text-center space-y-6 luxury-card max-w-md">
          <p className="font-sans text-carbon/90">{error}</p>
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

  return null
}