/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{ts,tsx}"
	],
	theme: {
		extend: {
			colors: {
				primary: "#FF7F50"
			},
			backdropBlur: {
				xs: '2px',
			}
		}
	},
	plugins: []
}
