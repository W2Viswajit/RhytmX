import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './App'
import Home from './pages/Home'
import MoodMap from './pages/MoodMap'
import Playlist from './pages/Playlist'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'

const router = createBrowserRouter([
	{ path: '/', element: <App />, children: [
		{ index: true, element: <Home /> },
		{ path: 'mood', element: <MoodMap /> },
		{ path: 'playlist', element: <Playlist /> },
		{ path: 'analytics', element: <Analytics /> },
		{ path: 'settings', element: <Settings /> },
	]}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AudioPlayerProvider>
			<RouterProvider router={router} />
		</AudioPlayerProvider>
	</React.StrictMode>
)
