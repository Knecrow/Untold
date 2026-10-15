import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://taleless.vercel.app'),
  title: 'Taleless — Your Unspoken Thoughts, Finally Heard',
  description:
    'Taleless — an anonymous digital corkboard for secrets, reflections, and unspoken thoughts. No sign-up needed.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Taleless — Anonymous Confessions & Reflections',
    description:
      'Drop your unspoken thoughts on a beautiful anonymous corkboard. No sign-up, no judgment.',
    url: 'https://taleless.vercel.app',
    type: 'website',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} ${instrumentSerif.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('taleless:theme');
                if (saved === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
