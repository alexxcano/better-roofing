import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  serviceRadiusMiles: z.number().min(1).max(500).default(50),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const locations = await prisma.location.findMany({
    where: { contractorId: session.user.contractorId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(locations)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = locationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const contractorId = session.user.contractorId

  // Enforce location limit for Starter plan
  const subscription = await prisma.subscription.findUnique({ where: { contractorId } })
  if (subscription?.plan === 'STARTER') {
    const count = await prisma.location.count({ where: { contractorId } })
    if (count >= 1) {
      return NextResponse.json(
        { error: 'Location limit reached. Upgrade to Pro to add multiple locations.' },
        { status: 403 }
      )
    }
  }

  try {
    const location = await prisma.location.create({
      data: { contractorId, ...parsed.data },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    await logger.error('api.locations.create', error, { userId: session.user.id, meta: { contractorId } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
