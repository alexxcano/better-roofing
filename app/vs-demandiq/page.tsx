import type { Metadata } from 'next'
import { ComparisonPage } from '@/components/landing/ComparisonPage'
import type { ComparisonPageConfig } from '@/components/landing/ComparisonPage'

export const metadata: Metadata = {
  title: 'BetterRoofing vs Demand IQ — Convert Your Website Traffic',
  description:
    'Demand IQ charges $1,500 to start and $300/mo. BetterRoofing converts your existing web traffic for $49/mo with AI-powered lead follow-ups and zero setup fees.',
  keywords: [
    'demand iq alternative',
    'demandiq vs betterroofing',
    'roofing lead generation',
    'demandiq competitor',
    'roofing quote widget',
    'roofing lead capture',
  ],
  alternates: {
    canonical: 'https://betterroofing.co/vs-demandiq',
  },
  openGraph: {
    type: 'website',
    url: 'https://betterroofing.co/vs-demandiq',
    title: 'BetterRoofing vs Demand IQ — Convert Your Website Traffic',
    description:
      'Demand IQ charges $1,500 to start and $300/mo. BetterRoofing converts your existing web traffic for $49/mo with AI-powered lead follow-ups.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BetterRoofing vs Demand IQ — Convert Your Website Traffic',
    description:
      'Demand IQ charges $1,500 to start and $300/mo. BetterRoofing converts your existing web traffic for $49/mo with AI-powered lead follow-ups.',
  },
}

const config: ComparisonPageConfig = {
  competitor: 'Demand IQ',
  heroHeadline: 'Demand IQ Finds Leads.\nBetterRoofing\nConverts Them.',
  heroSubheadline:
    'You\'re already paying for SEO and ads — homeowners are landing on your site right now. BetterRoofing captures them with an instant quote before they bounce. $49/mo, $0 to start.',
  competitorPrice: '$300 / mo + $1.5k setup',
  competitorSetupFee: '$1,500',
  competitorYear1: '$5,100',
  competitorYear1Note: '($300/mo × 12 + $1.5k)',
  differentiators: [
    {
      title: 'Convert Traffic You Already Have',
      body: 'You\'re already spending money on SEO and ads to drive homeowners to your site. BetterRoofing turns those visitors into leads with an instant quote widget — before they bounce to a competitor.',
    },
    {
      title: '$1,500 Cheaper To Start',
      body: 'Demand IQ charges a $1,500 setup fee before you see a single result. BetterRoofing is $0 to start. Sign up, embed one snippet, and you\'re live today.',
    },
    {
      title: 'Live In 5 Minutes',
      body: 'No onboarding calls. No waiting a week to go live. Paste one line of code into your site and your instant quote widget is active. That\'s it.',
    },
    {
      title: 'AI Follow-Ups Included',
      body: 'Every lead automatically gets an AI-written intelligence brief, follow-up email drafts, and SMS templates. Demand IQ doesn\'t offer AI-powered lead follow-up tools.',
    },
  ],
  rows: [
    { feature: 'Monthly price',                               us: '$49 / mo',  competitor: '$300 / mo',  highlight: true },
    { feature: 'Setup fee',                                   us: '$0',        competitor: '$1,500',      highlight: true },
    { feature: 'Instant quote widget',                        us: true,        competitor: true },
    { feature: 'Lead scoring & qualification',                us: true,        competitor: false,         highlight: true },
    { feature: 'Lead pipeline (New→Contacted→Won)',           us: true,        competitor: false },
    { feature: 'Insurance claim detection',                   us: true,        competitor: false,         highlight: true },
    { feature: 'Material selector (asphalt/metal/tile/flat)', us: true,        competitor: false },
    { feature: 'Service area filtering',                      us: true,        competitor: false },
    { feature: 'Floating tab widget (every page)',            us: true,        competitor: false,         isPro: true },
    { feature: 'AI lead intelligence brief',                  us: true,        competitor: false,         isAI: true, highlight: true },
    { feature: 'AI follow-up email & SMS drafts',             us: true,        competitor: false,         isAI: true, highlight: true },
    { feature: 'Weekly AI intelligence report',               us: true,        competitor: false,         isAI: true },
    { feature: 'Email lead notifications',                    us: true,        competitor: true },
    { feature: 'Webhook / Zapier integration',                us: true,        competitor: true,          isPro: true },
    { feature: 'Booking CTA on result screen',                us: true,        competitor: true,          isPro: true },
    { feature: 'No long-term contract',                       us: true,        competitor: false,         highlight: true },
    { feature: 'Live in under 5 minutes',                     us: true,        competitor: false },
  ],
}

export default function VsDemandIQ() {
  return <ComparisonPage config={config} />
}
