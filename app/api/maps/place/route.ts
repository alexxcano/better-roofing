import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('place_id')
  if (!placeId) return NextResponse.json({ error: 'Missing place_id' }, { status: 400 })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'formatted_address,geometry')
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const data = await res.json()
  const result = data.result

  if (!result) return NextResponse.json({ error: 'Place not found' }, { status: 404 })

  return NextResponse.json({
    address: result.formatted_address ?? null,
    lat: result.geometry?.location?.lat ?? null,
    lng: result.geometry?.location?.lng ?? null,
  })
}
