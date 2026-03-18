import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Ensure lead belongs to this contractor
  const lead = await prisma.lead.findFirst({
    where: { id, contractorId: session.user.contractorId },
  })
  if (!lead) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}
