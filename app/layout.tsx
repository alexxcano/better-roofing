import type { Metadata } from 'next'
import { Inter, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-barlow',
})

export const metadata: Metadata = {
  title: 'BetterRoofing — Instant Roofing Estimates & Lead Capture',
  description: 'Give your customers instant roofing estimates. The easiest way to capture more leads.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${barlow.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
