import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendLeadNotification } from '@/lib/resend'
import { calculateLeadScore } from '@/lib/leadScore'
import { checkServiceArea } from '@/lib/serviceArea'
import { generateLeadDrafts } from '@/lib/generateLeadEmail'
import { z } from 'zod'

const createLeadSchema = z.object({
  contractorId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  address: z.string().min(1),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  isHomeowner: z.enum(['yes', 'no', 'renter']).default('yes'),
  projectType: z.enum(['replacement', 'repair']).default('replacement'),
  insuranceClaim: z.enum(['yes', 'no', 'unsure']).default('no'),
  urgency: z.enum(['emergency', 'soon', 'browsing']).default('soon'),
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

    const { contractorId, isHomeowner, projectType, insuranceClaim, urgency, lat, lng, ...rest } = parsed.data

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
        locations: { select: { id: true, lat: true, lng: true, serviceRadiusMiles: true } },
      },
    })

    if (!contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    }

    // Service area check (only if locations configured and lat/lng provided)
    let outOfArea = false
    let nearestLocationId: string | null = null

    if (contractor.locations.length > 0 && lat != null && lng != null) {
      const areaResult = checkServiceArea(lat, lng, contractor.locations)
      outOfArea = !areaResult.inArea
      nearestLocationId = areaResult.nearestLocationId

      // Hard gate: reject out-of-area leads if contractor chose GATE behavior
      if (outOfArea && contractor.outOfAreaBehavior === 'GATE') {
        return NextResponse.json(
          { error: 'out_of_area', message: 'This address is outside our service area.' },
          { status: 422 }
        )
      }
    }

    const { score: leadScore } = calculateLeadScore({ isHomeowner, projectType, urgency, outOfArea })

    const lead = await prisma.lead.create({
      data: {
        contractorId,
        isHomeowner,
        projectType,
        insuranceClaim,
        urgency,
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
      void fetch(contractor.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      }).catch((err) => console.error('[Webhook] Delivery failed:', err))
    }

    // Generate AI brief + follow-up drafts (Pro feature — fire and forget)
    void generateLeadDrafts({
      companyName: contractor.companyName,
      leadName: lead.name,
      address: lead.address,
      projectType: lead.projectType as 'replacement' | 'repair',
      insuranceClaim: lead.insuranceClaim,
      urgency: lead.urgency as 'emergency' | 'soon' | 'browsing',
      isHomeowner: lead.isHomeowner,
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
