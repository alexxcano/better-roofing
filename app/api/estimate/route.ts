import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateEstimate } from '@/lib/estimate'
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
    console.error('Estimate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
