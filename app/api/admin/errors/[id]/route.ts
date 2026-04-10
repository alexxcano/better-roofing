import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const patchSchema = z.object({
  status: z.enum(['open', 'resolved', 'ignored']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { status } = parsed.data

  try {
    await prisma.errorLog.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    await logger.error('admin.errors.update', error, { meta: { id, status } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    await prisma.errorLog.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    await logger.error('admin.errors.delete', error, { meta: { id } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
