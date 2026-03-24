'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { checkServiceArea } from '@/lib/serviceArea'
import type { ServiceLocation } from '@/lib/serviceArea'
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete'

interface StepAddressProps {
  contractorId: string
  address: string
  lat: number | null
  lng: number | null
  locations: ServiceLocation[]
  onComplete: (data: {
    address: string
    lat: number | null
    lng: number | null
    outOfArea: boolean
    nearestLocationId: string | null
    distanceMiles: number
    footprintSqft: number | null
    slope: string | null
    solarMeasured: boolean
  }) => void
}

const inputClass =
  'w-full border-2 border-stone-200 bg-white px-3 py-3.5 text-[0.9375rem] text-stone-900 placeholder:text-stone-400 outline-none focus:border-orange-500 transition-colors'

export function StepAddress({ contractorId, address: initialAddress, locations, onComplete }: StepAddressProps) {
  const [address, setAddress] = useState(initialAddress)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)
  const [footprintSqft, setFootprintSqft] = useState<number | null>(null)
  const [detectedSlope, setDetectedSlope] = useState<string | null>(null)
  const [solarMeasured, setSolarMeasured] = useState(false)

  const handleSelect = (data: { address: string; lat: number; lng: number }) => {
    setAddress(data.address)
    setLat(data.lat)
    setLng(data.lng)
    setFootprintSqft(null)
    setDetectedSlope(null)
    setSolarMeasured(false)

    // Eagerly fetch building footprint — should resolve before user clicks submit
    fetch(`/api/building-footprint?lat=${data.lat}&lng=${data.lng}`)
      .then((r) => r.json())
      .then((d) => {
        setFootprintSqft(d.sqft ?? null)
        setDetectedSlope(d.slope ?? null)
        setSolarMeasured(d.solarMeasured ?? false)
      })
      .catch(() => {})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return

    setChecking(true)

    let outOfArea = false
    let nearestLocationId: string | null = null
    let distanceMiles = 0

    if (locations.length > 0 && lat != null && lng != null) {
      const result = checkServiceArea(lat, lng, locations)
      outOfArea = !result.inArea
      nearestLocationId = result.nearestLocationId
      distanceMiles = result.distanceMiles
    }

    setChecking(false)
    onComplete({
      address,
      lat,
      lng,
      outOfArea,
      nearestLocationId,
      distanceMiles,
      footprintSqft,
      slope: detectedSlope,
      solarMeasured,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900 leading-tight">What&apos;s the property address?</h2>
        <p className="text-stone-500 text-sm mt-1.5">We&apos;ll use this to prepare your estimate</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-black uppercase tracking-widest text-stone-500">Property Address</label>
        <AddressAutocomplete
          value={address}
          onChange={(v) => { setAddress(v); setLat(null); setLng(null) }}
          onSelect={handleSelect}
          placeholder="123 Main St, Austin, TX"
          className={inputClass}
          contractorId={contractorId}
        />
      </div>

      <button
        type="submit"
        disabled={!address.trim() || checking}
        className="btn btn-primary w-full py-3.5 text-base"
      >
        {checking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : 'Get My Estimate →'}
      </button>
    </form>
  )
}
