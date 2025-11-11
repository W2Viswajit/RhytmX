import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'
import { api } from '../services/api'

interface AudioPlayerContextType {
  currentTrack: { title: string; artist: string } | null
  isPlaying: boolean
  isLoading: boolean
  progress: number
  duration: number
  playPreview: (energy: number, valence: number, title: string, artist: string) => Promise<void>
  togglePlayPause: () => void
  error: string | null
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<{ title: string; artist: string } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const keepVisibleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
      }
      if (keepVisibleTimeoutRef.current) {
        clearTimeout(keepVisibleTimeoutRef.current)
      }
    }
  }, [])

  // Handle audio time updates for progress bar
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        const newProgress = (audio.currentTime / audio.duration) * 100
        setProgress(newProgress)
        setDuration(audio.duration)
      }
    }

    const handleLoadedMetadata = () => {
      if (audio.duration) {
        setDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(100) // Show full progress when ended
      console.log('Audio playback ended, keeping player visible for 3 seconds')
      // Keep currentTrack visible for a few seconds after playback ends
      if (keepVisibleTimeoutRef.current) {
        clearTimeout(keepVisibleTimeoutRef.current)
      }
      keepVisibleTimeoutRef.current = setTimeout(() => {
        // Keep it visible - don't clear currentTrack automatically
        // User can manually clear by clicking away or generating new track
        console.log('Keeping player visible after playback')
      }, 3000)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [currentTrack])

  const playPreview = async (energy: number, valence: number, title: string, artist: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setProgress(0)

      // Clean up old audio URL and stop current playback
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }

      // Generate music preview (short demo)
      const blob = await api.generateMusic(energy, valence, true) // preview = true for short demo
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url

      // Always use the DOM audio element (connected via ref)
      // Wait a bit for React to update the ref
      await new Promise(resolve => setTimeout(resolve, 100))
      
      let audioElement = audioRef.current
      if (!audioElement) {
        // Try to get from DOM
        const domAudio = document.querySelector('audio[data-audio-player]') as HTMLAudioElement
        if (domAudio) {
          audioElement = domAudio
          audioRef.current = audioElement
        } else {
          throw new Error('Audio element not found in DOM')
        }
      }

      // Set up audio element
      audioElement.src = url
      audioElement.volume = 1.0
      audioElement.muted = false
      
      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        if (!audioElement) {
          reject(new Error('Audio element not available'))
          return
        }
        
        const audio = audioElement
        
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          resolve(undefined)
        }
        
        const handleError = (e: Event) => {
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          reject(new Error('Failed to load audio'))
        }
        
        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('error', handleError)
        
        // Load the audio
        audio.load()
      })
      
      // Set current track before playing
      setCurrentTrack({ title, artist })
      
      // Clear any existing timeout
      if (keepVisibleTimeoutRef.current) {
        clearTimeout(keepVisibleTimeoutRef.current)
        keepVisibleTimeoutRef.current = null
      }
      
      // Play the audio
      try {
        if (!audioElement) {
          throw new Error('Audio element not available')
        }
        
        const playPromise = audioElement.play()
        if (playPromise !== undefined) {
          await playPromise
        }
        setIsPlaying(true)
        console.log('Audio playing successfully', {
          duration: audioElement.duration,
          currentTime: audioElement.currentTime,
          volume: audioElement.volume,
          muted: audioElement.muted,
          src: audioElement.src.substring(0, 50) + '...',
          paused: audioElement.paused
        })
        
        // Verify it's actually playing - check multiple times
        let checkCount = 0
        const verifyPlaying = setInterval(() => {
          checkCount++
          if (audioElement) {
            if (!audioElement.paused && audioElement.currentTime > 0) {
              console.log('✅ Audio confirmed playing:', {
                currentTime: audioElement.currentTime.toFixed(2),
                duration: audioElement.duration.toFixed(2),
                progress: ((audioElement.currentTime / audioElement.duration) * 100).toFixed(1) + '%',
                volume: audioElement.volume,
                muted: audioElement.muted
              })
              clearInterval(verifyPlaying)
            } else if (checkCount >= 10) {
              console.warn('⚠️ Audio not playing after 5 seconds!', {
                paused: audioElement.paused,
                readyState: audioElement.readyState,
                src: audioElement.src.substring(0, 50),
                currentTime: audioElement.currentTime,
                duration: audioElement.duration
              })
              clearInterval(verifyPlaying)
              // Try to play again
              if (audioElement.paused) {
                audioElement.play().catch(e => console.error('Retry play failed:', e))
              }
            }
          } else {
            clearInterval(verifyPlaying)
          }
        }, 500)
        
        // Log progress updates
        const progressInterval = setInterval(() => {
          if (audioElement && !audioElement.paused) {
            console.log('Audio progress:', {
              currentTime: audioElement.currentTime.toFixed(2),
              duration: audioElement.duration.toFixed(2),
              progress: ((audioElement.currentTime / audioElement.duration) * 100).toFixed(1) + '%',
              paused: audioElement.paused
            })
          }
        }, 1000)
        
        // Clear interval when audio ends
        audioElement.addEventListener('ended', () => {
          clearInterval(progressInterval)
          console.log('Audio playback completed')
        }, { once: true })
      } catch (playError) {
        console.error('Play error:', playError)
        // Some browsers require user interaction for autoplay
        setError('Click the play button to start playback')
        setIsPlaying(false)
        // Still keep the track visible so user can click play
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview')
      console.error('Preview generation error:', err)
      setIsPlaying(false)
      setCurrentTrack(null)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        progress,
        duration,
        playPreview,
        togglePlayPause,
        error
      }}
    >
      {children}
      {/* Hidden audio element for playback - always render */}
      <audio 
        ref={audioRef}
        data-audio-player
        style={{ display: 'none' }}
        preload="auto"
        crossOrigin="anonymous"
      />
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}

