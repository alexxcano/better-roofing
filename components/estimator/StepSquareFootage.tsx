'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SatelliteMap } from '@/components/shared/SatelliteMap'
import type { SlopeType } from '@/lib/estimate'

interface StepSquareFootageProps {
  contractorId: string
  sqft: number | null
  slope: SlopeType
  lat: number | null
  lng: number | null
  materialType: string
  footprintSqft: number | null
  detectedSlope: SlopeType | null
  solarMeasured: boolean
  onComplete: (data: { sqft: number; slope: SlopeType; squares: number; estimateLow: number; estimateHigh: number }) => void
}

const BEDROOM_OPTIONS = [
  { label: 'Studio / 1 bed', sublabel: 'Condo or small home', sqft: 850 },
  { label: '2 bedrooms',     sublabel: '~1,200 sq ft',         sqft: 1200 },
  { label: '3 bedrooms',     sublabel: '~1,650 sq ft',         sqft: 1650 },
  { label: '4 bedrooms',     sublabel: '~2,250 sq ft',         sqft: 2250 },
  { label: '5+ bedrooms',    sublabel: 'Large home / 3,000+',  sqft: 3000 },
]

const SLOPES: { value: SlopeType; label: string; pitch: string; visual: string }[] = [
  { value: 'flat',   label: 'Flat',   pitch: '0–2/12', visual: '▱' },
  { value: 'low',    label: 'Low',    pitch: '3–5/12', visual: '◿' },
  { value: 'medium', label: 'Medium', pitch: '6–8/12', visual: '◸' },
  { value: 'steep',  label: 'Steep',  pitch: '9/12+',  visual: '△' },
]

export function StepSquareFootage({
  contractorId,
  sqft: initialSqft,
  slope: initialSlope,
  lat,
  lng,
  materialType,
  footprintSqft: initialFootprintSqft,
  detectedSlope,
  solarMeasured,
  onComplete,
}: StepSquareFootageProps) {
  const isFlatMaterial = materialType === 'flat'

  // If footprint wasn't ready when address was submitted, fetch it now
  const [footprintSqft, setFootprintSqft] = useState<number | null>(initialFootprintSqft)
  const [fetchingFootprint, setFetchingFootprint] = useState(!initialFootprintSqft && !!lat && !!lng && !solarMeasured)

  // When solarMeasured, initialize slope from detectedSlope
  const [selectedSqft, setSelectedSqft] = useState<number | null>(initialSqft ?? null)
  const [slope, setSlope] = useState<SlopeType | null>(
    isFlatMaterial ? 'flat' : solarMeasured ? (detectedSlope ?? 'medium') : null
  )
  const [exactInput, setExactInput] = useState(initialFootprintSqft?.toString() ?? initialSqft?.toString() ?? '')
  const [exactMode, setExactMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch footprint on mount if not already available (and not solar-measured)
  useEffect(() => {
    if (solarMeasured || initialFootprintSqft || !lat || !lng) return
    setFetchingFootprint(true)
    fetch(`/api/building-footprint?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => {
        const sqft = d.sqft ?? null
        setFootprintSqft(sqft)
        if (sqft) setExactInput(sqft.toString())
      })
      .catch(() => {})
      .finally(() => setFetchingFootprint(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resolvedSqft = footprintSqft
    ? (parseFloat(exactInput) || footprintSqft)
    : exactMode
      ? (parseFloat(exactInput) || null)
      : selectedSqft

  const canSubmit = !!resolvedSqft && !!slope && !loading && !fetchingFootprint

  // Auto-submit when solarMeasured — both sqft and slope are already known
  useEffect(() => {
    if (solarMeasured && initialFootprintSqft && slope) {
      submit(initialFootprintSqft, slope)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solarMeasured, initialFootprintSqft])

  // Auto-submit for bedroom-tap flow (no footprint)
  useEffect(() => {
    if (solarMeasured) return
    if (!footprintSqft && !exactMode && resolvedSqft && slope) {
      submit(resolvedSqft, slope)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSqft, slope])

  // Auto-submit for footprint flow — triggers when slope is selected
  useEffect(() => {
    if (solarMeasured) return
    if (footprintSqft && slope && !loading && !fetchingFootprint) {
      const sqft = parseFloat(exactInput) || footprintSqft
      submit(sqft, slope)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slope, footprintSqft])

  const submit = async (sqft: number, sl: SlopeType) => {
    if (sqft < 100 || sqft > 50000) { setError('Please enter a valid square footage.'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractorId, homeSqft: sqft, materialType, slope: sl, solarMeasured }),
    })
    if (!res.ok) { setError('Failed to calculate estimate. Please try again.'); setLoading(false); return }
    const data = await res.json()
    onComplete({ sqft, slope: sl, squares: data.squares, estimateLow: data.estimateLow, estimateHigh: data.estimateHigh })
    setLoading(false)
  }

  const handleExactSubmit = () => {
    const value = parseFloat(exactInput)
    if (!value || value < 100 || value > 50000) { setError('Please enter a square footage between 100 and 50,000.'); return }
    if (!slope) { setError('Please also select your roof slope.'); return }
    submit(value, slope)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 leading-tight">One last thing</h2>
        <p className="text-stone-500 text-sm mt-1.5">Confirm your roof slope to get your estimate.</p>
      </div>

      {/* Satellite hero — full bleed with measurement overlay */}
      {lat && lng && (
        <div className="-mx-6 -mt-2 relative" style={{ height: 220 }}>
          <SatelliteMap lat={lat} lng={lng} zoom={19} className="absolute inset-0 w-full h-full" />

          {/* Dark gradient at bottom for legibility */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

          {/* Measurement badge overlaid on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            {fetchingFootprint ? (
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                <span className="text-white text-xs font-bold uppercase tracking-widest opacity-90">
                  Scanning from satellite…
                </span>
              </div>
            ) : footprintSqft ? (
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5">
                <span className="text-orange-400 text-sm">📡</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                    {solarMeasured ? 'Surface area measured by satellite' : 'Measured from satellite'}
                  </p>
                  <p className="text-white font-bold text-sm leading-tight">{footprintSqft.toLocaleString()} sq ft</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5">
                <span className="text-stone-400 text-sm">🛰️</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Satellite view of your property</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slope — read-only badge when solarMeasured, picker otherwise */}
      {!isFlatMaterial && (
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500">1 — Roof slope</p>
          {solarMeasured ? (
            <div className="flex items-center gap-2 border border-stone-200 bg-stone-50 px-3 py-2">
              <span className="text-stone-500">📐</span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Slope detected by satellite</p>
                <p className="text-sm font-bold text-stone-800">
                  {SLOPES.find((s) => s.value === slope)?.label} · {SLOPES.find((s) => s.value === slope)?.pitch}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                {SLOPES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={loading}
                    onClick={() => { setSlope(s.value); setError('') }}
                    className={`flex flex-col items-center gap-1.5 border-2 px-2 py-3 transition-colors ${
                      slope === s.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    } disabled:opacity-60`}
                  >
                    <span className={`text-2xl leading-none ${slope === s.value ? 'text-orange-500' : 'text-stone-400'}`}>
                      {s.visual}
                    </span>
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span className="text-[10px] text-stone-400 leading-none">{s.pitch}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-400">Not sure? Most homes are Medium (6–8/12).</p>
            </>
          )}
        </div>
      )}

      {/* Size section — only shown when no footprint available and not solarMeasured */}
      {!footprintSqft && !fetchingFootprint && !solarMeasured && (
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500">
            {isFlatMaterial ? '1' : '2'} — How many bedrooms?
          </p>

          {!exactMode ? (
            <>
              <div className="space-y-2">
                {BEDROOM_OPTIONS.map((opt) => (
                  <button
                    key={opt.sqft}
                    type="button"
                    disabled={loading}
                    onClick={() => { setSelectedSqft(opt.sqft); setError('') }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 border-2 text-left transition-colors ${
                      selectedSqft === opt.sqft
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    } disabled:opacity-60`}
                  >
                    <div>
                      <p className={`font-bold text-sm ${selectedSqft === opt.sqft ? 'text-orange-700' : 'text-stone-800'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">{opt.sublabel}</p>
                    </div>
                    {selectedSqft === opt.sqft && (
                      <span className="text-orange-500 font-black text-lg leading-none">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { setExactMode(true); setSelectedSqft(null) }}
                className="text-xs text-stone-400 hover:text-orange-600 font-semibold underline underline-offset-2 transition-colors"
              >
                I know my exact square footage →
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Input
                autoFocus
                placeholder="e.g. 1850"
                value={exactInput}
                onChange={(e) => { setExactInput(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
              />
              <button
                type="button"
                onClick={() => { setExactMode(false); setExactInput('') }}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← Back to quick select
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footprint adjustment — shown when footprint was measured (non-solar) */}
      {footprintSqft && !fetchingFootprint && !solarMeasured && (
        <div className="space-y-1.5 pt-2 border-t border-stone-100">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500">
            {isFlatMaterial ? '1' : '2'} — Roof size (measured)
          </p>
          <Input
            placeholder="Adjust if needed"
            value={exactInput}
            onChange={(e) => { setExactInput(e.target.value.replace(/[^0-9]/g, '')); setError('') }}
          />
          <p className="text-xs text-stone-400">Satellite measured {footprintSqft.toLocaleString()} sq ft. Adjust if you know it&apos;s different.</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

      {/* Manual submit — exact mode or footprint mode (non-solar) */}
      {(exactMode || (footprintSqft && !solarMeasured)) && (
        <Button
          type="button"
          onClick={handleExactSubmit}
          disabled={!canSubmit}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {loading ? 'Calculating...' : 'Get My Estimate'}
        </Button>
      )}

      {/* Loading indicator for bedroom-tap flow */}
      {loading && !exactMode && !footprintSqft && (
        <p className="text-center text-sm text-stone-400 font-semibold animate-pulse">Calculating your estimate…</p>
      )}

      {/* Loading indicator for solar auto-submit */}
      {loading && solarMeasured && (
        <p className="text-center text-sm text-stone-400 font-semibold animate-pulse">Calculating your estimate…</p>
      )}
    </div>
  )
}
