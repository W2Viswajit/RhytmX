"use client"
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type Rec = { id: string; title: string; artist: string; previewUrl?: string; score: number }

export default function PlaylistPage() {
  const search = useSearchParams()
  const seed = search.get('seed')
  const [recs, setRecs] = useState<Rec[]>([])

  useEffect(() => {
    // TODO: Replace with backend call to /recommend
    setTimeout(() => setRecs(mockRecs(seed || 'seed')), 400)
  }, [seed])

  return (
    <div className="px-6 py-6">
      <h2 className="text-3xl font-bold">Generated Playlist</h2>
      <p className="text-neutral-400 mt-2">Seed: {seed || 'mood-region'}</p>

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {recs.map((r, idx) => (
            <motion.div key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: idx * 0.03 }}
              className="glass p-4 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{r.title}</h3>
                <p className="text-neutral-400">{r.artist}</p>
                <p className="text-coral-400 text-sm mt-1">Score: {r.score.toFixed(3)}</p>
              </div>
              {r.previewUrl ? (
                <audio controls className="w-36">
                  <source src={r.previewUrl} />
                </audio>
              ) : (
                <div className="text-neutral-500 text-sm">No preview</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-3">
        <button className="px-5 py-2 rounded-full bg-coral-500 text-black font-semibold">Save</button>
        <button className="px-5 py-2 rounded-full border border-coral-500 text-coral-300">Download M3U</button>
      </div>
    </div>
  )
}

function mockRecs(seed: string): Rec[] {
  return Array.from({ length: 24 }).map((_, i) => ({
    id: `${seed}-${i}`,
    title: `Echo ${i}`,
    artist: `Subculture ${i % 9}`,
    score: Math.random(),
    previewUrl: undefined
  }))
}

