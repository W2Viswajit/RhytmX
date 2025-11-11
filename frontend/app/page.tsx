"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="wave-bg" />
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-6">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          RhytmX
        </motion.h1>
        <motion.p
          className="mt-4 max-w-2xl text-neutral-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          The Algorithmic Sound Explorer — discover niche micro-genres by mood and vibe using granular audio features and collaborative patterns.
        </motion.p>
        <motion.div
          className="mt-10 flex gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Link href="/mood-map" className="px-6 py-3 rounded-full bg-coral-500 text-black font-semibold shadow-glass hover:opacity-90 transition">
            Explore Mood Map
          </Link>
          <Link href="/playlist" className="px-6 py-3 rounded-full border border-coral-500 text-coral-300 hover:bg-coral-500 hover:text-black transition">
            Generate Playlist
          </Link>
        </motion.div>
      </section>
    </main>
  )
}

