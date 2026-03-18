import { Check, X } from 'lucide-react'
import Link from 'next/link'

const rows = [
  { feature: 'Monthly price',                          us: '$49 / mo',  roofle: '$350 / mo',  demandiq: '$300 / mo' },
  { feature: 'Setup fee',                              us: '$0',        roofle: '$2,000',      demandiq: '$1,500' },
  { feature: 'Instant quote widget',                   us: true,        roofle: true,          demandiq: true },
  { feature: 'Lead scoring & qualification',           us: true,        roofle: false,         demandiq: false },
  { feature: 'Lead pipeline (New→Contacted→Won)',      us: true,        roofle: false,         demandiq: false },
  { feature: 'Insurance claim detection',              us: true,        roofle: false,         demandiq: false },
  { feature: 'Journey-style widget (one question/screen)', us: true,    roofle: false,         demandiq: true },
  { feature: 'Material selector (asphalt/metal/tile/flat)', us: true,   roofle: true,          demandiq: false },
  { feature: 'Service area filtering',                 us: true,        roofle: false,         demandiq: false },
  { feature: 'AI lead intelligence brief',             us: true,        roofle: false,         demandiq: false },
  { feature: 'AI follow-up email & SMS drafts',        us: true,        roofle: false,         demandiq: false },
  { feature: 'Weekly AI intelligence report',          us: true,        roofle: false,         demandiq: false },
  { feature: 'Email lead notifications',               us: true,        roofle: true,          demandiq: true },
  { feature: 'Webhook / Zapier integration',           us: true,        roofle: true,          demandiq: true },
  { feature: 'Booking CTA on result screen',           us: true,        roofle: false,         demandiq: true },
  { feature: 'No long-term contract',                  us: true,        roofle: false,         demandiq: false },
  { feature: 'Set up in under 5 minutes',              us: true,        roofle: false,         demandiq: false },
]

const AI_ROWS = new Set([
  'AI lead intelligence brief',
  'AI follow-up email & SMS drafts',
  'Weekly AI intelligence report',
])

// Pro plan only (shown even if not AI-specific)
const PRO_ONLY_ROWS = new Set([
  'AI lead intelligence brief',
  'AI follow-up email & SMS drafts',
  'Weekly AI intelligence report',
  'Webhook / Zapier integration',
  'Booking CTA on result screen',
])

function Cell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === 'string') {
    return <span className="font-barlow font-bold text-lg text-stone-900">{value}</span>
  }
  return value
    ? <Check className={`h-5 w-5 mx-auto ${highlight ? 'text-orange-500' : 'text-orange-500'}`} />
    : <X className="h-5 w-5 text-stone-300 mx-auto" />
}

export function Comparison() {
  return (
    <section className="py-24 bg-white border-b border-stone-200">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-10 bg-orange-500" />
            <span className="text-orange-600 text-sm font-black uppercase tracking-widest">vs. The Competition</span>
          </div>
          <h2 className="font-barlow font-black text-5xl md:text-6xl text-stone-900 uppercase leading-none mb-3">
            More Features.<br />
            <span className="text-orange-500">1/7th The Price.</span>
          </h2>
          <p className="text-stone-600 text-lg max-w-xl">
            Roofle and Demand IQ charge $300–$350/mo plus setup fees — and still don&apos;t give you AI.
            BetterRoofing gives you a full AI sales layer starting at $49/mo with zero setup.
          </p>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="border-2 border-stone-300 bg-white overflow-hidden min-w-[540px]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_130px_120px_120px] border-b-2 border-stone-300">
              <div className="px-4 py-4 bg-stone-100 border-r-2 border-stone-300">
                <span className="text-xs text-stone-400 font-black uppercase tracking-widest">Feature</span>
              </div>
              <div className="px-3 py-4 text-center border-r-2 border-stone-300 bg-orange-500">
                <p className="font-barlow font-black text-sm text-white uppercase tracking-wider leading-none">BetterRoofing</p>
                <p className="text-orange-200 text-[10px] font-semibold mt-1">from $49/mo</p>
              </div>
              <div className="px-3 py-4 text-center border-r border-stone-200 bg-stone-50">
                <p className="font-barlow font-bold text-sm text-stone-500 uppercase tracking-wider leading-none">Roofle</p>
                <p className="text-stone-400 text-[10px] font-semibold mt-1">$350/mo + $2k</p>
              </div>
              <div className="px-3 py-4 text-center bg-stone-50">
                <p className="font-barlow font-bold text-sm text-stone-500 uppercase tracking-wider leading-none">Demand IQ</p>
                <p className="text-stone-400 text-[10px] font-semibold mt-1">$300/mo + $1.5k</p>
              </div>
            </div>

            {/* Data rows */}
            {rows.map((row, i) => {
              const isAI = AI_ROWS.has(row.feature)
              const isPro = PRO_ONLY_ROWS.has(row.feature)
              return (
                <div
                  key={row.feature}
                  className={`grid grid-cols-[1fr_130px_120px_120px] border-t border-stone-200 ${
                    isAI ? 'bg-orange-50/40' : i % 2 === 1 ? 'bg-stone-50/50' : 'bg-white'
                  }`}
                >
                  <div className="px-4 py-3 border-r-2 border-stone-200 flex items-center gap-2 flex-wrap">
                    {(isAI || isPro) && <div className="h-1.5 w-1.5 bg-orange-500 rounded-full flex-shrink-0" />}
                    <span className={`text-sm ${(isAI || isPro) ? 'text-stone-800 font-bold' : 'text-stone-700 font-medium'}`}>
                      {row.feature}
                    </span>
                    {isAI && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-300 bg-orange-100 px-1.5 py-0.5 leading-none">
                        AI
                      </span>
                    )}
                    {isPro && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-100 border border-stone-600 bg-stone-800 px-1.5 py-0.5 leading-none">
                        Pro
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-3 text-center border-r border-stone-200 bg-orange-50/60">
                    <Cell value={row.us} />
                  </div>
                  <div className="px-3 py-3 text-center border-r border-stone-200">
                    <Cell value={row.roofle} />
                  </div>
                  <div className="px-3 py-3 text-center">
                    <Cell value={row.demandiq} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="md:hidden text-[10px] text-stone-400 font-semibold uppercase tracking-widest text-center mt-2">← swipe to compare →</p>

        {/* ROI callout */}
        <div className="mt-6 bg-stone-900 bg-asphalt p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-barlow font-black text-3xl text-white uppercase leading-none mb-2">
                One Roofing Job = $10,000+
              </p>
              <p className="text-stone-400 text-sm">
                BetterRoofing costs $49/mo. A single extra job pays for{' '}
                <span className="text-orange-400 font-bold">17 years</span> of this subscription.
              </p>
            </div>
            <Link
              href="/signup"
              className="flex-shrink-0 btn btn-primary px-8 py-3.5 whitespace-nowrap"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
