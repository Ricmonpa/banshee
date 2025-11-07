import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface Project {
  id: string
  user_id: string
  title: string
  generated_summary: string
  generated_tone: string
  generated_structure: {
    parte_1: string
    parte_2: string
    parte_3: string
  }
  created_at: string
}

export interface Vignette {
  id: string
  project_id: string
  order: number
  audio_url: string
  transcribed_text: string
  created_at: string
}