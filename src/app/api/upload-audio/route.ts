import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  console.log('🎤 Upload audio API called')
  
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    console.log('📁 Audio file received:', {
      name: audioFile?.name,
      size: audioFile?.size,
      type: audioFile?.type
    })
    
    if (!audioFile) {
      console.error('❌ No audio file provided')
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Generar nombre único para el archivo
    const fileName = `recording_${Date.now()}.webm`
    console.log('📝 Generated filename:', fileName)
    
    // Subir a Supabase Storage
    console.log('☁️ Uploading to Supabase Storage...')
    const { data, error } = await supabase.storage
      .from('audio-recordings')
      .upload(fileName, audioFile, {
        contentType: audioFile.type,
        upsert: false
      })

    if (error) {
      console.error('❌ Supabase upload error:', error)
      return NextResponse.json({ 
        error: 'Failed to upload audio', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Upload successful:', data)

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('audio-recordings')
      .getPublicUrl(fileName)

    console.log('🔗 Public URL generated:', publicUrl)

    return NextResponse.json({ audioUrl: publicUrl })
  } catch (error) {
    console.error('💥 Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}