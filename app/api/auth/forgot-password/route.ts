import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/resend'
import { passwordResetRatelimit } from '@/lib/ratelimit'
import { logger } from '@/lib/logger'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { success } = await passwordResetRatelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }

  const { email } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    // Always return 200 to avoid leaking which emails are registered.
    // Only send email if the account exists AND uses password auth.
    if (user?.password) {
      // Invalidate any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      })

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      await sendPasswordResetEmail({ toEmail: email, resetUrl })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    await logger.error('auth.forgot_password', err, { meta: { email } })
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
