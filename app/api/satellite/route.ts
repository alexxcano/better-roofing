import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const zoom = searchParams.get('zoom') ?? '19'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 })
  }

  const token = process.env.MAPBOX_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Mapbox not configured' }, { status: 503 })
  }

  const marker = `pin-s+f97316(${lng},${lat})`
  const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${marker}/${lng},${lat},${zoom},0/640x280@2x?access_token=${token}`

  const upstream = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 * 30 }, // Next.js server cache: 30 days
  })

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status })
  }

  const image = await upstream.arrayBuffer()

  return new NextResponse(image, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=2592000, immutable', // browser cache: 30 days
    },
  })
}
