export interface ServiceLocation {
  id: string
  lat: number
  lng: number
  serviceRadiusMiles: number
}

export interface AreaCheckResult {
  inArea: boolean
  nearestLocationId: string | null
  distanceMiles: number
}

/** Haversine formula — great-circle distance in miles */
export function haversineDistanceMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Checks whether a point falls within any of the contractor's service locations.
 * If no locations are configured, every lead is treated as in-area.
 */
export function checkServiceArea(
  lat: number,
  lng: number,
  locations: ServiceLocation[],
): AreaCheckResult {
  if (locations.length === 0) {
    return { inArea: true, nearestLocationId: null, distanceMiles: 0 }
  }

  let nearest = locations[0]
  let nearestDist = haversineDistanceMiles(lat, lng, nearest.lat, nearest.lng)

  for (const loc of locations.slice(1)) {
    const dist = haversineDistanceMiles(lat, lng, loc.lat, loc.lng)
    if (dist < nearestDist) {
      nearest = loc
      nearestDist = dist
    }
  }

  return {
    inArea: nearestDist <= nearest.serviceRadiusMiles,
    nearestLocationId: nearest.id,
    distanceMiles: Math.round(nearestDist * 10) / 10,
  }
}
