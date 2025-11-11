import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api'

type AudioPlayerProps = {
  energy: number
  valence: number
}

export default function AudioPlayer({ energy, valence }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Cleanup function for audio URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Handle audio time updates for progress bar
  useEffect(() => {
    if (!audioRef.current) return

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
        setProgress(progress)
      }
    }

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [audioUrl])

  const generateAndPlay = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setProgress(0)

      // Clean up old audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      const blob = await api.generateMusic(energy, valence, isPreviewMode)
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      
      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Audio generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate on mount or when parameters change
  useEffect(() => {
    generateAndPlay()
  }, [energy, valence])

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/50 mr-2"></div>
              Generating {isPreviewMode ? 'preview' : 'full'} track...
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : audioUrl ? (
            <div className="flex items-center gap-2">
              <span>Music generated - {isPreviewMode ? 'Preview Mode' : 'Full Track'}</span>
              <button
                onClick={() => {
                  setIsPreviewMode(!isPreviewMode)
                  generateAndPlay()  // Regenerate when switching modes
                }}
                className="text-xs px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 transition-colors"
              >
                Switch to {isPreviewMode ? 'Full' : 'Preview'} Mode
              </button>
            </div>
          ) : (
            "Preparing to generate music..."
          )}
        </div>
        {!isLoading && (
          <motion.button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            onClick={generateAndPlay}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {audioUrl ? 'Generate New' : 'Generate'}
          </motion.button>
        )}
      </div>
      
      {audioUrl && (
        <div className="space-y-2">
          <div className="relative h-2 bg-purple-600/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-purple-600"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <audio 
            ref={audioRef}
            controls
            className="w-full"
            src={audioUrl}
            onError={(e) => {
              console.error('Audio playback error:', e)
              setError("Failed to play audio")
            }}
          />
        </div>
      )}
    </div>
  )
}