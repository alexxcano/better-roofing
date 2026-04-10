'use client'

import Link from 'next/link'
import { ArrowRight, HardHat } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export function FinalCta() {
  return (
    <section className="relative bg-stone-900 bg-asphalt overflow-hidden">
      {/* Hazard stripe top */}
      <div className="h-2 bg-hazard border-b border-orange-600/30" style={{
        background: 'repeating-linear-gradient(-45deg, #ea580c 0px, #ea580c 12px, #1c1917 12px, #1c1917 24px)'
      }} />

      <div className="container max-w-5xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-[1fr_auto] items-center gap-10">

          {/* Copy */}
          <div>
            <div className="flex flex-col gap-2 mb-6">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 px-4 py-2 max-w-fit">
                <HardHat className="h-4 w-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-black uppercase tracking-widest">Every lead you miss is a job your competitor wins</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-stone-800 border border-stone-600 px-4 py-2 max-w-fit">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <span className="text-stone-300 text-sm font-semibold">Contractors in your market are capturing leads right now.</span>
              </div>
            </div>
            <h2 className="font-barlow font-black text-5xl md:text-7xl text-white uppercase leading-none mb-4">
              Your Next 10 Leads<br />
              Are Sitting On<br />
              Your Website<br />
              <span className="text-orange-400">Right Now.</span>
            </h2>
            <p className="text-stone-400 text-lg max-w-md">
              Every night your site goes without this, a homeowner picks someone else — probably a contractor already running BetterRoofing in your area.
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Link href="/signup" className="btn btn-primary px-10 py-5 text-base" onClick={() => trackEvent('cta_click', { location: 'final_cta' })}>
              Start Capturing Leads Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="mt-5 space-y-1.5">
              {['Live in 5 minutes', '14-day free trial', 'No credit card required', 'Cancel anytime'].map((t) => (
                <p key={t} className="text-xs text-stone-500 font-semibold uppercase tracking-widest">✓ {t}</p>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Hazard stripe bottom */}
      <div className="h-2" style={{
        background: 'repeating-linear-gradient(-45deg, #ea580c 0px, #ea580c 12px, #1c1917 12px, #1c1917 24px)'
      }} />
    </section>
  )
}
