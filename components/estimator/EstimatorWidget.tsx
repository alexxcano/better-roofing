'use client'

import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { StepAddress } from './StepAddress'
import { StepMaterial } from './StepMaterial'
import { StepSquareFootage } from './StepSquareFootage'
import { StepContact } from './StepContact'
import { StepResult } from './StepResult'
import { OutOfAreaScreen } from './OutOfAreaScreen'
import type { ServiceLocation } from '@/lib/serviceArea'
import type { SlopeType } from '@/lib/estimate'

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
 *  1 = intro hero    (no progress bar)
 *  2 = project type  (auto-advance)
 *  3 = insurance     (auto-advance)
 *  4 = urgency       (auto-advance)
 *  5 = material      (auto-advance)
 *  6 = address
 *  7 = homeowner     (auto-advance)
 *  8 = size + slope
 *  9 = contact       (lead gate)
 * 10 = result
 *
 * Progress bar shows on steps 2–9 (8 steps total).
 */
const TOTAL_PROGRESS_STEPS = 8

function JourneyQuestion({
  question,
  subtitle,
  options,
  onSelect,
}: {
  question: string
  subtitle?: string
  options: { value: string; emoji: string; label: string; description?: string }[]
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900 leading-tight">{question}</h2>
        {subtitle && <p className="text-stone-500 text-sm mt-1.5">{subtitle}</p>}
      </div>
      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className="w-full flex items-center gap-4 px-5 py-4 border-2 border-stone-200 hover:border-orange-500 hover:bg-orange-50 text-left transition-all group"
          >
            <span className="text-2xl leading-none flex-shrink-0">{opt.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900 group-hover:text-orange-700">{opt.label}</p>
              {opt.description && (
                <p className="text-sm text-stone-500 mt-0.5">{opt.description}</p>
              )}
            </div>
            <span className="text-stone-300 group-hover:text-orange-500 font-bold text-xl flex-shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

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
  const [data, setData] = useState({
    address: '',
    lat: null as number | null,
    lng: null as number | null,
    outOfArea: false,
    nearestLocationId: null as string | null,
    distanceMiles: 0,
    isHomeowner: 'yes',
    projectType: 'replacement',
    insuranceClaim: 'no',
    urgency: 'soon',
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

  const handleAddressComplete = (d: {
    address: string
    lat: number | null
    lng: number | null
    outOfArea: boolean
    nearestLocationId: string | null
    distanceMiles: number
  }) => {
    setData((prev) => ({ ...prev, ...d }))
    if (d.outOfArea && outOfAreaBehavior === 'GATE') {
      setGated(true)
      return
    }
    setStep(7)
  }

  const handleMaterialComplete = (d: { materialType: string }) => {
    setData((prev) => ({ ...prev, ...d }))
    setStep(6)
  }

  const handleSqftComplete = (d: { sqft: number; slope: SlopeType; squares: number; estimateLow: number; estimateHigh: number }) => {
    setData((prev) => ({ ...prev, ...d, homeSqft: d.sqft }))
    setStep(9)
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
        isHomeowner: data.isHomeowner,
        projectType: data.projectType,
        insuranceClaim: data.insuranceClaim,
        urgency: data.urgency,
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('[Widget] Lead submission failed:', res.status, err)
      }
    } catch (err) {
      console.error('[Widget] Lead submission error:', err)
    }

    setSubmitting(false)
    setStep(10)
  }

  // Map step → progress bar step (steps 2–9 = progress 1–8)
  const progressStep = step >= 2 && step <= 9 ? step - 1 : null
  const showProgress = progressStep !== null && !gated

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Thin progress bar at very top */}
      {showProgress && (
        <ProgressBar currentStep={progressStep!} totalSteps={TOTAL_PROGRESS_STEPS} />
      )}

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-10 pb-10">
        <div className="w-full max-w-md">

          {/* STEP 1 — Intro hero */}
          {step === 1 && (
            <div className="space-y-8">
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
                onClick={() => setStep(2)}
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

          {/* STEPS 2–9 — Journey questions + out-of-area gate */}
          {step >= 2 && step <= 9 && (
            <div className="relative">
              {gated ? (
                <OutOfAreaScreen distanceMiles={data.distanceMiles} />
              ) : (
                <>
                  {data.outOfArea && step > 6 && (
                    <div className="mb-6 border-l-4 border-orange-400 bg-orange-50 px-3 py-2">
                      <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                        Outside service area — we&apos;ll still get you an estimate
                      </span>
                    </div>
                  )}

                  {step === 2 && (
                    <JourneyQuestion
                      question="What type of roofing project is this?"
                      options={[
                        { value: 'replacement', emoji: '🏗️', label: 'Full roof replacement', description: 'Remove old roof and install new' },
                        { value: 'repair', emoji: '🔧', label: 'Repair only', description: 'Fix specific damaged areas' },
                      ]}
                      onSelect={(v) => {
                        setData((prev) => ({ ...prev, projectType: v }))
                        setStep(3)
                      }}
                    />
                  )}

                  {step === 3 && (
                    <JourneyQuestion
                      question="Is this an insurance claim?"
                      subtitle="Helps us prepare the right type of estimate for you"
                      options={[
                        { value: 'yes', emoji: '🌩️', label: 'Yes — storm or hail damage', description: 'Filing or planning to file a claim' },
                        { value: 'no', emoji: '💰', label: 'No — paying out of pocket' },
                        { value: 'unsure', emoji: '🤷', label: "Not sure yet" },
                      ]}
                      onSelect={(v) => {
                        setData((prev) => ({ ...prev, insuranceClaim: v }))
                        setStep(4)
                      }}
                    />
                  )}

                  {step === 4 && (
                    <JourneyQuestion
                      question="How soon do you need this done?"
                      options={[
                        { value: 'emergency', emoji: '🚨', label: 'Emergency — ASAP', description: 'Active leak or storm damage' },
                        { value: 'soon', emoji: '📅', label: 'Within the next 3 months' },
                        { value: 'browsing', emoji: '🔍', label: "Just getting prices for now" },
                      ]}
                      onSelect={(v) => {
                        setData((prev) => ({ ...prev, urgency: v }))
                        setStep(5)
                      }}
                    />
                  )}

                  {step === 5 && (
                    <StepMaterial
                      materialType={data.materialType}
                      enabledMaterials={enabledMaterials}
                      onComplete={handleMaterialComplete}
                    />
                  )}

                  {step === 6 && (
                    <StepAddress
                      address={data.address}
                      lat={data.lat}
                      lng={data.lng}
                      locations={locations}
                      onComplete={handleAddressComplete}
                    />
                  )}

                  {step === 7 && (
                    <JourneyQuestion
                      question="Are you the homeowner?"
                      options={[
                        { value: 'yes', emoji: '🏡', label: 'Yes, I own the home' },
                        { value: 'no', emoji: '🤝', label: 'No, I manage or represent the owner' },
                        { value: 'renter', emoji: '🔑', label: "I'm renting this property" },
                      ]}
                      onSelect={(v) => {
                        setData((prev) => ({ ...prev, isHomeowner: v }))
                        setStep(8)
                      }}
                    />
                  )}

                  {step === 8 && (
                    <StepSquareFootage
                      contractorId={contractorId}
                      sqft={data.sqft}
                      slope={data.slope}
                      lat={data.lat}
                      lng={data.lng}
                      materialType={data.materialType}
                      onComplete={handleSqftComplete}
                    />
                  )}

                  {step === 9 && (
                    <StepContact onComplete={handleContactComplete} />
                  )}

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
                  onClick={() => setStep((s) => s - 1)}
                  className="mt-8 text-xs text-stone-400 hover:text-stone-600 uppercase tracking-widest font-bold transition-colors"
                >
                  ← Back
                </button>
              )}
            </div>
          )}

          {/* STEP 10 — Result */}
          {step === 10 && (
            <StepResult
              estimateLow={data.estimateLow}
              estimateHigh={data.estimateHigh}
              name={data.name}
              companyName={companyName}
              materialType={data.materialType}
              urgency={data.urgency}
              bookingUrl={bookingUrl}
            />
          )}

          <p className="text-center text-xs text-stone-300 mt-10">Powered by BetterRoofing</p>
        </div>
      </div>
    </div>
  )
}
