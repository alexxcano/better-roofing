import { CalendarCheck } from 'lucide-react'

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'Asphalt Shingles',
  metal: 'Metal Roofing',
  tile: 'Tile Roofing',
  flat: 'Flat / TPO',
}

interface StepResultProps {
  estimateLow: number
  estimateHigh: number
  name: string
  companyName: string
  materialType: string
  urgency: string
  bookingUrl: string | null
}

export function StepResult({
  estimateLow,
  estimateHigh,
  name,
  companyName,
  materialType,
  urgency,
  bookingUrl,
}: StepResultProps) {
  const isUrgent = urgency === 'emergency'
  const firstName = name.split(' ')[0]
  const material = MATERIAL_LABELS[materialType] ?? materialType

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">
          {isUrgent ? '🚨 Emergency estimate' : 'Your instant estimate'}
        </p>
        <h2 className="text-2xl font-black text-stone-900 leading-tight">
          {firstName ? `Here's your estimate, ${firstName}.` : "Here's your estimate."}
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Based on your home size and local {material.toLowerCase()} pricing.
        </p>
      </div>

      {/* The number — this is the payoff, make it count */}
      <div className="bg-stone-900 px-6 py-7 relative overflow-hidden">
        {/* Accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{
          background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)'
        }} />
        <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">{material}</p>
        <p className="font-black text-white leading-none" style={{ fontSize: 'clamp(2.25rem, 10vw, 3.5rem)' }}>
          ${estimateLow.toLocaleString()}
          <span className="text-stone-400 mx-2 font-light">–</span>
          ${estimateHigh.toLocaleString()}
        </p>
        <p className="text-stone-500 text-xs font-semibold mt-3 uppercase tracking-wide">
          Estimated project cost range
        </p>
      </div>

      {/* What's included */}
      <div className="space-y-2.5">
        {[
          'Includes material, labor, and tear-off',
          'Based on local contractor pricing in your area',
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

      {/* Urgency banner */}
      {isUrgent && (
        <div className="border-l-4 border-red-500 bg-red-50 px-4 py-3">
          <p className="text-sm font-bold text-red-700">
            Emergency priority — {companyName} will contact you within 2 hours.
          </p>
        </div>
      )}

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
            {isUrgent ? 'Book Emergency Inspection Now' : 'Book a Free Inspection'}
          </a>
          <p className="text-xs text-center text-stone-400">No commitment — free on-site quote</p>
        </div>
      ) : (
        <div className="border-2 border-stone-200 px-5 py-4 space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500">What happens next</p>
          <p className="text-sm text-stone-600 mt-1">
            The team at <span className="font-bold text-stone-800">{companyName}</span> will reach out within{' '}
            <span className={`font-bold ${isUrgent ? 'text-red-600' : 'text-stone-800'}`}>
              {isUrgent ? '2 hours' : '24 hours'}
            </span>{' '}
            to schedule a free on-site inspection and provide a detailed written quote.
          </p>
        </div>
      )}

      <p className="text-xs text-stone-400 text-center">
        Actual pricing may vary based on site conditions. No obligation.
      </p>
    </div>
  )
}
