import { Check, X } from 'lucide-react'
import Link from 'next/link'

const rows = [
  { feature: 'Monthly price',                             us: '$49 / mo',  roofle: '$350 / mo',  demandiq: '$300 / mo', highlight: true },
  { feature: 'Setup fee',                                 us: '$0',        roofle: '$2,000',      demandiq: '$1,500',    highlight: true },
  { feature: 'Instant quote widget',                      us: true,        roofle: true,          demandiq: true },
  { feature: 'Lead scoring & qualification',              us: true,        roofle: false,         demandiq: false, highlight: true },
  { feature: 'Lead pipeline (New→Contacted→Won)',         us: true,        roofle: false,         demandiq: false },
  { feature: 'Insurance claim detection',                 us: true,        roofle: false,         demandiq: false, highlight: true },
  { feature: 'Material selector (asphalt/metal/tile/flat)', us: true,      roofle: true,          demandiq: false },
  { feature: 'Service area filtering',                    us: true,        roofle: false,         demandiq: false },
  { feature: 'Floating tab widget (every page)',          us: true,        roofle: false,         demandiq: false, isPro: true },
  { feature: 'AI lead intelligence brief',                us: true,        roofle: false,         demandiq: false, isAI: true, highlight: true },
  { feature: 'AI follow-up email & SMS drafts',           us: true,        roofle: false,         demandiq: false, isAI: true, highlight: true },
  { feature: 'Weekly AI intelligence report',             us: true,        roofle: false,         demandiq: false, isAI: true },
  { feature: 'Email lead notifications',                  us: true,        roofle: true,          demandiq: true },
  { feature: 'Webhook / Zapier integration',              us: true,        roofle: true,          demandiq: true, isPro: true },
  { feature: 'Booking CTA on result screen',              us: true,        roofle: false,         demandiq: true, isPro: true },
  { feature: 'No long-term contract',                     us: true,        roofle: false,         demandiq: false, highlight: true },
  { feature: 'Live in under 5 minutes',                   us: true,        roofle: false,         demandiq: false },
]

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="font-barlow font-bold text-lg text-stone-900">{value}</span>
  }
  return value
    ? <Check className="h-5 w-5 mx-auto text-orange-500" />
    : <X className="h-5 w-5 text-stone-300 mx-auto" />
}

export function Comparison() {
  return (
    <section className="py-24 bg-white border-b border-stone-200">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-10 bg-orange-500" />
            <span className="text-orange-600 text-sm font-black uppercase tracking-widest">vs. The Competition</span>
          </div>
          <h2 className="font-barlow font-black text-5xl md:text-6xl text-stone-900 uppercase leading-none mb-3">
            They Charge $2,000<br />
            <span className="text-orange-500">Before You Get A Lead.</span>
          </h2>
          <p className="text-stone-600 text-lg max-w-xl">
            Roofle and Demand IQ hit you with massive setup fees before your widget is even live — then charge 7x our monthly price with no AI. We charge nothing to start.
          </p>
        </div>

        {/* Year 1 cost shock */}
        <div className="grid grid-cols-3 border-2 border-stone-300 overflow-hidden mb-3">
          {/* BetterRoofing */}
          <div className="bg-stone-900 bg-asphalt px-4 md:px-6 py-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{
              background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
            }} />
            <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-4 mt-1">BetterRoofing</p>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Setup fee</p>
            <p className="font-barlow font-black text-4xl md:text-5xl text-orange-400 leading-none">$0</p>
            <div className="mt-5 pt-4 border-t border-stone-700">
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Year 1 total</p>
              <p className="font-barlow font-black text-3xl md:text-4xl text-white leading-none">$588</p>
              <p className="text-stone-500 text-[10px] font-semibold mt-1">($49/mo × 12)</p>
            </div>
          </div>

          {/* Roofle */}
          <div className="bg-stone-50 px-4 md:px-6 py-6 text-center border-x border-stone-200">
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">Roofle</p>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Setup fee</p>
            <p className="font-barlow font-black text-4xl md:text-5xl text-red-500 leading-none">$2,000</p>
            <div className="mt-5 pt-4 border-t border-stone-200">
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Year 1 total</p>
              <p className="font-barlow font-black text-3xl md:text-4xl text-stone-400 leading-none">$6,200</p>
              <p className="text-stone-400 text-[10px] font-semibold mt-1">($350/mo × 12 + $2k)</p>
            </div>
          </div>

          {/* Demand IQ */}
          <div className="bg-stone-50 px-4 md:px-6 py-6 text-center">
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">Demand IQ</p>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Setup fee</p>
            <p className="font-barlow font-black text-4xl md:text-5xl text-red-500 leading-none">$1,500</p>
            <div className="mt-5 pt-4 border-t border-stone-200">
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wide mb-1">Year 1 total</p>
              <p className="font-barlow font-black text-3xl md:text-4xl text-stone-400 leading-none">$5,100</p>
              <p className="text-stone-400 text-[10px] font-semibold mt-1">($300/mo × 12 + $1.5k)</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest text-right mb-10">
          BetterRoofing Starter plan · All figures approximate
        </p>

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
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_130px_120px_120px] border-t border-stone-200 ${
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
                <div className="px-3 py-3 text-center border-r border-stone-200">
                  <Cell value={row.roofle} />
                </div>
                <div className="px-3 py-3 text-center">
                  <Cell value={row.demandiq} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="md:hidden text-[10px] text-stone-400 font-semibold uppercase tracking-widest text-center mt-2">← swipe to compare →</p>

        {/* ROI callout */}
        <div className="mt-6 bg-stone-900 bg-asphalt p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">The math is simple</p>
              <p className="font-barlow font-black text-3xl text-white uppercase leading-none mb-2">
                One Job Covers 17 Years Of This
              </p>
              <p className="text-stone-400 text-sm max-w-md">
                The average residential roof is $10,000+. BetterRoofing Starter costs $588 per year.
                Win one job this year that you would have missed — and you&apos;ve paid for this subscription until 2042.
                Meanwhile your competitors are burning $6,200 a year on Roofle.
              </p>
            </div>
            <Link
              href="/signup"
              className="flex-shrink-0 btn btn-primary px-8 py-3.5 whitespace-nowrap"
            >
              Start Free — No Credit Card →
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
