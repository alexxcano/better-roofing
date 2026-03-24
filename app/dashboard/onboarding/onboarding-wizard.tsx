'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, MapPin, DollarSign, Globe, Mail, ChevronDown, Copy } from 'lucide-react'
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete'

interface OnboardingWizardProps {
  contractorId: string
  companyName: string
  userName: string
}

type Step = 0 | 1 | 2 | 3 | 4

const STEPS = [
  { num: 1, label: 'Pricing' },
  { num: 2, label: 'Service Area' },
  { num: 3, label: 'Go Live' },
]

const inputClass =
  'w-full border-2 border-stone-300 bg-white text-stone-900 font-medium focus:outline-none focus:border-orange-500 placeholder:text-stone-400'

export function OnboardingWizard({ contractorId, companyName, userName }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [saving, setSaving] = useState(false)

  // Step 1: Pricing
  const [pricePerSquare, setPricePerSquare] = useState('425')

  // Step 2: Service Area
  const [locationAddress, setLocationAddress] = useState('')
  const [locationGeo, setLocationGeo] = useState<{ address: string; lat: number; lng: number } | null>(null)
  const [serviceRadius, setServiceRadius] = useState('50')

  // Step 3: Go Live
  const [notificationEmail, setNotificationEmail] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://betterroofing.co'
  const scriptTag = `<script src="${appUrl}/widget.js" data-contractor-id="${contractorId}" async></script>`
  const emailMailto = `mailto:?subject=${encodeURIComponent('Please add a quote widget to our website')}&body=${encodeURIComponent(
    `Hi,\n\nCan you add an instant roofing estimator to our website? It lets visitors get a quote on their own.\n\nJust paste this snippet before the closing </body> tag:\n\n${scriptTag}\n\nThat's all it takes. Thanks!`
  )}`

  // ── Handlers ──────────────────────────────────────────────────────────────

  const savePricing = async () => {
    const price = parseFloat(pricePerSquare) || 425
    await fetch('/api/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pricePerSquare: price,
        pricePerSquareAsphalt: price,
        pricePerSquareMetal: Math.round(price * 1.75),
        pricePerSquareTile: Math.round(price * 1.5),
        pricePerSquareFlat: Math.round(price * 1.2),
        wasteFactor: 1.12,
        tearOffCost: 1000,
        offersAsphalt: true,
        offersMetal: true,
        offersTile: true,
        offersFlat: false,
      }),
    })
  }

  const saveLocation = async () => {
    if (!locationGeo) return
    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Main Location',
        address: locationGeo.address,
        lat: locationGeo.lat,
        lng: locationGeo.lng,
        serviceRadiusMiles: parseFloat(serviceRadius),
      }),
    })
  }

  const completeOnboarding = async () => {
    setSaving(true)
    await fetch('/api/contractor/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(notificationEmail ? { notificationEmail } : {}),
        onboardingCompleted: true,
      }),
    })
    setSaving(false)
    setStep(4)
  }

  const handleStep1Next = async (skip = false) => {
    setSaving(true)
    if (!skip) await savePricing()
    setSaving(false)
    setStep(2)
  }

  const handleStep2Next = async (skip = false) => {
    setSaving(true)
    if (!skip && locationGeo) await saveLocation()
    setSaving(false)
    setStep(3)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(scriptTag)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // ── Shared layout pieces ───────────────────────────────────────────────────

  const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => {
        const done = current > s.num
        const active = current === s.num
        return (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`h-8 w-8 flex items-center justify-center border-2 text-xs font-black transition-colors ${
                  done
                    ? 'bg-green-500 border-green-500 text-white'
                    : active
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-stone-300 text-stone-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : s.num}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${
                  done ? 'text-green-600' : active ? 'text-orange-600' : 'text-stone-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${current > s.num ? 'bg-green-400' : 'bg-stone-200'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  // ── Step 0: Welcome ────────────────────────────────────────────────────────
  if (step === 0) {
    const firstName = userName.split(' ')[0] || 'there'
    return (
      <div className="max-w-lg mx-auto">
        <div className="border-2 border-stone-300 bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1c1917]">
          {/* Orange top accent */}
          <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-600" />

          <div className="px-8 py-10 text-center">
            {/* Greeting */}
            <div className="inline-flex items-center justify-center h-16 w-16 bg-orange-100 border-2 border-orange-300 mb-6">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none mb-2">
              Welcome, {firstName}!
            </h1>
            <p className="text-stone-500 font-semibold text-sm mb-8">
              Let&apos;s get <span className="text-stone-800 font-bold">{companyName}</span> set up to capture roofing leads from your website — takes about 2 minutes.
            </p>

            {/* What you'll set up */}
            <div className="border-2 border-stone-200 bg-stone-50 p-5 mb-8 text-left space-y-3">
              {[
                { icon: DollarSign, text: 'Set your pricing so estimates are accurate' },
                { icon: MapPin, text: 'Define your service area to filter out bad leads' },
                { icon: Globe, text: 'Add the widget to your website to start capturing leads' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-7 w-7 bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-stone-700">{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="btn btn-primary w-full py-3.5 text-sm"
            >
              Let&apos;s get started →
            </button>
            <p className="text-xs text-stone-400 font-semibold mt-3 uppercase tracking-wide">3 steps · about 2 minutes</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 4: Done ───────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="border-2 border-green-400 bg-white overflow-hidden shadow-[4px_4px_0px_0px_#16a34a]">
          <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-600" />

          <div className="px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-green-100 border-2 border-green-400 mb-6">
              <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
            </div>
            <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none mb-2">
              You&apos;re all set!
            </h1>
            <p className="text-stone-500 font-semibold text-sm mb-8">
              Your quote widget is ready. Once it&apos;s on your site, leads will start showing up right here in your dashboard.
            </p>

            {/* What happens next */}
            <div className="border-2 border-stone-200 bg-stone-50 p-5 mb-8 text-left space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">What happens next</p>
              {[
                'A homeowner visits your site and fills out the widget',
                'They get an instant estimate — you get their contact info',
                'AI writes your follow-up email and SMS, ready to send',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 bg-stone-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-barlow font-black text-white text-[10px] leading-none">{i + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-700 leading-snug">{item}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-primary w-full py-3.5 text-sm"
            >
              Go to my dashboard →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Steps 1–3: Wizard ──────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto">
      <StepIndicator current={step} />

      <div className="border-2 border-stone-300 bg-white overflow-hidden shadow-[4px_4px_0px_0px_#1c1917]">

        {/* ── Step 1: Pricing ── */}
        {step === 1 && (
          <>
            <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-barlow font-black text-lg uppercase text-white leading-none">Set Your Pricing</p>
                <p className="text-stone-400 text-xs font-semibold mt-0.5">Step 1 of 3 — takes 30 seconds</p>
              </div>
              <div className="h-10 w-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-stone-600 text-sm font-semibold leading-relaxed mb-6">
                What do you charge to replace an asphalt shingle roof? Enter your price per square (100 sq ft). This is what homeowners will see as their estimate.
              </p>

              <div className="space-y-1.5 mb-2">
                <label className="block text-xs font-black uppercase tracking-widest text-stone-600">
                  Price per Square — Asphalt Shingles
                </label>
                <div className="flex items-center border-2 border-stone-300 bg-white focus-within:border-orange-500 transition-colors">
                  <span className="px-3 py-3 text-stone-500 font-black text-lg border-r-2 border-stone-300 bg-stone-50">$</span>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="5"
                    value={pricePerSquare}
                    onChange={(e) => setPricePerSquare(e.target.value)}
                    className="flex-1 px-3 py-3 text-lg font-bold text-stone-900 focus:outline-none bg-white"
                    placeholder="425"
                  />
                  <span className="px-3 py-3 text-stone-400 text-sm font-semibold border-l-2 border-stone-300 bg-stone-50 whitespace-nowrap">per square</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 font-semibold">
                Most roofers charge between $350–$600. Metal, tile, and flat pricing can be adjusted in Settings.
              </p>
            </div>

            <div className="px-6 py-4 border-t-2 border-stone-100 flex items-center justify-between gap-4">
              <button
                onClick={() => handleStep1Next(true)}
                className="text-xs text-stone-400 hover:text-stone-600 font-bold uppercase tracking-wide transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => handleStep1Next(false)}
                disabled={saving}
                className="btn btn-primary px-6 py-2.5"
              >
                {saving ? 'Saving...' : 'Looks good, next →'}
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Service Area ── */}
        {step === 2 && (
          <>
            <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-barlow font-black text-lg uppercase text-white leading-none">Set Your Service Area</p>
                <p className="text-stone-400 text-xs font-semibold mt-0.5">Step 2 of 3 — takes 30 seconds</p>
              </div>
              <div className="h-10 w-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-stone-600 text-sm font-semibold leading-relaxed mb-6">
                Where do you work? We&apos;ll automatically flag leads that come in from outside your area — so you only spend time on jobs you can actually take.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-600">Your Business Address</label>
                  <AddressAutocomplete
                    value={locationAddress}
                    onChange={setLocationAddress}
                    onSelect={(data) => { setLocationAddress(data.address); setLocationGeo(data) }}
                    placeholder="123 Main St, Austin, TX"
                    className={`${inputClass} px-3 py-2.5 text-sm`}
                    contractorId={contractorId}
                  />
                  <p className="text-xs text-stone-400 font-semibold">Use your shop address or the center of your service area.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-600">How Far Do You Travel?</label>
                  <div className="relative">
                    <select
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(e.target.value)}
                      className={`${inputClass} px-3 py-2.5 text-sm appearance-none pr-10`}
                    >
                      {[15, 25, 50, 75, 100].map((r) => (
                        <option key={r} value={r}>{r} miles from your address</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t-2 border-stone-100 flex items-center justify-between gap-4">
              <button
                onClick={() => handleStep2Next(true)}
                className="text-xs text-stone-400 hover:text-stone-600 font-bold uppercase tracking-wide transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => handleStep2Next(false)}
                disabled={saving}
                className="btn btn-primary px-6 py-2.5"
              >
                {saving ? 'Saving...' : 'Looks good, next →'}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Go Live ── */}
        {step === 3 && (
          <>
            <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-barlow font-black text-lg uppercase text-white leading-none">Add to Your Website</p>
                <p className="text-stone-400 text-xs font-semibold mt-0.5">Step 3 of 3 — almost done!</p>
              </div>
              <div className="h-10 w-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Install options */}
              <div>
                <p className="text-stone-600 text-sm font-semibold leading-relaxed mb-4">
                  The widget is a small piece of code that goes on your website. The easiest way is to email your web developer — most contractors do this.
                </p>

                {/* Primary: Email developer */}
                <a
                  href={emailMailto}
                  className="flex items-center gap-3 w-full border-2 border-orange-500 bg-orange-50 hover:bg-orange-100 px-4 py-4 transition-colors group mb-3"
                >
                  <div className="h-10 w-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-sm uppercase tracking-wide text-stone-900">Email My Developer</p>
                    <p className="text-xs text-stone-500 font-semibold mt-0.5">We&apos;ll write the email for you — just hit send</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wide bg-orange-500 text-white px-2 py-0.5 flex-shrink-0">Recommended</span>
                </a>

                {/* Secondary: Show code */}
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-2 w-full border-2 border-stone-300 bg-stone-50 hover:bg-stone-100 px-4 py-3 transition-colors text-left"
                >
                  <Globe className="h-4 w-4 text-stone-500" />
                  <span className="text-xs font-black uppercase tracking-wide text-stone-600 flex-1">
                    I&apos;ll install it myself
                  </span>
                  <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${showCode ? 'rotate-180' : ''}`} />
                </button>

                {showCode && (
                  <div className="mt-2 border-2 border-stone-200">
                    <pre className="bg-stone-950 text-stone-100 px-4 py-3 text-xs overflow-x-auto leading-relaxed font-mono">
                      {scriptTag}
                    </pre>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-2 w-full px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border-t-2 border-stone-200 transition-colors"
                    >
                      {codeCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-stone-500" />}
                      <span className="text-xs font-black uppercase tracking-wide text-stone-600">
                        {codeCopied ? 'Copied!' : 'Copy Code'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notification email */}
              <div className="border-t-2 border-stone-100 pt-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-600">
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      Get Emailed When a Lead Comes In
                    </span>
                  </label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="you@yourcompany.com"
                    className={`${inputClass} px-3 py-2.5 text-sm`}
                  />
                  <p className="text-xs text-stone-400 font-semibold">
                    You&apos;ll get an email the moment a homeowner requests a quote. No email = no alerts.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t-2 border-stone-100 flex items-center justify-between gap-4">
              <button
                onClick={() => completeOnboarding()}
                disabled={saving}
                className="text-xs text-stone-400 hover:text-stone-600 font-bold uppercase tracking-wide transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => completeOnboarding()}
                disabled={saving}
                className="btn btn-primary px-6 py-2.5"
              >
                {saving ? 'Finishing...' : "Finish setup →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
