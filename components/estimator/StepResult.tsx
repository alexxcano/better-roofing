import { CalendarCheck } from 'lucide-react'

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'Asphalt Shingles',
  metal:   'Metal Roofing',
  tile:    'Tile Roofing',
  flat:    'Flat / TPO',
}

// Typical market rates per material (national avg from HomeAdvisor/Angi data)
const TYPICAL_MARKET_RATE: Record<string, number> = {
  asphalt: 1.40,
  metal:   1.35,
  tile:    1.30,
  flat:    1.35,
}

interface StepResultProps {
  estimateLow: number
  estimateHigh: number
  name: string
  companyName: string
  materialType: string
  bookingUrl: string | null
  address: string
  squares: number
  insuranceClaim: string  // 'yes' | 'no' | 'unsure'
}

export function StepResult({
  estimateLow,
  estimateHigh,
  name,
  companyName,
  materialType,
  bookingUrl,
  address,
  squares,
  insuranceClaim,
}: StepResultProps) {
  const firstName = name.split(' ')[0]
  const material = MATERIAL_LABELS[materialType] ?? materialType
  const isInsuranceClaim = insuranceClaim === 'yes'

  // Single midpoint price — more persuasive than showing a range
  const midpoint = Math.round((estimateLow + estimateHigh) / 2 / 100) * 100
  const multiplier = TYPICAL_MARKET_RATE[materialType] ?? 1.40
  const typicalPrice = Math.round((midpoint * multiplier) / 100) * 100
  const savings = typicalPrice - midpoint

  const currentMonth = new Date().toLocaleString('default', { month: 'long' })

  // Shorten address for display — just street + city
  const shortAddress = address.split(',').slice(0, 2).join(',')

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">
          Your instant estimate
        </p>
        <h2 className="text-2xl font-black text-stone-900 leading-tight">
          {firstName ? `Here's your estimate, ${firstName}.` : "Here's your estimate."}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Based on your home size and local {material.toLowerCase()} pricing.
        </p>
      </div>

      {/* The number */}
      <div className="bg-stone-900 px-6 py-7 relative overflow-hidden animate-pop-in" style={{ animationDelay: '120ms' }}>
        {/* Accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{
          background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
        }} />

        {/* Address + material */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">{material}</p>
          {squares > 0 && (
            <p className="text-[10px] font-semibold text-stone-500 text-right leading-snug">
              {squares} squares detected<br />
              <span className="text-stone-600">from your address</span>
            </p>
          )}
        </div>

        {shortAddress && (
          <p className="text-stone-500 text-xs font-semibold mb-3 truncate">{shortAddress}</p>
        )}

        {/* Typical price crossed out */}
        <p className="text-stone-500 text-sm font-semibold mb-1 line-through decoration-red-500 decoration-2">
          Typical quote: ${typicalPrice.toLocaleString()}
        </p>

        {/* Single bold price */}
        <p className="font-black text-white leading-none" style={{ fontSize: 'clamp(2.5rem, 11vw, 3.75rem)' }}>
          ${midpoint.toLocaleString()}
        </p>

        {/* Range context + savings */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide">
            Range: ${estimateLow.toLocaleString()}–${estimateHigh.toLocaleString()}
          </p>
          <span className="bg-green-500/20 text-green-400 text-xs font-black uppercase tracking-wide px-2 py-0.5">
            Save ~${savings.toLocaleString()} vs. typical
          </span>
        </div>
      </div>

      {/* Insurance claim callout */}
      {isInsuranceClaim && (
        <div className="border-l-4 border-blue-400 bg-blue-50 px-4 py-3.5">
          <p className="text-xs font-black uppercase tracking-widest text-blue-700 mb-1">Insurance Claim</p>
          <p className="text-sm text-blue-800 leading-relaxed">
            With an approved storm claim, your out-of-pocket cost is typically just your deductible —
            usually <strong>$1,000–$2,500</strong>. Your insurance covers the rest of the replacement cost.
          </p>
        </div>
      )}

      {/* What's included */}
      <div className="space-y-2.5">
        {[
          'Includes material, labor, and tear-off — no hidden line items',
          'Calibrated to local contractor pricing in your area',
          'Free on-site inspection confirms the final price',
        ].map((line) => (
          <div key={line} className="flex items-start gap-2.5">
            <div className="h-4 w-4 bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 10" stroke="currentColor" strokeWidth={2.5}>
                <path d="M1 5l3.5 3.5L11 1" />
              </svg>
            </div>
            <p className="text-sm text-stone-600">{line}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      {bookingUrl ? (
        <div className="space-y-2">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest"
          >
            <CalendarCheck className="h-4 w-4" />
            {isInsuranceClaim ? 'Book a Free Claim Inspection' : 'Book a Free Inspection'}
          </a>
          <p className="text-xs text-center text-stone-400">
            {currentMonth} inspection slots are filling — no commitment required
          </p>
        </div>
      ) : (
        <div className="border-2 border-stone-200 overflow-hidden">
          <div className="bg-orange-500 px-5 py-3">
            <p className="text-white font-black text-sm uppercase tracking-widest">
              {firstName ? `You're all set, ${firstName}!` : "You're all set!"}
            </p>
          </div>
          <div className="divide-y divide-stone-100">
            {[
              {
                n: '01',
                title: `${companyName} will call you within 24 hours`,
                desc: "They'll review your estimate and answer any questions you have.",
              },
              {
                n: '02',
                title: 'Schedule a free on-site inspection',
                desc: 'A roofing expert comes to your home and confirms the final price.',
              },
              {
                n: '03',
                title: 'Get a detailed written quote',
                desc: 'No obligation, no pressure — just a firm number you can count on.',
              },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-4 px-5 py-4">
                <span className="font-black text-xl text-orange-500 leading-none w-7 flex-shrink-0">{s.n}</span>
                <div>
                  <p className="font-bold text-stone-900 text-sm">{s.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-stone-400 text-center">
        Actual pricing may vary based on site conditions. No obligation.
      </p>
    </div>
  )
}
