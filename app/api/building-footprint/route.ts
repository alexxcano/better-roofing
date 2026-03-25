import { NextRequest, NextResponse } from 'next/server'

type SlopeType = 'flat' | 'low' | 'medium' | 'steep'

function pitchToSlope(degrees: number): SlopeType {
  if (degrees < 10) return 'flat'
  if (degrees < 23) return 'low'
  if (degrees < 34) return 'medium'
  return 'steep'
}

// Shoelace formula on a sphere — accurate enough for building-scale polygons
function polygonAreaSqFt(coords: { lat: number; lng: number }[]): number {
  if (coords.length < 3) return 0
  const R = 6371000 // Earth radius in metres
  let area = 0
  const n = coords.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const lat1 = (coords[i].lat * Math.PI) / 180
    const lat2 = (coords[j].lat * Math.PI) / 180
    const dLng = ((coords[j].lng - coords[i].lng) * Math.PI) / 180
    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2))
  }
  area = Math.abs((area * R * R) / 2)
  return Math.round(area * 10.7639) // m² → ft²
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')

  if (isNaN(lat) || isNaN(lng)) return NextResponse.json({ sqft: null, slope: null, solarMeasured: false })

  // --- Try Google Solar API first ---
  const solarKey = process.env.GOOGLE_MAPS_API_KEY
  if (solarKey) {
    try {
      const solarUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=LOW&key=${solarKey}`
      const solarRes = await fetch(solarUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })

      if (solarRes.ok) {
        const solarData = await solarRes.json()
        const areaMeters2: number | undefined = solarData?.solarPotential?.wholeRoofStats?.areaMeters2
        const segments: { pitchDegrees?: number; stats?: { areaMeters2?: number } }[] = solarData?.solarPotential?.roofSegmentStats ?? []

        if (areaMeters2 && areaMeters2 > 0) {
          const sqft = Math.round(areaMeters2 * 10.7639)

          if (sqft >= 200 && sqft <= 50000) {
            // Compute area-weighted average pitch
            let totalArea = 0
            let weightedPitch = 0
            for (const seg of segments) {
              const segArea = seg.stats?.areaMeters2 ?? 0
              const segPitch = seg.pitchDegrees ?? 0
              totalArea += segArea
              weightedPitch += segPitch * segArea
            }
            const avgPitch = totalArea > 0 ? weightedPitch / totalArea : 20
            const slope = pitchToSlope(avgPitch)

            return NextResponse.json({ sqft, slope, solarMeasured: true })
          }
        }
      }
    } catch {
      // Solar API failed — fall through to OSM
    }
  }

  // --- Fall back to OSM Overpass ---
  try {
    const query = `[out:json][timeout:5];way["building"](around:30,${lat},${lng});out geom;`
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return NextResponse.json({ sqft: null, slope: null, solarMeasured: false })

    const data = await res.json()
    const buildings: any[] = data.elements ?? []

    if (!buildings.length) return NextResponse.json({ sqft: null, slope: null, solarMeasured: false })

    // Among all nearby buildings, pick the largest — it's almost always the main house
    let bestSqft: number | null = null

    for (const building of buildings) {
      const coords = building.geometry as { lat: number; lon: number }[]
      if (!coords?.length) continue

      const sqft = polygonAreaSqFt(coords.map((c) => ({ lat: c.lat, lng: c.lon })))
      if (sqft < 200 || sqft > 50000) continue

      if (bestSqft === null || sqft > bestSqft) {
        bestSqft = sqft
      }
    }

    if (!bestSqft) return NextResponse.json({ sqft: null, slope: null, solarMeasured: false })
    return NextResponse.json({ sqft: bestSqft, slope: null, solarMeasured: false })
  } catch {
    return NextResponse.json({ sqft: null, slope: null, solarMeasured: false })
  }
}
