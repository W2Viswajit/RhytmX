import { motion, AnimatePresence } from 'framer-motion'

interface Props {
	open: boolean
	onClose: () => void
	title?: string
	artist?: string
	energy?: number
	valence?: number
}

export default function SongModal({ open, onClose, title, artist, energy, valence }: Props) {
	return (
		<AnimatePresence>
			{open && (
				<motion.div className="fixed inset-0 z-50 flex items-center justify-center"
					initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
				>
					<div className="absolute inset-0 bg-black/50" onClick={onClose} />
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 20, opacity: 0 }}
						className="relative rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 w-[460px]"
					>
						<div className="text-xl font-semibold mb-1">{title ?? 'Song'}</div>
						<div className="text-white/70 mb-4">{artist ?? 'Artist'}</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="rounded-lg border border-white/10 p-3">
								<div className="text-xs text-white/60">Energy</div>
								<div className="font-medium">{energy?.toFixed(2) ?? '-'}</div>
							</div>
							<div className="rounded-lg border border-white/10 p-3">
								<div className="text-xs text-white/60">Valence</div>
								<div className="font-medium">{valence?.toFixed(2) ?? '-'}</div>
							</div>
						</div>
						<button onClick={onClose} className="mt-5 px-4 py-2 rounded-md bg-[var(--coral)] text-black">Close</button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}


