import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import SongModal from '../components/SongModal'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'

interface Track { id: string; title: string; artist: string; preview?: string }

export default function Playlist() {
	const [params] = useSearchParams()
	const [loading, setLoading] = useState(false)
	const [tracks, setTracks] = useState<Track[]>([])
	const [modalOpen, setModalOpen] = useState(false)
	const [selected, setSelected] = useState<Track | null>(null)
	const [generatingTrackId, setGeneratingTrackId] = useState<string | null>(null)
	const { playPreview, isLoading: isGenerating } = useAudioPlayer()

	const mood = useMemo(() => ({
		energy: Number(params.get('energy') ?? 0.6),
		valence: Number(params.get('valence') ?? 0.5)
	}), [params])

	useEffect(() => {
		setLoading(true)
		// Placeholder: generate mock tracks; wire to backend in future
		setTimeout(() => {
			setTracks(Array.from({ length: 10 }).map((_,i) => ({
				id: String(i+1),
				title: `Track ${i+1}`,
				artist: ['Indie Echo','LoWave','Nocturne Lab','VibeCraft'][i%4],
				preview: undefined
			})))
			setLoading(false)
		}, 400)
	}, [mood.energy, mood.valence])

	const handlePreview = async (track: Track) => {
		setGeneratingTrackId(track.id)
		try {
			// Add slight variation to energy/valence based on track to generate different songs
			// Use track ID to create consistent but different variations
			const trackVariation = parseInt(track.id) * 0.02 // Small variation per track
			const variedEnergy = Math.max(0, Math.min(1, mood.energy + (trackVariation % 0.1) - 0.05))
			const variedValence = Math.max(0, Math.min(1, mood.valence + ((trackVariation * 1.3) % 0.1) - 0.05))
			
			await playPreview(variedEnergy, variedValence, track.title, track.artist)
		} catch (error) {
			console.error('Failed to generate preview:', error)
		} finally {
			setGeneratingTrackId(null)
		}
	}

	return (
		<section className="py-10">
			<h2 className="text-2xl font-semibold mb-2">Generated Playlist</h2>
			<p className="text-white/70 mb-6">Based on energy {mood.energy.toFixed(2)} and valence {mood.valence.toFixed(2)}</p>
			<div className="grid md:grid-cols-2 gap-4">
				{loading ? Array.from({length:6}).map((_,i) => (
					<div key={i} className="h-28 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
				)) : tracks.map((t,idx) => (
					<motion.div key={t.id}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: idx*0.05 }}
						className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between"
					>
						<div>
							<div className="font-semibold">{t.title}</div>
							<div className="text-white/70 text-sm">{t.artist}</div>
						</div>
					{t.preview ? (
							<audio controls src={t.preview} className="w-48" />
						) : (
						<div className="flex gap-2">
							<button
								onClick={() => handlePreview(t)}
								disabled={isGenerating && generatingTrackId === t.id}
								className="px-3 py-1 rounded-md bg-[var(--coral)] text-black hover:bg-[var(--coral)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{isGenerating && generatingTrackId === t.id ? (
									<>
										<div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent" />
										Generating...
									</>
								) : (
									'Preview'
								)}
							</button>
							<button className="px-3 py-1 rounded-md border border-white/15 hover:bg-white/10 transition-colors" onClick={() => { setSelected(t); setModalOpen(true) }}>Details</button>
						</div>
						)}
					</motion.div>
				))}
			</div>
			<SongModal open={modalOpen} onClose={() => setModalOpen(false)} title={selected?.title} artist={selected?.artist} energy={mood.energy} valence={mood.valence} />
		</section>
	)
}
