import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  // Allow widget calls (contractorId param) or authenticated dashboard calls
  const contractorId = req.nextUrl.searchParams.get('contractorId')
  const session = await auth()

  if (contractorId) {
    const contractor = await prisma.contractor.findUnique({ where: { id: contractorId }, select: { id: true } })
    if (!contractor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } else if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const placeId = req.nextUrl.searchParams.get('place_id')
  if (!placeId) return NextResponse.json({ error: 'Missing place_id' }, { status: 400 })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'formatted_address,geometry')
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url.toString())
    const data = await res.json()
    const result = data.result

    if (!result) return NextResponse.json({ error: 'Place not found' }, { status: 404 })

    return NextResponse.json({
      address: result.formatted_address ?? null,
      lat: result.geometry?.location?.lat ?? null,
      lng: result.geometry?.location?.lng ?? null,
    })
  } catch (error) {
    await logger.warn('api.maps.place', error, { meta: { placeId } })
    return NextResponse.json({ error: 'Place lookup failed' }, { status: 500 })
  }
}
