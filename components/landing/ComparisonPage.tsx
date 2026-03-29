import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { FinalCta } from '@/components/landing/FinalCta'
import { Footer } from '@/components/landing/Footer'

export type ComparisonRow = {
  feature: string
  us: boolean | string
  competitor: boolean | string
  highlight?: boolean
  isAI?: boolean
  isPro?: boolean
}

export type ComparisonPageConfig = {
  competitor: string
  heroHeadline: string
  heroSubheadline: string
  competitorPrice: string
  competitorSetupFee: string
  competitorYear1: string
  competitorYear1Note: string
  differentiators: { title: string; body: string }[]
  rows: ComparisonRow[]
}

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="font-barlow font-bold text-lg text-stone-900">{value}</span>
  }
  return value
    ? <Check className="h-5 w-5 mx-auto text-orange-500" />
    : <X className="h-5 w-5 text-stone-300 mx-auto" />
}

export function ComparisonPage({ config }: { config: ComparisonPageConfig }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-stone-900 bg-asphalt overflow-hidden">
        <div className="h-1.5" style={{
          background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
        }} />
        <div className="container max-w-5xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 mb-6">
              <span className="text-orange-400 text-xs font-black uppercase tracking-widest">
                BetterRoofing vs {config.competitor}
              </span>
            </div>
            <h1 className="font-barlow font-black text-5xl md:text-7xl text-white uppercase leading-none mb-5">
              {config.heroHeadline.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-stone-300 text-xl max-w-xl mb-8">
              {config.heroSubheadline}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup" className="btn btn-primary px-8 py-4">
                Start Free — No Credit Card
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="space-y-1">
                {['$0 setup fee', '14-day free trial', 'Live in 5 minutes'].map((t) => (
                  <p key={t} className="text-xs text-stone-400 font-semibold uppercase tracking-widest">✓ {t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="h-1.5" style={{
          background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
        }} />
      </section>

      {/* Cost Shock */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1 w-10 bg-orange-500" />
              <span className="text-orange-600 text-sm font-black uppercase tracking-widest">Year 1 Cost</span>
            </div>
            <h2 className="font-barlow font-black text-4xl md:text-5xl text-stone-900 uppercase leading-none">
              The Numbers Don&apos;t Lie.
            </h2>
          </div>

          <div className="grid grid-cols-2 border-2 border-stone-300 overflow-hidden mb-3">
            {/* BetterRoofing */}
            <div className="bg-stone-900 bg-asphalt px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{
                background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
              }} />
              <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-5 mt-1">BetterRoofing</p>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Setup fee</p>
              <p className="font-barlow font-black text-5xl md:text-6xl text-orange-400 leading-none">$0</p>
              <div className="mt-6 pt-5 border-t border-stone-700">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Year 1 total</p>
                <p className="font-barlow font-black text-4xl md:text-5xl text-white leading-none">$588</p>
                <p className="text-stone-500 text-[10px] font-semibold mt-1">($49/mo × 12)</p>
              </div>
            </div>

            {/* Competitor */}
            <div className="bg-stone-50 px-6 py-8 text-center border-l border-stone-200">
              <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-5">{config.competitor}</p>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Setup fee</p>
              <p className="font-barlow font-black text-5xl md:text-6xl text-red-500 leading-none">{config.competitorSetupFee}</p>
              <div className="mt-6 pt-5 border-t border-stone-200">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Year 1 total</p>
                <p className="font-barlow font-black text-4xl md:text-5xl text-stone-400 leading-none">{config.competitorYear1}</p>
                <p className="text-stone-400 text-[10px] font-semibold mt-1">{config.competitorYear1Note}</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest text-right">
            BetterRoofing Starter plan · All figures approximate
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-stone-50 border-b border-stone-200">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1 w-10 bg-orange-500" />
              <span className="text-orange-600 text-sm font-black uppercase tracking-widest">Feature Comparison</span>
            </div>
            <h2 className="font-barlow font-black text-4xl md:text-5xl text-stone-900 uppercase leading-none">
              Side By Side.
            </h2>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <div className="border-2 border-stone-300 bg-white overflow-hidden min-w-[420px]">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_140px_140px] border-b-2 border-stone-300">
                <div className="px-4 py-4 bg-stone-100 border-r-2 border-stone-300">
                  <span className="text-xs text-stone-400 font-black uppercase tracking-widest">Feature</span>
                </div>
                <div className="px-3 py-4 text-center border-r-2 border-stone-300 bg-orange-500">
                  <p className="font-barlow font-black text-sm text-white uppercase tracking-wider leading-none">BetterRoofing</p>
                  <p className="text-orange-200 text-[10px] font-semibold mt-1">from $49/mo</p>
                </div>
                <div className="px-3 py-4 text-center bg-stone-50">
                  <p className="font-barlow font-bold text-sm text-stone-500 uppercase tracking-wider leading-none">{config.competitor}</p>
                  <p className="text-stone-400 text-[10px] font-semibold mt-1">{config.competitorPrice}</p>
                </div>
              </div>

              {/* Data rows */}
              {config.rows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-[1fr_140px_140px] border-t border-stone-200 ${
                    row.isAI ? 'bg-orange-50/40' : row.highlight ? 'bg-stone-50/80' : i % 2 === 1 ? 'bg-stone-50/30' : 'bg-white'
                  }`}
                >
                  <div className="px-4 py-3 border-r-2 border-stone-200 flex items-center gap-2 flex-wrap">
                    {(row.highlight || row.isAI) && <div className="h-1.5 w-1.5 bg-orange-500 rounded-full flex-shrink-0" />}
                    <span className={`text-sm ${(row.highlight || row.isAI) ? 'text-stone-800 font-bold' : 'text-stone-600 font-medium'}`}>
                      {row.feature}
                    </span>
                    {row.isAI && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-300 bg-orange-100 px-1.5 py-0.5 leading-none">
                        AI
                      </span>
                    )}
                    {row.isPro && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-100 border border-stone-600 bg-stone-800 px-1.5 py-0.5 leading-none">
                        Pro
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-3 text-center border-r border-stone-200 bg-orange-50/60">
                    <Cell value={row.us} />
                  </div>
                  <div className="px-3 py-3 text-center">
                    <Cell value={row.competitor} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="md:hidden text-[10px] text-stone-400 font-semibold uppercase tracking-widest text-center mt-2">← swipe to compare →</p>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1 w-10 bg-orange-500" />
              <span className="text-orange-600 text-sm font-black uppercase tracking-widest">Why BetterRoofing</span>
            </div>
            <h2 className="font-barlow font-black text-4xl md:text-5xl text-stone-900 uppercase leading-none">
              4 Reasons To Switch.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-px bg-stone-200 border-2 border-stone-200">
            {config.differentiators.map((d, i) => (
              <div key={i} className="bg-white p-8">
                <div className="font-barlow font-black text-6xl text-stone-100 leading-none mb-3 select-none">
                  0{i + 1}
                </div>
                <h3 className="font-barlow font-black text-xl text-stone-900 uppercase tracking-wide mb-2">
                  {d.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Callout */}
      <section className="py-16 bg-stone-900 bg-asphalt border-b border-stone-700">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">The math is simple</p>
              <p className="font-barlow font-black text-3xl text-white uppercase leading-none mb-2">
                One Job Covers 17 Years Of This
              </p>
              <p className="text-stone-400 text-sm max-w-md">
                The average residential roof is $10,000+. BetterRoofing Starter costs $588 per year.
                Win one job you would have missed and you&apos;ve paid for this subscription until 2042.
              </p>
            </div>
            <Link href="/signup" className="flex-shrink-0 btn btn-primary px-8 py-3.5 whitespace-nowrap">
              Start Free — No Credit Card →
            </Link>
          </div>
        </div>
      </section>

      <FinalCta />
      <Footer />
    </div>
  )
}
