import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get('input')
  if (!input?.trim()) return NextResponse.json({ predictions: [] })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ predictions: [] }, { status: 500 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', input)
  url.searchParams.set('types', 'address')
  url.searchParams.set('components', 'country:us')
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const data = await res.json()

  return NextResponse.json({
    predictions: (data.predictions ?? []).map((p: { place_id: string; description: string }) => ({
      place_id: p.place_id,
      description: p.description,
    })),
  })
}
