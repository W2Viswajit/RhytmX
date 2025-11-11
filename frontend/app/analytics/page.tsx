"use client"
import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as any

export default function AnalyticsPage() {
  const labels = ['Silhouette', 'Calinski-Harabasz', 'Davies-Bouldin']
  const values = [0.62, 980, 0.51]
  return (
    <div className="px-6 py-6">
      <h2 className="text-3xl font-bold">Analytics</h2>
      <p className="text-neutral-400 mt-2">Clustering quality and community pattern insights</p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="glass p-4 rounded-xl">
          <Plot
            data={[{ type: 'bar', x: labels, y: values, marker: { color: ['#FF6F61','#9b87f5','#22d3ee'] } }]}
            layout={{ paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', height: 360, margin: {l: 40, r: 10, t: 10, b: 40} }}
            config={{ displayModeBar: false }}
          />
        </div>
        <div className="glass p-4 rounded-xl">
          <h3 className="font-semibold mb-2">Frequent transitions (Apriori/PrefixSpan)</h3>
          <ul className="text-neutral-300 list-disc pl-5 space-y-1">
            <li>Lo-fi → Dream pop (support 0.18, lift 2.1)</li>
            <li>Dub techno → Ambient (support 0.11, lift 1.7)</li>
            <li>Dungeon synth → Atmospheric black metal (support 0.07, lift 1.9)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

