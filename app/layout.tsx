import type { Metadata } from 'next'
// @ts-expect-error Next.js handles the global stylesheet import at build time.
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Vedanga - Your Vedic Birth Chart',
  description: 'Discover your Vedic birth chart and understand your planetary influences through premium astrology analysis.',
  keywords: 'vedic astrology, birth chart, kundli, horoscope, planets',
  authors: [{ name: 'Vedanga' }],
  openGraph: {
    title: 'Vedanga - Vedic Astrology',
    description: 'Premium Vedic astrology platform for personalized birth chart analysis',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2d5016" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize theme
              const savedTheme = localStorage.getItem('vedanga-theme');
              if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
              } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
