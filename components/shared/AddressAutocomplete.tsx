'use client'

import { useState, useRef, useEffect } from 'react'

interface Prediction {
  place_id: string
  description: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (data: { address: string; lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  contractorId?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = '123 Main St, City, State',
  className,
  contractorId,
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (v: string) => {
    onChange(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!v.trim()) { setPredictions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ input: v })
        if (contractorId) params.set('contractorId', contractorId)
        const res = await fetch(`/api/maps/autocomplete?${params}`)
        if (!res.ok) return
        const data = await res.json()
        setPredictions(data.predictions ?? [])
        setOpen((data.predictions?.length ?? 0) > 0)
      } catch {}
    }, 300)
  }

  const handleSelect = async (p: Prediction) => {
    setOpen(false)
    onChange(p.description)
    try {
      const params = new URLSearchParams({ place_id: p.place_id })
      if (contractorId) params.set('contractorId', contractorId)
      const res = await fetch(`/api/maps/place?${params}`)
      if (!res.ok) return
      const data = await res.json()
      onSelect({ address: data.address, lat: data.lat, lng: data.lng })
    } catch {}
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => predictions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && predictions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border-2 border-stone-200 shadow-lg max-h-60 overflow-auto">
          {predictions.map((p) => (
            <li
              key={p.place_id}
              onMouseDown={() => handleSelect(p)}
              className="px-3 py-2.5 text-sm text-stone-800 hover:bg-orange-50 hover:text-orange-700 cursor-pointer border-b border-stone-100 last:border-0"
            >
              {p.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
