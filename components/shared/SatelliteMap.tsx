interface SatelliteMapProps {
  lat: number
  lng: number
  zoom?: number
  width?: number
  height?: number
  className?: string
}

export function SatelliteMap({ lat, lng, zoom = 19, width = 640, height = 280, className = '' }: SatelliteMapProps) {
  const src = `/api/satellite?lat=${lat}&lng=${lng}&zoom=${zoom}`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Satellite view of property"
      width={width}
      height={height}
      className={`w-full object-cover ${className}`}
      loading="lazy"
    />
  )
}
