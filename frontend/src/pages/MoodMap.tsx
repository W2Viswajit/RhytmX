import Plot from 'react-plotly.js'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MoodMap() {
	const navigate = useNavigate()
	const data = useMemo(() => {
		const N = 120
		const energy:number[] = []
		const valence:number[] = []
		for (let i=0;i<N;i++) { energy.push(Math.random()); valence.push(Math.random()) }
		return [{
			x: energy,
			y: valence,
			mode: 'markers',
			type: 'scattergl',
			marker: { color: energy.map(e => `rgba(255,127,80,${0.3+0.7*e})`), size: 10, line: { color: '#FF7F50' } },
			name: 'Songs'
		}] as any
	}, [])
	return (
		<section className="py-10">
			<h2 className="text-2xl font-semibold mb-4">Mood Map</h2>
			<div className="rounded-2xl border border-white/10 bg-white/5 p-3">
				<Plot
					data={data}
					layout={{
						paper_bgcolor: 'rgba(0,0,0,0)',
						plot_bgcolor: 'rgba(0,0,0,0)',
						xaxis: { title: 'Energy', gridcolor: 'rgba(255,255,255,0.1)' },
						yaxis: { title: 'Valence', gridcolor: 'rgba(255,255,255,0.1)' },
						margin: { t: 20, r: 20, b: 40, l: 50 },
					}}
					style={{ width: '100%', height: 480 }}
					onClick={(ev:any) => {
						const point = ev.points?.[0]
						if (point) {
							navigate('/playlist?energy='+point.x+'&valence='+point.y)
						}
					}}
				/>
			</div>
		</section>
	)
}
