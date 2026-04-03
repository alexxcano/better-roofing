'use client'

import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { StepAddress } from './StepAddress'
import { StepMaterial } from './StepMaterial'
import { StepSquareFootage } from './StepSquareFootage'
import { StepContact } from './StepContact'
import { StepResult } from './StepResult'
import { OutOfAreaScreen } from './OutOfAreaScreen'
import { CinemaOverlay } from './CinemaOverlay'
import type { ServiceLocation } from '@/lib/serviceArea'
import type { SlopeType } from '@/lib/estimate'
import { trackEvent } from '@/lib/analytics'

interface EstimatorWidgetProps {
  contractorId: string
  companyName: string
  totalLeads: number
  bookingUrl: string | null
  locations: ServiceLocation[]
  outOfAreaBehavior: 'GATE' | 'FLAG'
  enabledMaterials: string[]
}

/**
 * Step map:
 *  1 = intro hero      (no progress bar)
 *  2 = address         (cinema transition on complete)
 *  3 = insurance       (auto-advance, 2 options)
 *  4 = material        (auto-advance)
 *  5 = size + slope    (auto-advance — invisible to user when solarMeasured)
 *  6 = contact         (lead gate)
 *  7 = result
 *
 * User sees 4 visible steps: address, insurance, material, contact.
 * Progress bar shows on steps 2–6.
 */
const TOTAL_PROGRESS_STEPS = 4

export function EstimatorWidget({
  contractorId,
  companyName,
  totalLeads,
  bookingUrl,
  locations,
  outOfAreaBehavior,
  enabledMaterials,
}: EstimatorWidgetProps) {
  const [step, setStep] = useState(1)
  const [gated, setGated] = useState(false)
  const [showCinema, setShowCinema] = useState(false)
  const [data, setData] = useState({
    address: '',
    lat: null as number | null,
    lng: null as number | null,
    outOfArea: false,
    nearestLocationId: null as string | null,
    distanceMiles: 0,
    footprintSqft: null as number | null,
    detectedSlope: null as SlopeType | null,
    solarMeasured: false,
    insuranceClaim: 'no',
    materialType: 'asphalt',
    slope: 'medium' as SlopeType,
    sqft: null as number | null,
    homeSqft: null as number | null,
    squares: 0,
    estimateLow: 0,
    estimateHigh: 0,
    leadScore: 5,
    name: '',
    email: '',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const goForward = (n: number) => { setDirection('forward'); setStep(n) }
  const goBack = () => {
    setDirection('back')
    setStep((s) => s === 6 ? 4 : s - 1)
  }

  const handleAddressComplete = (d: {
    address: string
    lat: number | null
    lng: number | null
    outOfArea: boolean
    nearestLocationId: string | null
    distanceMiles: number
    footprintSqft: number | null
    slope: string | null
    solarMeasured: boolean
  }) => {
    const { slope: _slope, ...rest } = d
    setData((prev) => ({
      ...prev,
      ...rest,
      detectedSlope: (_slope as SlopeType | null) ?? null,
      solarMeasured: d.solarMeasured ?? false,
    }))
    if (d.outOfArea && outOfAreaBehavior === 'GATE') {
      setGated(true)
      trackEvent('estimator_out_of_area')
      return
    }
    trackEvent('estimator_step', { step: 'address' })
    setShowCinema(true)
  }

  const handleCinemaComplete = () => {
    setShowCinema(false)
    goForward(3)
  }

  const handleMaterialComplete = async (d: { materialType: string }) => {
    setData((prev) => ({ ...prev, ...d }))
    trackEvent('estimator_step', { step: 'material', value: d.materialType })

    // Helper: call estimate API and jump to step 6 if successful
    const calcAndAdvance = async (sqft: number, slope: SlopeType, isSolar: boolean) => {
      try {
        const res = await fetch('/api/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractorId, homeSqft: sqft, materialType: d.materialType, slope, solarMeasured: isSolar }),
        })
        if (res.ok) {
          const est = await res.json()
          setData((prev) => ({ ...prev, sqft, slope, homeSqft: sqft, squares: est.squares, estimateLow: est.estimateLow, estimateHigh: est.estimateHigh }))
          goForward(6)
          return true
        }
      } catch {}
      return false
    }

    // Solar measured all dimensions — skip step 5
    if (data.solarMeasured && data.footprintSqft && data.detectedSlope) {
      const ok = await calcAndAdvance(data.footprintSqft, data.detectedSlope as SlopeType, true)
      if (ok) return
    }

    // User already completed step 5 (changed material going back) — recalculate
    if (data.sqft && data.slope) {
      const ok = await calcAndAdvance(data.sqft, data.slope, false)
      if (ok) return
    }

    // First-time — needs step 5 (bedroom picker or slope selection)
    goForward(5)
  }

  const handleSqftComplete = (d: { sqft: number; slope: SlopeType; squares: number; estimateLow: number; estimateHigh: number }) => {
    setData((prev) => ({ ...prev, ...d, homeSqft: d.sqft }))
    goForward(6)
  }

  const handleContactComplete = async (contactData: { name: string; email: string; phone: string }) => {
    setData((prev) => ({ ...prev, ...contactData }))
    setSubmitting(true)

    try {
      const payload = {
        contractorId,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || null,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        insuranceClaim: data.insuranceClaim,
        materialType: data.materialType,
        homeSqft: data.homeSqft ?? undefined,
        roofSlope: data.slope,
        roofSquares: data.squares,
        estimateLow: data.estimateLow,
        estimateHigh: data.estimateHigh,
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        trackEvent('generate_lead', {
          material: data.materialType,
          insurance_claim: data.insuranceClaim,
          contractor_id: contractorId,
        })
      } else {
        const err = await res.json().catch(() => ({}))
        console.error('[Widget] Lead submission failed:', res.status, err)
      }
    } catch (err) {
      console.error('[Widget] Lead submission error:', err)
    }

    setSubmitting(false)
    goForward(7)
  }

  // Map step → progress bar (4 visible steps: address=1, insurance=2, material=3, contact=4)
  // Step 5 (size/slope) is invisible — maps to same progress as step 4
  const progressMap: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 3, 6: 4 }
  const progressStep = progressMap[step] ?? null
  const showProgress = progressStep !== null && !gated

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Cinema overlay */}
      {showCinema && data.lat && data.lng && (
        <CinemaOverlay
          lat={data.lat}
          lng={data.lng}
          address={data.address}
          sqft={data.footprintSqft}
          slope={data.detectedSlope}
          onComplete={handleCinemaComplete}
        />
      )}

      {/* Thin progress bar at very top */}
      {showProgress && (
        <ProgressBar currentStep={progressStep!} totalSteps={TOTAL_PROGRESS_STEPS} />
      )}

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-10 pb-10">
        <div className="w-full max-w-md">

          {/* STEP 1 — Intro hero */}
          {step === 1 && (
            <div className="space-y-8 animate-step-in">
              {/* Headline block */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">{companyName}</p>
                <h1 className="text-4xl font-black text-stone-900 leading-[1.1] tracking-tight">
                  Find out what your roof replacement really costs
                </h1>
                <p className="text-stone-500 mt-3 text-base leading-relaxed">
                  Answer a few quick questions. Get an instant estimate — no sales calls, no obligation.
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => { trackEvent('estimator_start'); goForward(2) }}
                className="btn btn-primary w-full py-4 text-base font-black uppercase tracking-widest"
              >
                Get My Free Estimate →
              </button>

              {/* Trust bar */}
              <div className="flex items-center justify-center gap-5 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-green-500 font-bold text-sm">✓</span>
                  <span className="text-xs text-stone-400 font-semibold">No credit card</span>
                </div>
                <div className="w-px h-3 bg-stone-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-green-500 font-bold text-sm">✓</span>
                  <span className="text-xs text-stone-400 font-semibold">60 seconds</span>
                </div>
                <div className="w-px h-3 bg-stone-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-green-500 font-bold text-sm">✓</span>
                  <span className="text-xs text-stone-400 font-semibold">Instant result</span>
                </div>
              </div>

              {/* Social proof — only show once meaningful */}
              {totalLeads >= 50 && (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-yellow-400 text-sm tracking-tight">★★★★★</span>
                  <span className="text-xs text-stone-500">{totalLeads.toLocaleString()}+ homeowners got their estimate</span>
                </div>
              )}
            </div>
          )}

          {/* STEPS 2–6 — Journey + out-of-area gate */}
          {step >= 2 && step <= 6 && (
            <div className="relative">
              {gated ? (
                <OutOfAreaScreen distanceMiles={data.distanceMiles} />
              ) : (
                <>
                  <div key={step} className={direction === 'forward' ? 'animate-step-in' : 'animate-step-in-back'}>
                  {data.outOfArea && step > 2 && (
                    <div className="mb-6 border-l-4 border-orange-400 bg-orange-50 px-3 py-2">
                      <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                        Outside service area — we&apos;ll still get you an estimate
                      </span>
                    </div>
                  )}

                  {step === 2 && (
                    <StepAddress
                      contractorId={contractorId}
                      address={data.address}
                      lat={data.lat}
                      lng={data.lng}
                      locations={locations}
                      onComplete={handleAddressComplete}
                    />
                  )}

                  {step === 3 && (
                    <div>
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-stone-900 leading-tight">Is this an insurance claim?</h2>
                        <p className="text-stone-500 text-sm mt-1.5">Helps us prepare the right type of estimate for you</p>
                      </div>
                      <div className="space-y-3">
                        {[
                          { value: 'yes',    emoji: '🌩️', label: 'Yes — storm or hail damage',  description: 'Filing or planning to file a claim' },
                          { value: 'no',     emoji: '💰', label: 'No — paying out of pocket',    description: undefined },
                          { value: 'unsure', emoji: '🤷', label: "Not sure yet",                 description: undefined },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setData((prev) => ({ ...prev, insuranceClaim: opt.value }))
                              trackEvent('estimator_step', { step: 'insurance', value: opt.value })
                              goForward(4)
                            }}
                            className="w-full flex items-center gap-4 px-5 py-4 border-2 border-stone-200 hover:border-orange-500 hover:bg-orange-50 text-left transition-all group"
                          >
                            <span className="text-2xl leading-none flex-shrink-0">{opt.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-stone-900 group-hover:text-orange-700">{opt.label}</p>
                              {opt.description && <p className="text-sm text-stone-500 mt-0.5">{opt.description}</p>}
                            </div>
                            <span className="text-stone-300 group-hover:text-orange-500 font-bold text-xl flex-shrink-0">›</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <StepMaterial
                      materialType={data.materialType}
                      enabledMaterials={enabledMaterials}
                      onComplete={handleMaterialComplete}
                    />
                  )}

                  {step === 5 && (
                    <StepSquareFootage
                      contractorId={contractorId}
                      sqft={data.sqft}
                      slope={data.slope}
                      lat={data.lat}
                      lng={data.lng}
                      materialType={data.materialType}
                      footprintSqft={data.footprintSqft}
                      detectedSlope={data.detectedSlope}
                      solarMeasured={data.solarMeasured}
                      onComplete={handleSqftComplete}
                    />
                  )}

                  {step === 6 && (
                    <StepContact onComplete={handleContactComplete} />
                  )}
                  </div>

                  {submitting && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <p className="text-stone-500 font-semibold">Calculating your estimate...</p>
                    </div>
                  )}
                </>
              )}

              {/* Back */}
              {!gated && (
                <button
                  onClick={goBack}
                  className="mt-8 text-xs text-stone-400 hover:text-stone-600 uppercase tracking-widest font-bold transition-colors"
                >
                  ← Back
                </button>
              )}
            </div>
          )}

          {/* STEP 7 — Result */}
          {step === 7 && (
            <div className="animate-step-in">
              <StepResult
                estimateLow={data.estimateLow}
                estimateHigh={data.estimateHigh}
                name={data.name}
                companyName={companyName}
                materialType={data.materialType}
                bookingUrl={bookingUrl}
                address={data.address}
                squares={data.squares}
                insuranceClaim={data.insuranceClaim}
              />
            </div>
          )}

          <p className="text-center text-xs text-stone-300 mt-10">Powered by BetterRoofing</p>
        </div>
      </div>
    </div>
  )
}
