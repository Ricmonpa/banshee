'use client'

import { useState } from 'react'

interface LeadGateProps {
  onSuccess: () => void
  title?: string
  subtitle?: string
}

export default function LeadGate({ onSuccess, title, subtitle }: LeadGateProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('banshee_lead_captured', 'true')
        window.localStorage.setItem('banshee_lead_name', name.trim() || '')
        window.localStorage.setItem('banshee_lead_email', email.trim())
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream page-texture px-4 py-8">
      <div className="luxury-card max-w-md w-full">
        <h2 className="font-serif text-2xl md:text-3xl text-carbon mb-2 text-center">
          {title ?? 'Tu prólogo está listo'}
        </h2>
        <p className="font-sans text-warm-gray text-center mb-8">
          {subtitle ?? 'Déjanos tu email y nombre para verlo.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="lead-name" className="block font-sans text-sm text-carbon mb-1.5">
              Nombre
            </label>
            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 border border-black/10 bg-white font-sans text-carbon placeholder-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold rounded-sm"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="lead-email" className="block font-sans text-sm text-carbon mb-1.5">
              Email <span className="text-warm-gray">*</span>
            </label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 border border-black/10 bg-white font-sans text-carbon placeholder-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold rounded-sm"
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="font-sans text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center py-3.5 disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Ver mi prólogo'}
          </button>
        </form>
      </div>
    </div>
  )
}
