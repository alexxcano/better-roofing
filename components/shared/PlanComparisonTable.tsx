import { Check, X } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

type CellValue = boolean | string

interface Row {
  label: string
  starter: CellValue
  pro: CellValue
  differentiator?: boolean
  proOnly?: boolean       // show Pro badge on label
}

const ROWS: Row[] = [
  // Core
  { label: 'Monthly leads',                  starter: '50',    pro: 'Unlimited', differentiator: true },
  { label: 'Instant quote widget',            starter: true,    pro: true },
  { label: 'Material types (asphalt/metal/tile/flat)', starter: true, pro: true },
  { label: 'Lead scoring & qualification',    starter: true,    pro: true },
  { label: 'Lead pipeline (New→Quoted→Won)',  starter: true,    pro: true },
  { label: 'Service area filtering',          starter: true,    pro: true },
  { label: 'Email notifications',             starter: true,    pro: true },
  { label: 'CSV export',                      starter: true,    pro: true },
  // Pro AI features
  { label: 'AI lead intelligence brief',      starter: false,   pro: true, differentiator: true, proOnly: true },
  { label: 'AI follow-up email draft',        starter: false,   pro: true, differentiator: true, proOnly: true },
  { label: 'AI SMS draft',                    starter: false,   pro: true, differentiator: true, proOnly: true },
  { label: 'Weekly AI intelligence report',   starter: false,   pro: true, differentiator: true, proOnly: true },
  // Pro integrations
  { label: 'Webhook / Zapier',                starter: false,   pro: true, differentiator: true, proOnly: true },
  { label: 'Booking CTA on widget',           starter: false,   pro: true, differentiator: true, proOnly: true },
  { label: 'Support',                         starter: 'Email', pro: 'Priority', differentiator: true },
]

function Cell({ value, isPro, differentiator }: { value: CellValue; isPro: boolean; differentiator?: boolean }) {
  if (typeof value === 'boolean') {
    if (value) {
      return (
        <div className="flex justify-center">
          <div className={`h-5 w-5 flex items-center justify-center flex-shrink-0 ${
            isPro ? 'bg-orange-500' : 'bg-stone-700'
          }`}>
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        </div>
      )
    }
    return (
      <div className="flex justify-center">
        <X className="h-4 w-4 text-stone-300" strokeWidth={2.5} />
      </div>
    )
  }

  const isUnlimited = value === 'Unlimited'
  const isNumeric = !isNaN(Number(value))

  if (isUnlimited && isPro) {
    return <p className="font-barlow font-black text-xl text-orange-500 text-center uppercase tracking-wide leading-none">Unlimited</p>
  }
  if (isNumeric && !isPro && differentiator) {
    return <p className="font-barlow font-black text-3xl text-stone-800 text-center leading-none">{value}</p>
  }

  return (
    <p className={`text-center text-sm font-bold uppercase tracking-wide ${
      isPro && differentiator ? 'text-orange-600' : 'text-stone-700'
    }`}>
      {value}
    </p>
  )
}

interface PlanComparisonTableProps {
  renderCta: (plan: 'STARTER' | 'PRO') => React.ReactNode
}

export function PlanComparisonTable({ renderCta }: PlanComparisonTableProps) {
  return (
    <>
      {/* ── Mobile: stacked plan cards ── */}
      <div className="md:hidden space-y-4">
        {/* Starter card */}
        <div className="border-2 border-stone-300 bg-white overflow-hidden">
          <div className="px-5 py-5 border-b-2 border-stone-300">
            <p className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none">Starter</p>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide mt-0.5">Solo contractor</p>
            <div className="flex items-baseline gap-1 mt-3 mb-1">
              <span className="font-barlow font-black text-4xl text-stone-900 leading-none">$49</span>
              <span className="text-stone-500 font-semibold text-sm">/mo</span>
            </div>
            <p className="text-[11px] text-orange-700 font-bold border-l-2 border-orange-500 pl-2 mb-4">
              1 job covers {Math.round(10000 / (PLANS.STARTER.price * 12))}+ years
            </p>
            {renderCta('STARTER')}
          </div>
          <div className="divide-y divide-stone-100">
            {ROWS.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-2.5 gap-4">
                <p className={`text-sm ${row.differentiator ? 'font-bold text-stone-800' : 'font-medium text-stone-500'}`}>
                  {row.label}
                </p>
                <div className="flex-shrink-0">
                  <Cell value={row.starter} isPro={false} differentiator={row.differentiator} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro card */}
        <div className="border-2 border-stone-700 overflow-hidden">
          <div className="px-5 py-5 bg-stone-900 relative overflow-hidden border-b-2 border-stone-700">
            <div className="absolute top-0 left-0 right-0 h-1" style={{
              background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
            }} />
            <div className="flex items-center gap-2 mt-1 mb-0.5">
              <p className="font-barlow font-black text-2xl uppercase text-white leading-none">Pro</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 border border-orange-500/50 bg-orange-500/20 px-1.5 py-0.5">
                Popular
              </span>
            </div>
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide">Growing crew + AI</p>
            <div className="flex items-baseline gap-1 mt-3 mb-1">
              <span className="font-barlow font-black text-4xl text-white leading-none">$97</span>
              <span className="text-stone-400 font-semibold text-sm">/mo</span>
            </div>
            <p className="text-[11px] text-stone-500 font-semibold mb-4">
              One $10k job = {Math.round(10000 / (PLANS.PRO.price * 12))}+ years covered
            </p>
            {renderCta('PRO')}
          </div>
          <div className="divide-y divide-stone-100 bg-white">
            {ROWS.map((row) => (
              <div key={row.label} className={`flex items-center justify-between px-5 py-2.5 gap-4 ${row.differentiator ? 'bg-orange-50/60' : ''}`}>
                <p className={`text-sm ${row.differentiator ? 'font-bold text-stone-800' : 'font-medium text-stone-500'}`}>
                  {row.label}
                </p>
                <div className="flex-shrink-0">
                  <Cell value={row.pro} isPro={true} differentiator={row.differentiator} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop: 3-column grid ── */}
      <div className="hidden md:block border-2 border-stone-300 overflow-hidden bg-white">

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b-2 border-stone-300">
          <div className="px-6 py-5 bg-stone-100 border-r-2 border-stone-300 flex flex-col justify-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Compare Plans</p>
          </div>
          <div className="px-6 py-5 bg-white border-r-2 border-stone-300 flex flex-col">
            <div className="mb-4">
              <p className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none">Starter</p>
              <p className="text-xs text-stone-600 font-semibold uppercase tracking-wide mt-1">Solo contractor</p>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="font-barlow font-black text-5xl text-stone-900 leading-none">$49</span>
                <span className="text-stone-500 font-semibold text-sm">/mo</span>
              </div>
              <p className="text-[11px] text-orange-700 font-bold mt-1 border-l-2 border-orange-500 pl-2">
                1 job covers {Math.round(10000 / (PLANS.STARTER.price * 12))}+ years
              </p>
            </div>
            <div className="mt-auto">{renderCta('STARTER')}</div>
          </div>
          <div className="px-6 py-5 bg-stone-900 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{
              background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
            }} />
            <div className="mb-4 mt-1">
              <div className="flex items-center gap-2">
                <p className="font-barlow font-black text-2xl uppercase text-white leading-none">Pro</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 border border-orange-500/50 bg-orange-500/20 px-1.5 py-0.5">Popular</span>
              </div>
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mt-1">Growing crew + AI</p>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="font-barlow font-black text-5xl text-white leading-none">$97</span>
                <span className="text-stone-400 font-semibold text-sm">/mo</span>
              </div>
              <p className="text-[11px] text-stone-500 font-semibold mt-1">
                One $10k job = {Math.round(10000 / (PLANS.PRO.price * 12))}+ years covered
              </p>
            </div>
            <div className="mt-auto">{renderCta('PRO')}</div>
          </div>
        </div>

        {/* Feature rows */}
        {ROWS.map((row, i) => (
          <div key={row.label} className={`grid grid-cols-[1fr_1fr_1fr] border-t border-stone-200 ${i % 2 === 1 ? 'bg-stone-50/60' : 'bg-white'}`}>
            <div className="px-6 py-3 border-r-2 border-stone-200 flex items-center gap-2">
              {row.differentiator && <div className="h-1.5 w-1.5 bg-orange-500 flex-shrink-0 rounded-full" />}
              <p className={`text-sm ${row.differentiator ? 'font-bold text-stone-800' : 'font-medium text-stone-500'}`}>{row.label}</p>
            </div>
            <div className="px-6 py-3 border-r-2 border-stone-200 flex items-center justify-center">
              <Cell value={row.starter} isPro={false} differentiator={row.differentiator} />
            </div>
            <div className={`px-6 py-3 flex items-center justify-center ${row.differentiator ? 'bg-orange-50' : ''}`}>
              <Cell value={row.pro} isPro={true} differentiator={row.differentiator} />
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="grid grid-cols-[1fr_1fr_1fr] border-t-2 border-stone-200">
          <div className="px-6 py-3 bg-stone-100 border-r-2 border-stone-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">● Key differences</p>
          </div>
          <div className="px-6 py-3 bg-stone-50 border-r-2 border-stone-200 flex justify-center">
            {renderCta('STARTER')}
          </div>
          <div className="px-6 py-3 bg-stone-900 flex justify-center">
            {renderCta('PRO')}
          </div>
        </div>
      </div>
    </>
  )
}
