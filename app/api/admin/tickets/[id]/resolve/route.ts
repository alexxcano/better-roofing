import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    await prisma.supportTicket.update({
      where: { id },
      data: { status: 'resolved' },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    await logger.error('admin.tickets.resolve', error, { meta: { id } })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
