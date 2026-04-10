import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const schema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    await prisma.supportTicket.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    await logger.error('admin.tickets.status', error, { meta: { id, status: parsed.data.status } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
