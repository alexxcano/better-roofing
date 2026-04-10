import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTrialReminder } from '@/lib/resend'
import { logger } from '@/lib/logger'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Window boundaries for each reminder type
  // 3-day: trialEndsAt is 2–4 days from now (daily cron catches it once in that window)
  const window3dStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const window3dEnd   = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)

  // Expiry: trialEndsAt is within the next 24 hours
  const windowExpiryStart = now
  const windowExpiryEnd   = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const [subs3d, subsExpiry] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        status: 'trialing',
        trialEndsAt: { gte: window3dStart, lte: window3dEnd },
        trialReminder3dSentAt: null,
      },
      include: {
        contractor: {
          select: {
            companyName: true,
            notificationEmail: true,
            users: { select: { email: true }, take: 1 },
            _count: { select: { leads: true } },
          },
        },
      },
    }),
    prisma.subscription.findMany({
      where: {
        status: 'trialing',
        trialEndsAt: { gte: windowExpiryStart, lte: windowExpiryEnd },
        trialReminderExpirySentAt: null,
      },
      include: {
        contractor: {
          select: {
            companyName: true,
            notificationEmail: true,
            users: { select: { email: true }, take: 1 },
            _count: { select: { leads: true } },
          },
        },
      },
    }),
  ])

  let sent3d = 0
  let sentExpiry = 0

  for (const sub of subs3d) {
    const toEmail = sub.contractor.notificationEmail ?? sub.contractor.users[0]?.email
    if (!toEmail || !sub.trialEndsAt) continue
    try {
      await sendTrialReminder({
        toEmail,
        companyName: sub.contractor.companyName,
        type: '3d',
        trialEndsAt: sub.trialEndsAt,
        leadCount: sub.contractor._count.leads,
      })
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { trialReminder3dSentAt: now },
      })
      sent3d++
    } catch (error) {
      await logger.error('cron.trial_reminders', error, { meta: { subscriptionId: sub.id, type: '3d' } })
    }
  }

  for (const sub of subsExpiry) {
    const toEmail = sub.contractor.notificationEmail ?? sub.contractor.users[0]?.email
    if (!toEmail || !sub.trialEndsAt) continue
    try {
      await sendTrialReminder({
        toEmail,
        companyName: sub.contractor.companyName,
        type: 'expiry',
        trialEndsAt: sub.trialEndsAt,
        leadCount: sub.contractor._count.leads,
      })
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { trialReminderExpirySentAt: now },
      })
      sentExpiry++
    } catch (error) {
      await logger.error('cron.trial_reminders', error, { meta: { subscriptionId: sub.id, type: 'expiry' } })
    }
  }

  console.log(`[Trial Reminders] 3-day: ${sent3d} sent, expiry: ${sentExpiry} sent`)
  return NextResponse.json({ sent3d, sentExpiry })
}
