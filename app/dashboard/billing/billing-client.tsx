'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/stripe'
import { PlanComparisonTable } from '@/components/shared/PlanComparisonTable'
import type { Subscription } from '@prisma/client'

interface BillingClientProps {
  subscription: Subscription | null
  daysLeftInTrial: number | null
  locationCount: number
}

export function BillingClient({ subscription, daysLeftInTrial, locationCount }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmStarterDowngrade, setConfirmStarterDowngrade] = useState(false)

  const handleCheckout = async (plan: 'STARTER' | 'PRO') => {
    if (plan === 'STARTER' && locationCount > 1) {
      setConfirmStarterDowngrade(true)
      return
    }
    await doCheckout(plan)
  }

  const doCheckout = async (plan: 'STARTER' | 'PRO') => {
    setLoading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  const handlePortal = async () => {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const currentPlan = subscription?.plan

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Starter downgrade warning modal */}
      {confirmStarterDowngrade && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-stone-300 shadow-[6px_6px_0px_0px_#1c1917] max-w-md w-full">
            <div className="px-6 py-4 bg-stone-900 border-b-2 border-stone-700">
              <p className="font-barlow font-black text-lg uppercase text-white leading-none">Heads up</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-stone-700 font-semibold">
                You currently have <span className="text-stone-900 font-black">{locationCount} locations</span> configured. The Starter plan only supports <span className="text-stone-900 font-black">1 location</span>.
              </p>
              <p className="text-sm text-stone-600">
                If you subscribe to Starter, only your <span className="font-bold">first location</span> will be used for service area routing. Your other locations will remain saved but inactive.
              </p>
              <p className="text-sm text-orange-700 font-bold border-l-2 border-orange-500 pl-3">
                Upgrade to Pro anytime to reactivate all locations.
              </p>
            </div>
            <div className="px-6 py-4 border-t-2 border-stone-200 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmStarterDowngrade(false)}
                className="btn btn-ghost px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmStarterDowngrade(false); doCheckout('STARTER') }}
                disabled={loading === 'STARTER'}
                className="btn btn-secondary px-4 py-2"
              >
                {loading === 'STARTER' ? 'Loading...' : 'Continue with Starter'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Page header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Billing</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">Manage your subscription and billing details</p>
      </div>

      {/* Trial banner — only shown when no card on file yet */}
      {daysLeftInTrial !== null && (
        <div className={`border-2 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          daysLeftInTrial <= 3
            ? 'border-red-400 bg-red-50'
            : 'border-orange-400 bg-orange-50'
        }`}>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${daysLeftInTrial <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
              {daysLeftInTrial <= 3 ? '⚠️ Trial Ending Soon' : 'Free Trial Active'}
            </p>
            <p className="text-sm font-semibold text-stone-700">
              {daysLeftInTrial === 0
                ? 'Your trial expires today. Subscribe to keep access to all features.'
                : `You have ${daysLeftInTrial} day${daysLeftInTrial === 1 ? '' : 's'} left of full Pro access. Subscribe before your trial ends to keep all features.`}
            </p>
          </div>
          <button
            onClick={() => document.getElementById('plan-picker')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn btn-primary px-6 py-2.5 flex-shrink-0"
          >
            Choose a Plan →
          </button>
        </div>
      )}

      {/* Current plan status */}
      {isActive && (
        <div className="border-2 border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Current Plan</p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-barlow font-black text-2xl uppercase text-stone-900">
                {currentPlan ? PLANS[currentPlan].name : 'Free Trial'}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span
                  className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${
                    subscription?.status === 'active'
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-orange-400 bg-orange-50 text-orange-700'
                  }`}
                >
                  {subscription?.status}
                </span>
                {subscription?.currentPeriodEnd && (
                  <span className="text-sm text-stone-500 font-semibold">
                    {subscription.status === 'active' ? 'Renews' : 'Trial ends'}{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            {subscription?.stripeCustomerId && (
              <button
                onClick={handlePortal}
                disabled={loading === 'portal'}
                className="btn btn-ghost px-4 py-2 flex-shrink-0"
              >
                {loading === 'portal' ? 'Loading...' : 'Manage Billing →'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cancel plan */}
      {isActive && daysLeftInTrial === null && (
        <div className="border-2 border-stone-200 bg-white">
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
            <p className="text-xs font-black uppercase tracking-widest text-stone-500">Cancel Subscription</p>
          </div>
          <div className="px-5 py-4">
            {!confirmCancel ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-stone-500">
                  You can cancel anytime. Your plan stays active until the end of your current billing period.
                </p>
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs font-bold uppercase tracking-wide border-2 border-stone-300 text-stone-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 transition-colors flex-shrink-0"
                >
                  Cancel Plan
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-stone-700">
                  Are you sure? You'll lose access to AI features and leads at the end of your billing period.
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="text-xs font-bold uppercase tracking-wide border-2 border-stone-300 bg-white text-stone-600 hover:border-stone-400 px-4 py-2 transition-colors"
                  >
                    Keep Plan
                  </button>
                  {subscription?.stripeCustomerId ? (
                    <button
                      onClick={handlePortal}
                      disabled={loading === 'portal'}
                      className="text-xs font-bold uppercase tracking-wide border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-colors"
                    >
                      {loading === 'portal' ? 'Loading...' : 'Yes, Cancel'}
                    </button>
                  ) : (
                    <a
                      href="mailto:hello@betterroofing.co?subject=Cancel my subscription"
                      className="text-xs font-bold uppercase tracking-wide border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 px-4 py-2 transition-colors"
                    >
                      Email Us to Cancel
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan comparison table with inline CTAs */}
      <div id="plan-picker" className="space-y-3 scroll-mt-8">
        <p className="text-xs font-black uppercase tracking-widest text-stone-500">
          {daysLeftInTrial !== null ? 'Choose Your Plan' : isActive ? 'Change Plan' : 'Choose a Plan'}
        </p>
        <PlanComparisonTable
          renderCta={(plan) => {
            const isCurrent = currentPlan === plan && !daysLeftInTrial
            const isPro = plan === 'PRO'
            const ctaLabel = daysLeftInTrial !== null
              ? `Subscribe to ${plan === 'PRO' ? 'Pro' : 'Starter'} →`
              : isCurrent ? 'Current Plan' : 'Subscribe'
            return (
              <button
                onClick={() => !isCurrent && handleCheckout(plan)}
                disabled={loading === plan || isCurrent}
                className={`btn w-full py-3 ${isPro ? 'btn-primary' : 'btn-secondary'}`}
              >
                {loading === plan ? 'Loading...' : ctaLabel}
              </button>
            )
          }}
        />
        {daysLeftInTrial !== null && (
          <p className="text-xs text-center text-stone-400 font-semibold">
            No charge today. Your subscription starts when your trial ends. Cancel anytime.
          </p>
        )}
      </div>
    </div>
  )
}
