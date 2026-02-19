import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcribedText, analysis, answers } = body

    if (!analysis || !analysis.title) {
      return NextResponse.json({ error: 'Datos del libro incompletos' }, { status: 400 })
    }

    const answersText = Object.entries(answers || {})
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')

    const prompt = `Eres un escritor profesional. Genera un TEASER del primer capítulo de un libro (aproximadamente 400-600 palabras).

CONTEXTO DEL LIBRO:
- Título: ${analysis.title}
- Mensaje central: ${analysis.summary}
- Tono: ${analysis.tone}
- Estructura: Parte 1: ${analysis.structure?.parte_1 || 'N/A'}. Parte 2: ${analysis.structure?.parte_2 || 'N/A'}. Parte 3: ${analysis.structure?.parte_3 || 'N/A'}.

IDEAS DEL AUTOR (cuestionario):
${answersText || 'No especificado.'}

${transcribedText ? `TRANSCRIPCIÓN ORIGINAL DEL AUTOR:\n${transcribedText}` : ''}

INSTRUCCIONES:
- Escribe en prosa narrativa, en primera o tercera persona según convenga.
- El teaser debe enganchar y dar una muestra de calidad; no un resumen.
- Mantén el tono indicado (${analysis.tone}).
- No incluyas título de capítulo ni numeración; solo el cuerpo del texto.
- Responde únicamente con el texto del teaser, sin explicaciones.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', errText)
      throw new Error('Error al generar el capítulo')
    }

    const geminiData = await geminiRes.json()
    const chapterText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    if (!chapterText) {
      throw new Error('No se pudo generar el texto del capítulo')
    }

    // Portada mockup: por ahora devolvemos un placeholder (título para mostrar en UI)
    const coverMockupTitle = analysis.title

    return NextResponse.json({
      chapter1Teaser: chapterText,
      coverMockupTitle,
      bookTitle: analysis.title,
    })
  } catch (error) {
    console.error('Generate chapter error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al generar el capítulo',
      },
      { status: 500 }
    )
  }
}
