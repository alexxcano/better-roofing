'use client'

import { useState } from 'react'
import { PlanComparisonTable } from '@/components/shared/PlanComparisonTable'
import { trackEvent } from '@/lib/analytics'

export function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (plan: 'STARTER' | 'PRO') => {
    setLoading(plan)
    trackEvent('cta_click', { location: 'pricing', plan: plan.toLowerCase() })
    window.location.href = '/signup'
  }

  return (
    <section id="pricing" className="py-24 bg-stone-50 bg-corrugated border-b border-stone-200">
      <div className="container max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-10 bg-orange-500" />
            <span className="text-orange-600 text-sm font-black uppercase tracking-widest">Rate Sheet</span>
          </div>
          <h2 className="font-barlow font-black text-5xl md:text-6xl text-stone-900 uppercase leading-none mb-3">
            Straight-Up Pricing.<br />
            <span className="text-orange-500">No Surprises.</span>
          </h2>
          <p className="text-stone-600 text-lg">
            While competitors hide their prices and charge $350+/mo, we put ours right here.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-3 mb-10">
          {['No setup fee', 'Cancel anytime', 'No long-term contract', '14-day free trial'].map((b) => (
            <span key={b} className="text-xs text-stone-600 font-bold border-2 border-stone-300 bg-white px-4 py-2 uppercase tracking-wide">
              ✓ {b}
            </span>
          ))}
        </div>

        {/* Unified plan comparison table */}
        <PlanComparisonTable
          renderCta={(plan) => (
            <button
              onClick={() => handleCheckout(plan)}
              disabled={loading === plan}
              className={`btn w-full py-3 ${plan === 'PRO' ? 'btn-primary' : 'btn-secondary'}`}
            >
              {loading === plan ? 'Loading...' : plan === 'PRO' ? 'Start Free Trial — Full Pro Access' : 'Start Free Trial'}
            </button>
          )}
        />

        <p className="text-center text-sm text-stone-400 font-semibold mt-8">
          Need a custom plan for a large franchise or enterprise?{' '}
          <a href="mailto:hello@betterroofing.co" className="text-orange-600 hover:text-orange-700 underline">
            Contact us
          </a>
        </p>

      </div>
    </section>
  )
}
