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
    if (!contractor) return NextResponse.json({ predictions: [] }, { status: 401 })
  } else if (!session?.user?.contractorId) {
    return NextResponse.json({ predictions: [] }, { status: 401 })
  }

  const input = req.nextUrl.searchParams.get('input')
  if (!input?.trim()) return NextResponse.json({ predictions: [] })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ predictions: [] }, { status: 500 })

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', input)
  url.searchParams.set('types', 'address')
  url.searchParams.set('components', 'country:us')
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url.toString())
    const data = await res.json()

    return NextResponse.json({
      predictions: (data.predictions ?? []).map((p: { place_id: string; description: string }) => ({
        place_id: p.place_id,
        description: p.description,
      })),
    })
  } catch (error) {
    await logger.warn('api.maps.autocomplete', error, { meta: { input } })
    return NextResponse.json({ predictions: [] })
  }
}
