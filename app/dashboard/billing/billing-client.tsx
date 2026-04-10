'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { PLANS } from '@/lib/stripe'
import { Check } from 'lucide-react'
import type { Subscription } from '@prisma/client'

interface BillingClientProps {
  subscription: Subscription | null
  daysLeftInTrial: number | null
  locationCount: number
}

const STARTER_BULLETS = [
  '50 leads / month',
  '1 service area location',
  'Lead scoring & pipeline',
  'Email notifications + CSV export',
]

const PRO_BULLETS = [
  'Unlimited leads & locations',
  'AI follow-up email & SMS drafts',
  'Weekly AI intelligence report',
  'Floating tab widget + Webhooks',
]

export function BillingClient({ subscription, daysLeftInTrial, locationCount }: BillingClientProps) {
  const { toast } = useToast()
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
    if (data.url) {
      window.location.href = data.url
    } else {
      toast({ title: 'Something went wrong', description: data.error || 'Could not start checkout.', variant: 'destructive' })
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast({ title: 'Something went wrong', description: data.error || 'Could not open billing portal.', variant: 'destructive' })
      setLoading(null)
    }
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const currentPlan = subscription?.plan

  return (
    <div className="space-y-6 max-w-2xl">

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
                Only your <span className="font-bold">first location</span> will be used for routing. Others stay saved but inactive until you upgrade.
              </p>
            </div>
            <div className="px-6 py-4 border-t-2 border-stone-200 flex gap-3 justify-end">
              <button onClick={() => setConfirmStarterDowngrade(false)} className="btn btn-ghost px-4 py-2">
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

      {/* Trial banner */}
      {daysLeftInTrial !== null && (
        <div className={`border-2 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          daysLeftInTrial <= 3 ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50'
        }`}>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${daysLeftInTrial <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
              {daysLeftInTrial <= 3 ? '⚠️ Trial Ending Soon' : 'Free Trial Active'}
            </p>
            <p className="text-sm font-semibold text-stone-700">
              {daysLeftInTrial === 0
                ? 'Your trial expires today. Subscribe to keep access.'
                : `${daysLeftInTrial} day${daysLeftInTrial === 1 ? '' : 's'} left — subscribe before your trial ends to keep all features.`}
            </p>
          </div>
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
                <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border ${
                  subscription?.status === 'active'
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-orange-400 bg-orange-50 text-orange-700'
                }`}>
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
            <div className="flex items-center gap-3 flex-shrink-0">
              {subscription?.stripeCustomerId && (
                <button onClick={handlePortal} disabled={loading === 'portal'} className="btn btn-ghost px-4 py-2">
                  {loading === 'portal' ? 'Loading...' : 'Manage Billing →'}
                </button>
              )}
              {isActive && daysLeftInTrial === null && !confirmCancel && (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors underline underline-offset-2"
                >
                  Cancel
                </button>
              )}
              {confirmCancel && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmCancel(false)} className="text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors">
                    Keep plan
                  </button>
                  {subscription?.stripeCustomerId ? (
                    <button
                      onClick={handlePortal}
                      disabled={loading === 'portal'}
                      className="text-xs font-bold uppercase tracking-wide border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 transition-colors"
                    >
                      {loading === 'portal' ? 'Loading...' : 'Confirm Cancel'}
                    </button>
                  ) : (
                    <a
                      href="mailto:hello@betterroofing.co?subject=Cancel my subscription"
                      className="text-xs font-bold uppercase tracking-wide border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 px-3 py-1.5 transition-colors"
                    >
                      Email to Cancel
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan picker */}
      <div id="plan-picker" className="space-y-3 scroll-mt-8">
        <p className="text-xs font-black uppercase tracking-widest text-stone-500">
          {daysLeftInTrial !== null ? 'Choose Your Plan' : isActive ? 'Change Plan' : 'Choose a Plan'}
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {/* Starter */}
          {(['STARTER', 'PRO'] as const).map((plan) => {
            const isPro = plan === 'PRO'
            const isCurrent = currentPlan === plan && !daysLeftInTrial
            const bullets = isPro ? PRO_BULLETS : STARTER_BULLETS
            const price = isPro ? '$97' : '$49'
            const label = isPro ? 'Pro' : 'Starter'
            const sub = isPro ? 'Growing crew + AI' : 'Solo contractor'
            const ctaLabel = daysLeftInTrial !== null
              ? `Subscribe to ${label} →`
              : isCurrent ? 'Current Plan' : `Switch to ${label} →`

            return (
              <div key={plan} className={`border-2 bg-white flex flex-col ${isPro ? 'border-stone-700' : 'border-stone-300'}`}>
                {isPro && (
                  <div className="h-1" style={{ background: 'repeating-linear-gradient(-45deg, #f97316 0px, #f97316 6px, #1c1917 6px, #1c1917 12px)' }} />
                )}
                <div className={`px-5 py-4 border-b-2 ${isPro ? 'bg-stone-900 border-stone-700' : 'bg-stone-50 border-stone-200'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`font-barlow font-black text-xl uppercase leading-none ${isPro ? 'text-white' : 'text-stone-900'}`}>{label}</p>
                    {isPro && <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 border border-orange-500/50 bg-orange-500/20 px-1.5 py-0.5">Popular</span>}
                  </div>
                  <p className={`text-xs font-semibold ${isPro ? 'text-stone-400' : 'text-stone-500'}`}>{sub}</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className={`font-barlow font-black text-4xl leading-none ${isPro ? 'text-white' : 'text-stone-900'}`}>{price}</span>
                    <span className={`text-sm font-semibold ${isPro ? 'text-stone-400' : 'text-stone-500'}`}>/mo</span>
                  </div>
                </div>
                <div className="px-5 py-4 flex flex-col gap-3 flex-1">
                  <ul className="space-y-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-stone-600 font-medium">
                        <div className={`h-4 w-4 flex-shrink-0 mt-0.5 flex items-center justify-center ${isPro ? 'bg-orange-500' : 'bg-stone-700'}`}>
                          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => !isCurrent && handleCheckout(plan)}
                    disabled={loading === plan || isCurrent}
                    className={`btn w-full py-2.5 mt-auto ${isPro ? 'btn-primary' : 'btn-secondary'} disabled:opacity-50 disabled:cursor-default`}
                  >
                    {loading === plan ? 'Loading...' : ctaLabel}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {daysLeftInTrial !== null && (
          <p className="text-xs text-center text-stone-400 font-semibold">
            No charge today. Subscription starts when your trial ends. Cancel anytime.
          </p>
        )}
      </div>
    </div>
  )
}
