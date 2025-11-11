import './globals.css'
import { ReactNode } from 'react'
import Providers from './providers'

export const metadata = {
  title: 'RhytmX: The Algorithmic Sound Explorer',
  description: 'Mood-driven, niche genre discovery using granular audio features and collaborative patterns.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

