'use client'

import { useState, useEffect, useRef } from 'react'
import React from 'react'

interface SatelliteMapProps {
  lat: number
  lng: number
  zoom?: number
  className?: string
  style?: React.CSSProperties
}

export function SatelliteMap({ lat, lng, zoom = 19, className = '', style }: SatelliteMapProps) {
  const targetSrc = `/api/satellite?lat=${lat}&lng=${lng}&zoom=${zoom}`

  const [displayedSrc, setDisplayedSrc] = useState<string | null>(null)
  const [nextSrc, setNextSrc] = useState<string>(targetSrc)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // When coordinates change, queue up the new src
  useEffect(() => {
    if (targetSrc !== displayedSrc) {
      setNextSrc(targetSrc)
      setLoaded(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSrc])

  const handleLoad = () => {
    setDisplayedSrc(nextSrc)
    setLoaded(true)
  }

  return (
    <div className={`relative overflow-hidden bg-stone-200 ${className}`} style={style}>
      {/* Shimmer skeleton shown until first image is ready */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
          <span className="relative z-10 text-xs font-semibold uppercase tracking-widest text-stone-400 animate-pulse">
            Loading satellite view…
          </span>
        </div>
      )}

      {/* Previous image stays visible underneath while next one loads */}
      {displayedSrc && displayedSrc !== nextSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayedSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* New image — invisible until loaded, then fades in */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        key={nextSrc}
        src={nextSrc}
        alt="Satellite view of property"
        loading="eager"
        onLoad={handleLoad}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Subtle vignette to blend edges */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.25)' }}
      />
    </div>
  )
}
