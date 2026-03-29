import type { Metadata } from 'next'
import { ComparisonPage } from '@/components/landing/ComparisonPage'
import type { ComparisonPageConfig } from '@/components/landing/ComparisonPage'

export const metadata: Metadata = {
  title: 'BetterRoofing vs Roofle — Same Widget, 1/7 the Price',
  description:
    'Roofle charges $2,000 to start and $350/mo. BetterRoofing is $49/mo with $0 setup fee, more features, and no contract. See the full feature comparison.',
  keywords: [
    'roofle alternative',
    'roofle vs betterroofing',
    'roofing quote widget',
    'roofle competitor',
    'instant roof quote software',
    'roofing lead generation',
  ],
  alternates: {
    canonical: 'https://betterroofing.co/vs-roofle',
  },
  openGraph: {
    type: 'website',
    url: 'https://betterroofing.co/vs-roofle',
    title: 'BetterRoofing vs Roofle — Same Widget, 1/7 the Price',
    description:
      'Roofle charges $2,000 to start and $350/mo. BetterRoofing is $49/mo with $0 setup fee, more features, and no contract.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BetterRoofing vs Roofle — Same Widget, 1/7 the Price',
    description:
      'Roofle charges $2,000 to start and $350/mo. BetterRoofing is $49/mo with $0 setup fee, more features, and no contract.',
  },
}

const config: ComparisonPageConfig = {
  competitor: 'Roofle',
  heroHeadline: 'Roofle Charges $2,000\nBefore You Get\nA Single Lead.',
  heroSubheadline:
    'BetterRoofing is $49/mo with no setup fee, no long-term contract, and AI features Roofle doesn\'t offer. Get the same instant quote widget — without the sticker shock.',
  competitorPrice: '$350 / mo + $2k setup',
  competitorSetupFee: '$2,000',
  competitorYear1: '$6,200',
  competitorYear1Note: '($350/mo × 12 + $2k)',
  differentiators: [
    {
      title: '$0 To Start',
      body: 'Roofle charges a $2,000 setup fee before your widget is even live. BetterRoofing is $0 to start — sign up, embed one line of code, and you\'re collecting leads today.',
    },
    {
      title: '7× Cheaper',
      body: '$350/mo vs $49/mo. That\'s the same category of product — an instant quote widget on your website — at a fraction of the cost. Keep the other $3,600/yr for your ad budget.',
    },
    {
      title: 'AI They Don\'t Have',
      body: 'Every lead gets an AI-written intelligence brief, follow-up email drafts, and SMS templates. You also get a weekly AI performance report. Roofle has none of this.',
    },
    {
      title: 'No Long-Term Contract',
      body: 'Roofle locks you into a contract. BetterRoofing is month-to-month — cancel any time, no questions asked. We earn your business every month.',
    },
  ],
  rows: [
    { feature: 'Monthly price',                               us: '$49 / mo',  competitor: '$350 / mo',  highlight: true },
    { feature: 'Setup fee',                                   us: '$0',        competitor: '$2,000',      highlight: true },
    { feature: 'Instant quote widget',                        us: true,        competitor: true },
    { feature: 'Lead scoring & qualification',                us: true,        competitor: false,         highlight: true },
    { feature: 'Lead pipeline (New→Contacted→Won)',           us: true,        competitor: false },
    { feature: 'Insurance claim detection',                   us: true,        competitor: false,         highlight: true },
    { feature: 'Material selector (asphalt/metal/tile/flat)', us: true,        competitor: true },
    { feature: 'Service area filtering',                      us: true,        competitor: false },
    { feature: 'Floating tab widget (every page)',            us: true,        competitor: false,         isPro: true },
    { feature: 'AI lead intelligence brief',                  us: true,        competitor: false,         isAI: true, highlight: true },
    { feature: 'AI follow-up email & SMS drafts',             us: true,        competitor: false,         isAI: true, highlight: true },
    { feature: 'Weekly AI intelligence report',               us: true,        competitor: false,         isAI: true },
    { feature: 'Email lead notifications',                    us: true,        competitor: true },
    { feature: 'Webhook / Zapier integration',                us: true,        competitor: true,          isPro: true },
    { feature: 'No long-term contract',                       us: true,        competitor: false,         highlight: true },
    { feature: 'Live in under 5 minutes',                     us: true,        competitor: false },
  ],
}

export default function VsRoofle() {
  return <ComparisonPage config={config} />
}
