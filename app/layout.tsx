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

const APP_URL = 'https://betterroofing.co'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'BetterRoofing — Instant Roof Quote Widget for Contractors',
    template: '%s | BetterRoofing',
  },
  description:
    'Add an instant roofing estimate widget to your website in 60 seconds. Capture more leads, score them automatically, and get AI-written follow-ups. Built for roofing contractors.',
  keywords: [
    'roofing lead generation',
    'instant roof estimate tool',
    'roofing quote widget',
    'roof cost calculator for contractors',
    'roofing contractor software',
    'roofing lead capture',
    'roofing estimate widget',
    'roof replacement cost estimator',
    'roofing CRM',
    'roofing sales tool',
  ],
  authors: [{ name: 'BetterRoofing', url: APP_URL }],
  creator: 'BetterRoofing',
  publisher: 'BetterRoofing',
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'BetterRoofing',
    title: 'BetterRoofing — Instant Roof Quote Widget for Contractors',
    description:
      'Add an instant roofing estimate widget to your website in 60 seconds. Capture more leads, score them automatically, and get AI-written follow-ups.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BetterRoofing — Instant Roof Quote Widget for Contractors',
    description:
      'Add an instant roofing estimate widget to your website in 60 seconds. Capture more leads, score them automatically, and get AI-written follow-ups.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#organization`,
      name: 'BetterRoofing',
      url: APP_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/Logo-nobg.png`,
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'BetterRoofing',
      publisher: { '@id': `${APP_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${APP_URL}/#app`,
      name: 'BetterRoofing',
      url: APP_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Instant roofing estimate widget and lead capture tool for roofing contractors. Add a quote widget to your website, score leads automatically, and get AI-written follow-ups.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '49',
          priceCurrency: 'USD',
          billingIncrement: 'month',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '97',
          priceCurrency: 'USD',
          billingIncrement: 'month',
        },
      ],
      featureList: [
        'Instant roof estimate widget',
        'Automatic lead scoring',
        'AI follow-up email and SMS drafts',
        'Service area filtering',
        'Weekly lead intelligence report',
        'Floating quote tab',
        'Webhook and Zapier integration',
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${barlow.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
