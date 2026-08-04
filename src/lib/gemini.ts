/**
 * Cliente compartido para la API de Gemini (Generative Language).
 *
 * Se usa v1beta: es la versión que expone los modelos 2.x para
 * generateContent. La misma llamada contra /v1 devuelve 404 "model not
 * found" para gemini-2.5-flash, que era la causa de los 500 en
 * /api/generate-preview.
 *
 * Si el modelo principal no existe para la API key en uso, se reintenta
 * con los siguientes de la lista antes de fallar.
 */

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
]

interface GenerateOptions {
  /** Pide a Gemini que responda con JSON puro, sin fences de markdown. */
  json?: boolean
}

export class GeminiError extends Error {
  constructor(message: string, readonly status: number, readonly body: string) {
    super(message)
    this.name = 'GeminiError'
  }
}

/**
 * Ejecuta un prompt y devuelve el texto generado.
 * Lanza GeminiError con el status y el body reales si la API falla.
 */
export async function generateText(prompt: string, options: GenerateOptions = {}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new GeminiError('GEMINI_API_KEY no está configurada', 0, '')
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    ...(options.json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
  })

  let lastError: GeminiError | null = null

  // Modelos duplicados (p.ej. si GEMINI_MODEL ya es uno de los fallbacks) se omiten.
  for (const model of Array.from(new Set(MODEL_CANDIDATES))) {
    const response = await fetch(`${API_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        // Sin texto normalmente significa que el prompt fue bloqueado por filtros.
        const reason = data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason
        throw new GeminiError(
          `Gemini no devolvió texto (${reason || 'sin motivo'})`,
          response.status,
          JSON.stringify(data)
        )
      }
      console.log('🤖 Gemini OK con modelo:', model)
      return text
    }

    const errorBody = await response.text()
    console.error('❌ Gemini error:', model, response.status, response.statusText, errorBody)
    lastError = new GeminiError(
      `Gemini falló (${response.status}) con ${model}: ${errorBody}`,
      response.status,
      errorBody
    )

    // Solo tiene sentido probar otro modelo si este no existe.
    if (response.status !== 404) break
  }

  throw lastError ?? new GeminiError('Gemini falló sin respuesta', 0, '')
}

/**
 * Como generateText, pero parsea la respuesta como JSON.
 * Tolera que el modelo envuelva el JSON en fences de markdown o lo
 * acompañe de texto alrededor.
 */
export async function generateJson<T = unknown>(prompt: string): Promise<T> {
  const text = await generateText(prompt, { json: true })

  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Último recurso: extraer el primer objeto balanceado del texto.
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T
      } catch {
        // cae al throw de abajo
      }
    }
    console.error('❌ Respuesta de Gemini no parseable como JSON:', text)
    throw new Error('Respuesta inválida de la IA')
  }
}
