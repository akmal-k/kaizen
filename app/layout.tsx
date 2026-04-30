import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kaizen — 1% Better Every Day',
  description: 'Build career skills and life habits in just 10 minutes a day with AI-personalized micro-habit plans.',
  keywords: 'kaizen, habits, career growth, productivity, self improvement, daily habits',
  openGraph: {
    title: 'Kaizen — 1% Better Every Day',
    description: 'Build career skills and life habits in just 10 minutes a day.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,400;1,700&family=IBM+Plex+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
