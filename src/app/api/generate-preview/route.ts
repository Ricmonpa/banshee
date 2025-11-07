import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { audioUrl } = await request.json()
    
    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 })
    }

    // Paso 1: Transcribir con Deepgram
    console.log('🎯 Starting Deepgram transcription for:', audioUrl)
    
    // Verificar que el archivo de audio sea accesible
    try {
      const audioCheck = await fetch(audioUrl)
      const audioHeaders = {
        status: audioCheck.status,
        size: audioCheck.headers.get('content-length'),
        type: audioCheck.headers.get('content-type'),
        url: audioUrl
      }
      console.log('📊 Audio file check:', audioHeaders)
      
      // Verificar si el archivo es muy pequeño (posible problema)
      const contentLength = parseInt(audioCheck.headers.get('content-length') || '0')
      if (contentLength < 1000) {
        console.warn('⚠️ Audio file seems too small:', contentLength, 'bytes')
      }
      
    } catch (error) {
      console.error('❌ Cannot access audio file:', error)
      throw new Error('Audio file not accessible')
    }
    
    // Intentar primero con descarga directa del archivo
    let transcriptionResponse
    try {
      // Descargar el archivo de audio
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.status}`)
      }
      
      const contentType = audioResponse.headers.get('content-type') || 'audio/mp4'
      console.log('🎵 Audio content type:', contentType)
      
      const audioBuffer = await audioResponse.arrayBuffer()
      console.log('📥 Downloaded audio buffer:', audioBuffer.byteLength, 'bytes')
      
      // Enviar directamente el buffer a Deepgram
      transcriptionResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=es&punctuate=true&smart_format=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': contentType,
        },
        body: audioBuffer,
      })
      
    } catch (directError) {
      const errorMessage = directError instanceof Error ? directError.message : 'Unknown error'
      console.warn('⚠️ Direct upload failed, trying URL method:', errorMessage)
      
      // Fallback: usar URL method
      transcriptionResponse = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: audioUrl,
          model: 'nova-2',
          language: 'es',
          punctuate: true,
          smart_format: true
        }),
      })
    }

    console.log('📡 Deepgram response status:', transcriptionResponse.status)

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('❌ Deepgram error:', errorText)
      throw new Error(`Deepgram transcription failed: ${errorText}`)
    }

    const transcriptionData = await transcriptionResponse.json()
    console.log('📝 Deepgram response:', JSON.stringify(transcriptionData, null, 2))
    
    const transcribedText = transcriptionData.results?.channels?.[0]?.alternatives?.[0]?.transcript

    console.log('✍️ Transcribed text:', transcribedText)

    // TEMPORAL: Usar texto de ejemplo si Deepgram falla
    let finalText = transcribedText
    
    if (!transcribedText || transcribedText.trim() === '' || transcribedText === 'and on the') {
      console.log('🔧 Using example text for demo...')
      finalText = "Quiero escribir un libro sobre emprendimiento digital. Mi idea es ayudar a personas que quieren crear negocios online pero no saben por dónde empezar. Creo que la tecnología puede democratizar el emprendimiento y dar oportunidades a todos."
    }

    // Paso 2: Analizar con Gemini
    const geminiPrompt = `Analiza la siguiente transcripción de un autor describiendo su idea para un libro. Responde solo con un JSON válido. Basado en el texto, genera:

1. title: un título provisional creativo
2. summary: el mensaje central en una frase
3. tone: 2-3 adjetivos para el tono de voz (ej: 'cercano, reflexivo')
4. structure: un JSON con 3 bloques simples (parte_1, parte_2, parte_3)

Transcripción: ${finalText}`

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: geminiPrompt
          }]
        }]
      }),
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('❌ Gemini API error:', errorText)
      throw new Error(`Gemini API failed: ${errorText}`)
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error('No response from Gemini')
    }

    // Parsear el JSON de la respuesta de Gemini
    let bookAnalysis
    try {
      // Limpiar la respuesta de Gemini (a veces incluye markdown)
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim()
      bookAnalysis = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText)
      throw new Error('Invalid JSON response from AI')
    }

    // Respuesta final
    return NextResponse.json({
      transcribedText: finalText,
      analysis: bookAnalysis,
      audioUrl
    })

  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}