import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://taleless.vercel.app'),
  title: 'Untold — Your Unspoken Thoughts, Finally Heard',
  description:
    'Untold — an anonymous digital corkboard for secrets, reflections, and unspoken thoughts. No sign-up needed.',
  openGraph: {
    title: 'Untold — Anonymous Confessions & Reflections',
    description:
      'Drop your unspoken thoughts on a beautiful anonymous corkboard. No sign-up, no judgment.',
    url: 'https://taleless.vercel.app',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
