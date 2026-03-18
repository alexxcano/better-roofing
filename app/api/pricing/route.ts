import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePricingSchema = z.object({
  pricePerSquare: z.number().positive(),
  pricePerSquareAsphalt: z.number().positive(),
  pricePerSquareMetal: z.number().positive(),
  pricePerSquareTile: z.number().positive(),
  pricePerSquareFlat: z.number().positive(),
  wasteFactor: z.number().min(1).max(2),
  tearOffCost: z.number().min(0),
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

  const settings = await prisma.pricingSettings.upsert({
    where: { contractorId: session.user.contractorId },
    update: parsed.data,
    create: {
      contractorId: session.user.contractorId,
      ...parsed.data,
    },
  })

  return NextResponse.json(settings)
}
