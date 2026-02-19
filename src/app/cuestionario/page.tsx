'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface BookAnalysis {
  title: string
  summary: string
  tone: string
  structure: { parte_1: string; parte_2: string; parte_3: string }
}

interface PreviewData {
  transcribedText: string
  analysis: BookAnalysis
  audioUrl: string
}

const QUESTIONS = [
  { id: 'mensaje_principal', label: '¿Cuál es el mensaje principal que quieres que el lector se lleve?', placeholder: 'Ej: Que emprender es posible con el enfoque correcto...' },
  { id: 'lector_ideal', label: '¿Quién es tu lector ideal?', placeholder: 'Ej: Emprendedores de 30-50 años...' },
  { id: 'historia_ejemplo', label: '¿Alguna historia o ejemplo para el primer capítulo?', placeholder: 'Opcional.' },
  { id: 'tono_capitulo', label: '¿Qué tono prefieres para el primer capítulo?', placeholder: 'Ej: Más narrativo o más práctico...' },
]

export default function CuestionarioPage() {
  const router = useRouter()
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('banshee_preview_data') : null
    if (!raw) { router.replace('/'); return }
    try { setPreviewData(JSON.parse(raw)) } catch { router.replace('/') }
  }, [router])

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    setError('')
  }

  const canNext = () => {
    const q = QUESTIONS[step]
    if (q.id === 'historia_ejemplo') return true
    return (answers[q.id] ?? '').trim().length > 0
  }

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      if (!canNext()) { setError('Responde esta pregunta para continuar.'); return }
      setStep((s) => s + 1)
      return
    }
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (!previewData || !canNext()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcribedText: previewData.transcribedText, analysis: previewData.analysis, answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar el capítulo')
      if (typeof window !== 'undefined') window.localStorage.setItem('banshee_teaser_data', JSON.stringify(data))
      router.push('/teaser')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream page-texture">
        <div className="w-10 h-10 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  const q = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-cream page-texture flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg luxury-card">
          <p className="font-sans text-sm text-gold mb-4">Pregunta {step + 1} de {QUESTIONS.length}</p>
          <div className="h-1 bg-black/5 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-gold transition-all duration-400" style={{ width: `${progress}%` }} />
          </div>
          <h2 className="font-serif text-xl md:text-2xl text-carbon mb-6 leading-tight">{q.label}</h2>
          <textarea
            value={answers[q.id] ?? ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            rows={4}
            className="w-full px-4 py-3 border border-black/10 bg-white font-sans text-carbon placeholder-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-sm resize-none"
          />
          {error && <p className="mt-3 font-sans text-sm text-red-600">{error}</p>}
          <button type="button" onClick={handleNext} disabled={loading} className="mt-6 btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60">
            {loading ? 'Generando...' : step < QUESTIONS.length - 1 ? 'Siguiente' : 'Generar mi primer capítulo'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
