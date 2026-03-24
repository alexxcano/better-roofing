import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendLeadNotification } from '@/lib/resend'
import { calculateLeadScore } from '@/lib/leadScore'
import { checkServiceArea } from '@/lib/serviceArea'
import { generateLeadDrafts } from '@/lib/generateLeadEmail'
import { z } from 'zod'
import dns from 'dns'

async function isSafeWebhookUrl(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false

    const { address, family } = await dns.promises.lookup(parsed.hostname)

    if (family === 4) {
      const [a, b] = address.split('.').map(Number)
      if (a === 127) return false                              // loopback
      if (a === 10) return false                              // 10.0.0.0/8
      if (a === 172 && b >= 16 && b <= 31) return false      // 172.16.0.0/12
      if (a === 192 && b === 168) return false                // 192.168.0.0/16
      if (a === 169 && b === 254) return false                // link-local / metadata
      if (a === 0) return false                               // 0.0.0.0
    }

    if (family === 6) {
      const lower = address.toLowerCase()
      if (lower === '::1') return false                       // loopback
      if (lower.startsWith('fc') || lower.startsWith('fd')) return false  // fc00::/7 ULA
      if (lower.startsWith('fe8') || lower.startsWith('fe9') ||
          lower.startsWith('fea') || lower.startsWith('feb')) return false // link-local
      // IPv4-mapped e.g. ::ffff:127.0.0.1
      if (lower.startsWith('::ffff:')) {
        const ipv4 = lower.slice(7)
        const [a, b] = ipv4.split('.').map(Number)
        if (a === 127 || a === 10 || a === 0) return false
        if (a === 172 && b >= 16 && b <= 31) return false
        if (a === 192 && b === 168) return false
        if (a === 169 && b === 254) return false
      }
    }

    return true
  } catch {
    return false
  }
}

const createLeadSchema = z.object({
  contractorId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  address: z.string().min(1),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  insuranceClaim: z.enum(['yes', 'no', 'unsure']).default('no'),
  materialType: z.enum(['asphalt', 'metal', 'tile', 'flat']).default('asphalt'),
  roofSlope: z.enum(['flat', 'low', 'medium', 'steep']).default('medium'),
  homeSqft: z.number().positive().optional(),
  roofSquares: z.number().positive(),
  estimateLow: z.number().positive(),
  estimateHigh: z.number().positive(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const leads = await prisma.lead.findMany({
    where: { contractorId: session.user.contractorId },
    include: { location: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { contractorId, insuranceClaim, lat, lng, ...rest } = parsed.data

    // Verify active subscription
    const subscription = await prisma.subscription.findUnique({ where: { contractorId } })
    if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
      return NextResponse.json({ error: 'Contractor subscription inactive' }, { status: 403 })
    }

    // Load contractor + locations for service area check
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
      select: {
        notificationEmail: true,
        webhookUrl: true,
        companyName: true,
        outOfAreaBehavior: true,
        locations: { select: { id: true, lat: true, lng: true, serviceRadiusMiles: true }, orderBy: { createdAt: 'asc' } },
      },
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    // Enforce location limit per plan (Starter = 1 location only)
    const activeLocations = subscription.plan === 'STARTER'
      ? contractor.locations.slice(0, 1)
      : contractor.locations

    // Service area check (only if locations configured and lat/lng provided)
    let outOfArea = false
    let nearestLocationId: string | null = null

    if (activeLocations.length > 0 && lat != null && lng != null) {
      const areaResult = checkServiceArea(lat, lng, activeLocations)
      outOfArea = !areaResult.inArea
      nearestLocationId = areaResult.nearestLocationId

      // Hard gate: reject out-of-area leads if contractor chose GATE behavior
      if (outOfArea && contractor.outOfAreaBehavior === 'GATE' && activeLocations.length > 0) {
        return NextResponse.json(
          { error: 'out_of_area', message: 'This address is outside our service area.' },
          { status: 422 }
        )
      }
    }

    const { score: leadScore } = calculateLeadScore({
      insuranceClaim,
      materialType: parsed.data.materialType ?? 'asphalt',
      estimateHigh: parsed.data.estimateHigh ?? 0,
      outOfArea,
    })

    const lead = await prisma.lead.create({
      data: {
        contractorId,
        insuranceClaim,
        leadScore,
        outOfArea,
        locationId: nearestLocationId,
        lat,
        lng,
        ...rest,
      },
    })

    // Side-effects: run in background, don't block the widget response
    if (contractor.notificationEmail) {
      void sendLeadNotification({ lead, toEmail: contractor.notificationEmail, companyName: contractor.companyName })
    }
    if (contractor.webhookUrl) {
      void isSafeWebhookUrl(contractor.webhookUrl).then((safe) => {
        if (!safe) { console.warn('[Webhook] Blocked unsafe URL:', contractor.webhookUrl); return }
        return fetch(contractor.webhookUrl!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        }).catch((err) => console.error('[Webhook] Delivery failed:', err))
      })
    }

    // Generate AI brief + follow-up drafts (Pro feature — fire and forget)
    void generateLeadDrafts({
      companyName: contractor.companyName,
      leadName: lead.name,
      address: lead.address,
      insuranceClaim: lead.insuranceClaim,
      materialType: lead.materialType,
      roofSquares: lead.roofSquares,
      estimateLow: lead.estimateLow,
      estimateHigh: lead.estimateHigh,
    }).then(({ brief, email, sms }) => {
      return prisma.lead.update({
        where: { id: lead.id },
        data: {
          aiLeadBrief: brief || null,
          aiEmailDraft: email || null,
          aiSmsDraft: sms || null,
        },
      })
    }).catch((err) => console.error('[AI Drafts] Generation failed:', err))

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
