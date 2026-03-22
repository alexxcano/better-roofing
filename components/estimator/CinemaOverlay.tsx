'use client'

import { useEffect, useRef, useState } from 'react'

interface CinemaOverlayProps {
  lat: number
  lng: number
  address: string
  sqft: number | null
  slope: string | null
  onComplete: () => void
}

export function CinemaOverlay({ lat, lng, address, sqft, slope, onComplete }: CinemaOverlayProps) {
  const [phase, setPhase] = useState(0)
  const [wideUrl, setWideUrl] = useState<string | null>(null)
  const [closeUrl, setCloseUrl] = useState<string | null>(null)
  const [fadeOut, setFadeOut] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const wideUrlRef = useRef<string | null>(null)
  const closeUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // Fetch both images concurrently
    const widePromise = fetch(`/api/satellite?lat=${lat}&lng=${lng}&zoom=4&size=800x600&nomarker=1`)
      .then((r) => r.blob())
      .then((b) => URL.createObjectURL(b))
    const closePromise = fetch(`/api/satellite?lat=${lat}&lng=${lng}&zoom=19&size=800x600`)
      .then((r) => r.blob())
      .then((b) => URL.createObjectURL(b))

    Promise.all([widePromise, closePromise]).then(([wide, close]) => {
      wideUrlRef.current = wide
      closeUrlRef.current = close
      setWideUrl(wide)
      setCloseUrl(close)
    }).catch(() => {})

    // Phase timings
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => setPhase(3), 3600)
    const t4 = setTimeout(() => setPhase(4), 5600)
    const tFade = setTimeout(() => setFadeOut(true), 6800)
    const tComplete = setTimeout(() => onComplete(), 7500)

    timeoutsRef.current = [t1, t2, t3, t4, tFade, tComplete]

    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      if (wideUrlRef.current) URL.revokeObjectURL(wideUrlRef.current)
      if (closeUrlRef.current) URL.revokeObjectURL(closeUrlRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checklist = [
    { label: 'Locating your property', doneAt: 1 },
    { label: 'Measuring roof via satellite', doneAt: 3 },
    { label: 'Calculating your estimate', doneAt: 4 },
  ]

  // Wide image style
  const wideStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 1000ms, transform 1000ms',
    opacity: phase >= 1 && phase < 2 ? 1 : 0,
    transform: phase >= 2 ? 'scale(2)' : 'scale(1)',
  }

  // Close image style
  const closeFilter = phase >= 3 ? 'blur(0px)' : 'blur(4px)'
  const closeOpacity = phase >= 2 ? 1 : 0
  const closeScale = phase >= 4 ? 'scale(1.0)' : phase >= 3 ? 'scale(1.05)' : 'scale(1.3)'
  const closeStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 700ms, transform 700ms, filter 700ms',
    opacity: closeOpacity,
    transform: closeScale,
    filter: closeFilter,
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#050a14] overflow-hidden animate-fade-in"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 700ms',
      }}
    >
      {/* Wide image layer */}
      {wideUrl && <img src={wideUrl} alt="" style={wideStyle} />}

      {/* Close image layer */}
      {closeUrl && <img src={closeUrl} alt="" style={closeStyle} />}

      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Scan line — phases 1-3 */}
      {phase >= 1 && phase <= 3 && (
        <div
          className="absolute left-0 right-0 h-px bg-orange-500 opacity-60 animate-scan-line"
          style={{ zIndex: 10 }}
        />
      )}

      {/* Corner viewfinder brackets */}
      {/* Top-left */}
      <div className="absolute top-8 left-8" style={{ width: 20, height: 20 }}>
        <div className="absolute top-0 left-0 border-t-2 border-l-2 border-orange-500" style={{ width: 20, height: 20 }} />
      </div>
      {/* Top-right */}
      <div className="absolute top-8 right-8" style={{ width: 20, height: 20 }}>
        <div className="absolute top-0 right-0 border-t-2 border-r-2 border-orange-500" style={{ width: 20, height: 20 }} />
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-8 left-8" style={{ width: 20, height: 20 }}>
        <div className="absolute bottom-0 left-0 border-b-2 border-l-2 border-orange-500" style={{ width: 20, height: 20 }} />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-8 right-8" style={{ width: 20, height: 20 }}>
        <div className="absolute bottom-0 right-0 border-b-2 border-r-2 border-orange-500" style={{ width: 20, height: 20 }} />
      </div>

      {/* LIVE SATELLITE badge — top-right */}
      <div className="absolute top-5 right-12 flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white text-xs font-bold tracking-widest uppercase">Live Satellite</span>
      </div>

      {/* Coordinates — top-left */}
      <div className="absolute top-5 left-12 font-mono text-orange-400 text-xs">
        <p>{lat.toFixed(4)}° N</p>
        <p>{Math.abs(lng).toFixed(4)}° W</p>
      </div>

      {/* Center reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-12 h-12">
          {/* Circle */}
          <div className="absolute inset-0 rounded-full border-2 border-orange-500 opacity-70" />
          {/* Crosshairs */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-orange-500 opacity-70" style={{ marginTop: -0.5 }} />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-orange-500 opacity-70" style={{ marginLeft: -0.5 }} />
        </div>
      </div>

      {/* Bottom area — checklist + measurement badge */}
      <div className="absolute bottom-16 left-0 right-0 px-8 space-y-3">
        {/* Measurement badge at phase 4 */}
        {phase >= 4 && sqft && (
          <div className="flex justify-center mb-2">
            <div className="bg-black/70 backdrop-blur-sm px-4 py-2 flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <p className="text-white font-bold text-sm">
                📡 {sqft.toLocaleString()} sq ft measured from satellite
              </p>
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-2">
          {checklist.map((item) => {
            const done = phase >= item.doneAt
            const active = !done && phase >= item.doneAt - 1
            return (
              <div key={item.label} className="flex items-center gap-3">
                {done ? (
                  <span className="w-4 h-4 flex-shrink-0 text-green-400 font-bold text-sm">✓</span>
                ) : active ? (
                  <span className="w-4 h-4 flex-shrink-0 inline-block rounded-full border-2 border-orange-400 border-t-transparent animate-spin" style={{ display: 'inline-block' }} />
                ) : (
                  <span className="w-4 h-4 flex-shrink-0 rounded-full border border-stone-600" />
                )}
                <span
                  className={`text-sm font-semibold transition-colors ${
                    done ? 'text-green-400' : active ? 'text-white' : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
