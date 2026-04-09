import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'
import { sendTelegramMessage, signupAlert } from '@/lib/telegram'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, email, password, companyName } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const contractor = await tx.contractor.create({
        data: { companyName },
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'CONTRACTOR',
          contractorId: contractor.id,
        },
      })

      await tx.pricingSettings.create({
        data: {
          contractorId: contractor.id,
          pricePerSquare: 425,
          wasteFactor: 1.12,
          tearOffCost: 1000,
        },
      })

      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      await tx.subscription.create({
        data: {
          contractorId: contractor.id,
          plan: 'PRO',
          status: 'trialing',
          trialEndsAt,
        },
      })

      return { user, contractor }
    })

    await sendTelegramMessage(signupAlert(result.user.name ?? 'Unknown', result.user.email ?? '', 'Email', result.contractor.companyName))

    return NextResponse.json({ userId: result.user.id, contractorId: result.contractor.id }, { status: 201 })
  } catch (error) {
    await logger.error('api.contractors.signup', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
