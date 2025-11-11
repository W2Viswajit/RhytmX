"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Plot from 'react-plotly.js'
import * as Plotly from 'plotly.js'
import AudioPlayer from '../../src/components/AudioPlayer'
import { api, type SongPoint, type Cluster } from '../../src/services/api'

export default function MoodMapPage() {
  const [selected, setSelected] = useState<SongPoint | null>(null)
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [songs, setSongs] = useState<SongPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Run clustering if needed
        await api.runClustering(8)
        
        // Get clusters and songs
        const [clustersResponse, songsResponse] = await Promise.all([
          api.getClusters(),
          api.getPlaylistByMood({})
        ])
        
        setClusters(clustersResponse.clusters)
        setSongs(songsResponse.items.map((item: any) => ({
          id: item.song_id,
          title: item.title,
          artist: 'Unknown',
          energy: item.energy,
          valence: item.valence,
          cluster: item.cluster || 0
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mood map')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const trace: Partial<Plotly.Data> = {
    x: songs.map((d: SongPoint) => d.energy),
    y: songs.map((d: SongPoint) => d.valence),
    text: songs.map((d: SongPoint) => `${d.title} — ${d.artist}`),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 10,
      color: songs.map((d: SongPoint) => d.cluster),
      colorscale: 'Portland',
      opacity: 0.85
    }
  }

  return (
    <div className="px-6 py-6">
      <motion.h2 className="text-3xl font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Mood Map</motion.h2>
      <p className="text-neutral-400 mt-2">Energy vs Valence. Click a region to generate a niche playlist.</p>
      
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 text-red-500 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="mt-6 glass rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading mood map...</p>
        </div>
      ) : (
        <div className="mt-6 glass rounded-xl p-2">
          <Plot
            data={[trace]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              xaxis: { title: { text: 'Energy' }, gridcolor: '#222' },
              yaxis: { title: { text: 'Valence' }, gridcolor: '#222' },
              height: 520,
              margin: { l: 50, r: 20, t: 10, b: 50 }
            } as Partial<Plotly.Layout>}
            onClick={(e: any) => {
              if (e.points && e.points[0]) {
                const point = e.points[0];
                const songData = songs[point.pointIndex];
                setSelected(songData);
              }
            }}
          />
        </div>
      )}
      
      {selected && (
        <motion.div className="mt-6 glass p-6 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">{selected.title}</h3>
              <p className="text-neutral-400">{selected.artist} • Cluster {selected.cluster}</p>
              <p className="text-neutral-400 mt-1">
                Energy: {selected.energy.toFixed(2)} | Valence: {selected.valence.toFixed(2)}
              </p>
            </div>
            <Link 
              to={`/playlist?seed=${selected.id}`} 
              className="px-4 py-2 rounded-full bg-coral-500 text-black font-semibold"
            >
              Generate Playlist
            </Link>
          </div>
          <AudioPlayer energy={selected.energy} valence={selected.valence} />
        </motion.div>
      )}
    </div>
  )
}

function mockData(): SongPoint[] {
  const rnd = (min: number, max: number) => Math.random() * (max - min) + min
  return Array.from({ length: 400 }).map((_, i) => ({
    id: `song-${i}`,
    title: `Track ${i}`,
    artist: `Artist ${i % 17}`,
    energy: Number(rnd(0, 1).toFixed(3)),
    valence: Number(rnd(0, 1).toFixed(3)),
    cluster: Math.floor(rnd(0, 6))
  }))
}

