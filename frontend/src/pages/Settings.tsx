import { useState } from 'react'

export default function Settings() {
	const [dark, setDark] = useState(true)
	return (
		<section className="py-10">
			<h2 className="text-2xl font-semibold mb-4">Settings</h2>
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6 max-w-lg">
				<div className="flex items-center justify-between">
					<div>
						<div className="font-medium">Dark Mode</div>
						<div className="text-white/70 text-sm">Toggle theme preference</div>
					</div>
					<button onClick={() => setDark(v => !v)} className="px-4 py-2 rounded-full border border-white/10 bg-white/10">
						{dark ? 'On' : 'Off'}
					</button>
				</div>
			</div>
		</section>
	)
}


