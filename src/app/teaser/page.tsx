'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'

const CALENDLY_URL = 'https://calendly.com/priscila-a-potenttial'

interface TeaserData {
  chapter1Teaser: string
  coverMockupTitle: string
  bookTitle: string
}

export default function TeaserPage() {
  const router = useRouter()
  const [data, setData] = useState<TeaserData | null>(null)

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('banshee_teaser_data') : null
    if (!raw) {
      router.replace('/')
      return
    }
    try {
      setData(JSON.parse(raw))
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream page-texture">
        <div className="w-10 h-10 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream page-texture py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <p className="font-sans text-sm text-gold text-center uppercase tracking-wider">Tu primer capítulo</p>
        <h1 className="font-serif text-2xl md:text-3xl text-carbon text-center">{data.bookTitle}</h1>

        {/* Portada mockup (placeholder con título) */}
        <div className="bg-void rounded-sm p-8 md:p-12 text-center border border-gold/20 shadow-book">
          <p className="font-serif text-cream text-lg md:text-xl leading-tight">{data.coverMockupTitle}</p>
        </div>

        {/* Teaser del capítulo */}
        <div className="luxury-card">
          <p className="font-serif text-xs tracking-[0.35em] text-gold uppercase mb-4">Capítulo 1 — Teaser</p>
          <div className="font-serif text-carbon text-lg leading-[1.85] whitespace-pre-line">
            {data.chapter1Teaser}
          </div>
        </div>

        {/* CANDADO 2: Calendly */}
        <div className="luxury-card border-gold/30 text-center">
          <h2 className="font-serif text-xl md:text-2xl text-carbon mb-2">Para continuar con tu libro</h2>
          <p className="font-sans text-warm-gray mb-6">
            Agenda una llamada con nosotros. Revisamos tu proyecto y te contamos los siguientes pasos.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-inverse inline-flex items-center justify-center gap-2 py-4 px-8"
          >
            <Calendar className="w-5 h-5" />
            Agendar mi llamada
          </a>
        </div>
      </div>
    </div>
  )
}
