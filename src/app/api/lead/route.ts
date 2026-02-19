import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const nombre = typeof name === 'string' && name.trim() ? name.trim() : null

    const { error } = await supabase.from('leads').insert({
      email: email.trim().toLowerCase(),
      name: nombre,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Lead insert error:', error)
      // Si la tabla "leads" no existe, el flujo sigue igual (crear tabla en Supabase)
      if (error.code === '42P01') {
        console.warn('Tabla "leads" no existe. Crear en Supabase con: email (text), name (text), created_at (timestamptz)')
      }
      return NextResponse.json(
        { error: 'No se pudo guardar. Inténtalo de nuevo.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Lead API error:', e)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
