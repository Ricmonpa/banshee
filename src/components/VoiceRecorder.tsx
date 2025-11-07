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
    
    // WAV header
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
    
    // Convert audio data
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
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      })
      
      // Usar formato más compatible con Deepgram
      let mediaRecorder
      const formats = [
        'audio/wav',
        'audio/mp4',
        'audio/webm',
        'audio/ogg'
      ]
      
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          console.log('✅ Using format:', format)
          mediaRecorder = new MediaRecorder(stream, { mimeType: format })
          break
        }
      }
      
      if (!mediaRecorder) {
        console.log('⚠️ Using default format')
        mediaRecorder = new MediaRecorder(stream)
      }
      
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
        setRecordingTime(prev => {
          const newTime = prev + 1
          console.log('⏱️ Recording time:', newTime)
          return newTime
        })
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
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handleRecordingStop = async () => {
    // Capturar el tiempo antes de que se resetee
    const finalDuration = recordingTime
    setIsUploading(true)
    
    try {
      // Usar el tipo MIME del MediaRecorder
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
      let audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
      
      console.log('🎤 Audio blob created:', {
        size: audioBlob.size,
        type: audioBlob.type,
        duration: finalDuration,
        chunks: audioChunksRef.current.length,
        recorderMimeType: mediaRecorderRef.current?.mimeType
      })
      
      // Verificar que el audio no esté vacío
      if (audioBlob.size < 1000) {
        throw new Error('Audio muy corto o vacío')
      }

      // Si es WebM, intentar convertir a WAV para mejor compatibilidad
      if (mimeType.includes('webm')) {
        try {
          console.log('🔄 Converting WebM to WAV for better compatibility...')
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const arrayBuffer = await audioBlob.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // Convertir a WAV
          const wavBlob = await audioBufferToWav(audioBuffer)
          audioBlob = wavBlob
          console.log('✅ Converted to WAV:', wavBlob.size, 'bytes')
        } catch (conversionError) {
          console.warn('⚠️ WAV conversion failed, using original:', conversionError)
        }
      }
      
      // Crear FormData para subir el audio
      const formData = new FormData()
      const currentType = audioBlob.type
      const extension = currentType.includes('wav') ? 'wav' :
                      currentType.includes('mp4') ? 'mp4' : 
                      currentType.includes('webm') ? 'webm' : 
                      currentType.includes('ogg') ? 'ogg' : 'mp4'
      
      console.log('📤 Uploading audio:', { type: currentType, extension, size: audioBlob.size })
      formData.append('audio', audioBlob, `recording.${extension}`)
      
      // Subir a nuestro API route
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const { audioUrl } = await response.json()
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('banshee_audio_url', audioUrl)
        
        // Redirigir al preview
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

  if (isUploading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-banshee-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando tu grabación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Grabación de voz</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center space-y-6">
          <p className="text-gray-600">
            No pienses en capítulos, solo habla. ¿Qué te inspiró? 
            Presiona 'Detener' cuando termines.
          </p>

          {/* Visualizador de audio */}
          <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-8 bg-banshee-primary rounded animate-pulse"></div>
                <div className="w-2 h-12 bg-banshee-primary rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-6 bg-banshee-primary rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-10 bg-banshee-primary rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-2 h-4 bg-banshee-primary rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              <div className="text-gray-400">
                <Mic className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="text-2xl font-mono text-gray-700">
            {formatTime(recordingTime)}
          </div>

          {/* Controles */}
          <div className="flex justify-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="btn-primary flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
                Iniciar grabación
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Detener grabación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}