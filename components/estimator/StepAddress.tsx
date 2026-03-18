'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { checkServiceArea } from '@/lib/serviceArea'
import type { ServiceLocation } from '@/lib/serviceArea'

interface StepAddressProps {
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
  }) => void
}

declare global {
  interface Window { google: any; initGooglePlaces: () => void }
}

export function StepAddress({ address: initialAddress, locations, onComplete }: StepAddressProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [address, setAddress] = useState(initialAddress)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || typeof window === 'undefined') return

    const init = () => {
      if (!containerRef.current || !window.google?.maps?.places?.PlaceAutocompleteElement) return

      containerRef.current.innerHTML = ''

      const placeAuto = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' },
      })

      containerRef.current.appendChild(placeAuto)

      // Capture typed text for fallback (no autocomplete selected)
      placeAuto.addEventListener('input', (e: Event) => {
        const val = (e.target as HTMLInputElement)?.value ?? ''
        setAddress(val)
        setLat(null)
        setLng(null)
      })

      // New Places API (New) selection event
      placeAuto.addEventListener('gmp-select', async (event: any) => {
        const place = event.placePrediction.toPlace()
        await place.fetchFields({ fields: ['formattedAddress', 'location'] })
        setAddress(place.formattedAddress ?? '')
        setLat(place.location?.lat() ?? null)
        setLng(place.location?.lng() ?? null)
      })
    }

    if (window.google?.maps) { init(); return }

    window.initGooglePlaces = () => init()

    if (!document.querySelector('script[data-gmaps]')) {
      const s = document.createElement('script')
      // v=weekly uses the latest stable release which includes PlaceAutocompleteElement + Places API (New)
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&callback=initGooglePlaces`
      s.async = true
      s.dataset.gmaps = '1'
      document.head.appendChild(s)
    }
  }, [])

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
    onComplete({ address, lat, lng, outOfArea, nearestLocationId, distanceMiles })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900 leading-tight">What&apos;s the property address?</h2>
        <p className="text-stone-500 text-sm mt-1.5">We&apos;ll use this to prepare your estimate</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-black uppercase tracking-widest text-stone-500">Property Address</label>
        <div ref={containerRef} className="place-autocomplete-container" />
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
