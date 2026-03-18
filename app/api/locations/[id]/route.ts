import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  serviceRadiusMiles: z.number().min(1).max(500).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.location.findUnique({ where: { id } })
  if (!existing || existing.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const location = await prisma.location.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(location)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.location.findUnique({ where: { id } })
  if (!existing || existing.contractorId !== session.user.contractorId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.location.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
