import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Activity } from 'lucide-react'
import api from '../lib/api'

export default function VoiceInterface({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await api.post('/api/voice/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { transcript: text, action } = response.data
      setTranscript(text)
      
      if (onTranscription) {
        onTranscription({ transcript: text, action })
      }
    } catch (error) {
      console.error('Failed to process audio:', error)
      alert('Failed to process voice command')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="card text-center">
      <h2 className="text-2xl font-bold mb-6">Voice Control</h2>
      
      {/* Voice Orb */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : isProcessing
              ? 'bg-yellow-500 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isProcessing ? (
            <Activity className="h-12 w-12 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-12 w-12 text-white" />
          ) : (
            <Mic className="h-12 w-12 text-white" />
          )}
          
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
          )}
        </button>
      </div>

      <p className="text-gray-300 mb-4">
        {isProcessing
          ? 'Processing...'
          : isRecording
          ? 'Listening... Click to stop'
          : 'Click to speak'}
      </p>

      {transcript && (
        <div className="mt-4 p-4 bg-dark-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Last command:</p>
          <p className="text-white">{transcript}</p>
        </div>
      )}
    </div>
  )
}
