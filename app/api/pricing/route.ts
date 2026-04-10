import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const updatePricingSchema = z.object({
  pricePerSquare: z.number().min(50).max(5000),
  pricePerSquareAsphalt: z.number().min(50).max(5000),
  pricePerSquareMetal: z.number().min(50).max(5000),
  pricePerSquareTile: z.number().min(50).max(5000),
  pricePerSquareFlat: z.number().min(50).max(5000),
  wasteFactor: z.number().min(1).max(2),
  tearOffCost: z.number().min(0).max(20000),
  offersAsphalt: z.boolean(),
  offersMetal: z.boolean(),
  offersTile: z.boolean(),
  offersFlat: z.boolean(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.pricingSettings.findUnique({
    where: { contractorId: session.user.contractorId },
  })

  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = updatePricingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const settings = await prisma.pricingSettings.upsert({
      where: { contractorId: session.user.contractorId },
      update: parsed.data,
      create: {
        contractorId: session.user.contractorId,
        ...parsed.data,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    await logger.error('api.pricing.update', error, { userId: session.user.id, meta: { contractorId: session.user.contractorId } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
