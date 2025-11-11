import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAudioPlayer } from './contexts/AudioPlayerContext'

function NavLink({ to, label }: { to: string; label: string }) {
	const location = useLocation()
	const active = location.pathname === to
	return (
		<Link to={to} className="relative">
			<motion.span
				className="px-4 py-2 rounded-full backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
				whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
			>
				{label}
			</motion.span>
			{active && (
				<motion.div layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full" style={{ boxShadow: '0 0 24px rgba(255,127,80,0.55)' }} />
			)}
		</Link>
	)
}

export default function App() {
	const { currentTrack, isPlaying, isLoading, progress, duration, togglePlayPause } = useAudioPlayer()

	return (
		<div className="min-h-screen text-white">
			<header className="sticky top-0 z-50">
				<div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="size-8 rounded-full" style={{ background: 'conic-gradient(from 180deg at 50% 50%, #FF7F50, rgba(255,127,80,0.15))' }} />
					<span className="font-bold tracking-wide">RhythmX</span>
					</div>
					<nav className="flex gap-3">
						<NavLink to="/" label="Home" />
						<NavLink to="/mood" label="Mood Map" />
						<NavLink to="/playlist" label="Playlist" />
						<NavLink to="/analytics" label="Analytics" />
						<NavLink to="/settings" label="Settings" />
					</nav>
				</div>
			</header>
			<main className="mx-auto max-w-7xl px-6">
				<Outlet />
			</main>
			{/* Floating music player bar - keep visible when track exists */}
			{(currentTrack || isLoading) && (
				<div className="fixed bottom-4 inset-x-0 flex justify-center pointer-events-none z-50">
					<div className="pointer-events-auto rounded-full border border-white/10 bg-white/10 backdrop-blur-md px-4 py-2 flex items-center gap-4 shadow-[0_0_30px_rgba(255,127,80,0.25)]">
						<button
							onClick={togglePlayPause}
							disabled={isLoading}
							className="size-8 rounded-full bg-[var(--coral)] text-black font-bold flex items-center justify-center hover:bg-[var(--coral)]/90 transition-colors disabled:opacity-50"
						>
							{isLoading ? (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
							) : isPlaying ? (
								'⏸'
							) : (
								'▶'
							)}
						</button>
						<div className="text-sm min-w-[200px]">
							{isLoading ? (
								'Generating preview...'
							) : currentTrack ? (
								<>
									<div>{isPlaying ? '▶ Now Playing' : '⏸ Preview'} - {currentTrack.title}</div>
									{duration > 0 && (
										<div className="text-xs text-white/60">
											{Math.floor(duration)}s mood-specific audio
										</div>
									)}
								</>
							) : (
								'Ready to play'
							)}
						</div>
						<div className="h-2 w-32 rounded bg-white/20 overflow-hidden">
							{isLoading ? (
								<div className="h-full bg-[var(--coral)]/50 animate-pulse" style={{ width: '50%' }} />
							) : (
								<motion.div
									className="h-full bg-[var(--coral)]"
									initial={{ width: '0%' }}
									animate={{ width: `${progress}%` }}
									transition={{ duration: 0.1 }}
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
