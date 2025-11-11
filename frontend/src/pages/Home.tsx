import { motion } from 'framer-motion'

function Wave() {
	return (
		<svg viewBox="0 0 1440 320" className="w-full opacity-50">
			<defs>
				<linearGradient id="g" x1="0" x2="1">
					<stop offset="0%" stopColor="#FF7F50" stopOpacity="0.8" />
					<stop offset="100%" stopColor="#FF7F50" stopOpacity="0.1" />
				</linearGradient>
			</defs>
			<motion.path
				initial={{ d: 'M0,160L48,165.3C96,171,192,181,288,192C384,203,480,213,576,208C672,203,768,181,864,176C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z' }}
				animate={{ d: [
					'M0,160L60,165C120,170,240,180,360,190C480,200,600,210,720,205C840,200,960,180,1080,175C1200,170,1320,180,1380,160L1440,140L1440,0L0,0Z',
					'M0,160L48,165.3C96,171,192,181,288,192C384,203,480,213,576,208C672,203,768,181,864,176C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L0,0Z'
				] }}
				transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
				fill="url(#g)"
			/>
		</svg>
	)
}

export default function Home() {
	return (
		<section className="py-16">
			<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10">
				<div className="absolute inset-0" style={{ background: 'radial-gradient(600px 300px at 80% 10%, rgba(255,127,80,0.15), transparent)' }} />
				<div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
					<div>
						<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
						RhythmX: The Algorithmic Sound Explorer
						</h1>
						<p className="mt-4 text-white/80 max-w-prose">
							Discover micro‑genres and niche vibes powered by granular audio features and collaborative listening patterns. No popularity—just mood.
						</p>
						<div className="mt-6 flex gap-3">
							<a href="/mood" className="px-5 py-2 rounded-lg bg-[var(--coral)] text-black font-semibold shadow-[0_0_30px_rgba(255,127,80,0.45)]">Open Mood Map</a>
							<a href="/playlist" className="px-5 py-2 rounded-lg border border-white/15 backdrop-blur-md bg-white/5">Generate Playlist</a>
						</div>
					</div>
					<div>
						<Wave />
					</div>
				</div>
			</div>
		</section>
	)
}
