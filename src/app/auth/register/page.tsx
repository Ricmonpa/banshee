'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Registrar usuario
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Obtener datos del preview desde localStorage
        const previewDataStr = localStorage.getItem('banshee_preview_data')
        
        if (previewDataStr) {
          const previewData = JSON.parse(previewDataStr)
          
          // Crear el primer proyecto del usuario
          const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
              user_id: authData.user.id,
              title: previewData.analysis.title,
              generated_summary: previewData.analysis.summary,
              generated_tone: previewData.analysis.tone,
              generated_structure: previewData.analysis.structure,
            })
            .select()
            .single()

          if (projectError) throw projectError

          // Crear la primera viñeta con la grabación inicial
          const { error: vignetteError } = await supabase
            .from('vignettes')
            .insert({
              project_id: project.id,
              order: 1,
              audio_url: previewData.audioUrl,
              transcribed_text: previewData.transcribedText,
            })

          if (vignetteError) throw vignetteError

          // Limpiar localStorage
          localStorage.removeItem('banshee_preview_data')
          localStorage.removeItem('banshee_audio_url')

          // Redirigir al dashboard del proyecto
          router.push(`/dashboard/project/${project.id}`)
        } else {
          // Si no hay preview data, ir al dashboard general
          router.push('/dashboard')
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear tu cuenta en Banshee
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Guarda tu progreso y continúa escribiendo tu libro
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-banshee-primary focus:border-banshee-primary focus:z-10 sm:text-sm"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-banshee-primary focus:border-banshee-primary focus:z-10 sm:text-sm"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-banshee-primary focus:border-banshee-primary focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-banshee-primary hover:bg-banshee-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-banshee-primary disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <a href="/auth/login" className="text-banshee-primary hover:underline">
                Iniciar sesión
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}