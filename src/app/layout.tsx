import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Philippine Lottery Predictor',
  description: 'Advanced prediction system using 25+ years of historical data and statistical analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}