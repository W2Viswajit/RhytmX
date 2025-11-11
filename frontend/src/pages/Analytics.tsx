export default function Analytics() {
	return (
		<section className="py-10">
			<h2 className="text-2xl font-semibold mb-2">Analytics</h2>
			<div className="grid md:grid-cols-3 gap-4">
				<div className="rounded-xl bg-white/5 border border-white/10 p-5">
					<div className="text-sm text-white/60">Silhouette Score</div>
					<div className="text-3xl font-bold">0.61</div>
				</div>
				<div className="rounded-xl bg-white/5 border border-white/10 p-5">
					<div className="text-sm text-white/60">Num Micro‑Genres</div>
					<div className="text-3xl font-bold">20</div>
				</div>
				<div className="rounded-xl bg-white/5 border border-white/10 p-5">
					<div className="text-sm text-white/60">Top Transition Confidence</div>
					<div className="text-3xl font-bold">0.82</div>
				</div>
			</div>
			<div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6">
				<h3 className="font-semibold mb-2">Insights</h3>
				<ul className="list-disc list-inside text-white/80">
					<li>High‑energy low‑valence tracks cluster tightly (micro‑genre: Dark Rave).</li>
					<li>Sequential patterns reveal common transitions: Ambient → Downtempo → Dream Pop.</li>
					<li>Association rules indicate MFCC+tempo combos drive niche grouping.</li>
				</ul>
			</div>
		</section>
	)
}
