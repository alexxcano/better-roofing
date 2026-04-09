import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateEstimate } from '@/lib/estimate'
import { estimateRatelimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const estimateSchema = z.object({
  contractorId: z.string(),
  homeSqft: z.number().positive().max(50000),
  materialType: z.enum(['asphalt', 'metal', 'tile', 'flat']).default('asphalt'),
  slope: z.enum(['flat', 'low', 'medium', 'steep']).default('medium'),
  solarMeasured: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
    const { success } = await estimateRatelimit.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = estimateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { contractorId, homeSqft, materialType, slope, solarMeasured } = parsed.data

    const pricing = await prisma.pricingSettings.findUnique({
      where: { contractorId },
    })

    if (!pricing) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    const priceMap: Record<string, number> = {
      asphalt: pricing.pricePerSquareAsphalt,
      metal: pricing.pricePerSquareMetal,
      tile: pricing.pricePerSquareTile,
      flat: pricing.pricePerSquareFlat,
    }

    const result = calculateEstimate({
      homeSqft,
      pricePerSquare: priceMap[materialType] ?? pricing.pricePerSquareAsphalt,
      wasteFactor: pricing.wasteFactor,
      tearOffCost: pricing.tearOffCost,
      // Solar API already returns actual surface area, so no slope factor needed
      slope: solarMeasured ? 'flat' : slope,
    })

    return NextResponse.json(result)
  } catch (error) {
    await logger.error('api.estimate', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
