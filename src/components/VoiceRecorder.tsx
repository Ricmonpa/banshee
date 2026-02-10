'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VoiceRecorderProps {
  onClose: () => void
}

// Función para convertir AudioBuffer a WAV
function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  return new Promise((resolve) => {
    const length = buffer.length
    const sampleRate = buffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)

    const channelData = buffer.getChannelData(0)
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }

    resolve(new Blob([arrayBuffer], { type: 'audio/wav' }))
  })
}

export default function VoiceRecorder({ onClose }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  // Meter de nivel de audio para visualización tipo vinilo
  useEffect(() => {
    if (!isRecording || !streamRef.current) return
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(streamRef.current)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    source.connect(analyser)
    analyserRef.current = analyser

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const updateLevel = () => {
      if (!analyserRef.current) return
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      setAudioLevel(Math.min(100, (average / 128) * 100))
      animationFrameRef.current = requestAnimationFrame(updateLevel)
    }
    updateLevel()
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      audioContext.close()
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      })
      streamRef.current = stream

      let mediaRecorder
      const formats = ['audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg']
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          mediaRecorder = new MediaRecorder(stream, { mimeType: format })
          break
        }
      }
      if (!mediaRecorder) mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorderRef.current.onstop = handleRecordingStop
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Error al acceder al micrófono. Por favor, permite el acceso.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }

  const handleRecordingStop = async () => {
    const finalDuration = recordingTime
    setIsUploading(true)

    try {
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
      let audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

      if (audioBlob.size < 1000) {
        throw new Error('Audio muy corto o vacío')
      }

      if (mimeType.includes('webm')) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const arrayBuffer = await audioBlob.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          const wavBlob = await audioBufferToWav(audioBuffer)
          audioBlob = wavBlob
        } catch {
          // keep original
        }
      }

      const formData = new FormData()
      const currentType = audioBlob.type
      const extension = currentType.includes('wav')
        ? 'wav'
        : currentType.includes('mp4')
        ? 'mp4'
        : currentType.includes('webm')
        ? 'webm'
        : currentType.includes('ogg')
        ? 'ogg'
        : 'mp4'
      formData.append('audio', audioBlob, `recording.${extension}`)

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { audioUrl } = await response.json()
        localStorage.setItem('banshee_audio_url', audioUrl)
        router.push('/preview')
      } else {
        throw new Error('Error al subir el audio')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la grabación. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ——— Estado: Procesando (loader elegante)
  if (isUploading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm">
        <div className="luxury-card max-w-md mx-4 text-center border-gold/20">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-gold/30 rounded-full animate-ping opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gold animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
            </div>
          </div>
          <p className="font-serif text-xl text-carbon mb-2">
            Transformando tu voz en palabras eternas...
          </p>
          <p className="text-sm text-warm-gray font-sans">
            Un momento, por favor
          </p>
        </div>
      </div>
    )
  }

  // ——— Modal principal: Antes / Durante grabación
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg luxury-card bg-cream-dark page-texture border-gold/10">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-warm-gray hover:text-carbon transition-colors duration-400"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-4 pb-8 text-center">
          {/* Pregunta en serif grande */}
          <h2 className="font-serif text-2xl md:text-3xl text-carbon mb-2 leading-tight max-w-md mx-auto">
            ¿Qué historia quieres contar al mundo?
          </h2>
          <p className="text-sm text-warm-gray font-sans mb-10">
            No pienses en capítulos, solo habla. Presiona detener cuando termines.
          </p>

          {/* Visualizador tipo vinilo / onda */}
          <div className="flex justify-center mb-8">
            {isRecording ? (
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border-2 border-gold/40 animate-breathing"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(245,241,232,0.95))`,
                    boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.2)',
                  }}
                />
                <div className="absolute flex items-end justify-center gap-0.5 h-16">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gold rounded-full transition-all duration-150"
                      style={{
                        height: `${8 + (audioLevel / 100) * 32 + Math.sin((i + recordingTime) * 0.3) * 8}px`,
                        opacity: 0.5 + (audioLevel / 100) * 0.5,
                      }}
                    />
                  ))}
                </div>
                <div className="relative font-serif text-3xl text-carbon tabular-nums">
                  {formatTime(recordingTime)}
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={startRecording}
                  className="w-40 h-40 rounded-full border-2 border-gold bg-transparent flex items-center justify-center text-gold transition-all duration-400 hover:bg-gold/10 hover:shadow-gold animate-pulse-soft focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-4 focus:ring-offset-cream-dark"
                  aria-label="Iniciar grabación"
                >
                  <Mic className="w-14 h-14" strokeWidth={1.5} />
                </button>
                <p className="mt-4 text-sm text-warm-gray font-sans">
                  Toca para comenzar
                </p>
              </div>
            )}
          </div>

          {/* Botón detener (solo cuando graba) */}
          {isRecording && (
            <button
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-6 py-3 border border-carbon/20 text-carbon font-sans text-sm tracking-wide hover:bg-carbon hover:text-cream transition-all duration-400 rounded-sm"
            >
              <Square className="w-4 h-4 fill-current" />
              Detener grabación
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
