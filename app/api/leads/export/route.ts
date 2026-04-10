import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'Asphalt Shingles',
  metal: 'Metal Roofing',
  tile: 'Tile Roofing',
  flat: 'Flat / TPO',
}

const INSURANCE_LABELS: Record<string, string> = {
  yes: 'Insurance claim',
  no: 'Out of pocket',
  unsure: 'Not sure yet',
}

function scoreTierLabel(score: number): string {
  if (score >= 8) return 'Hot'
  if (score >= 5) return 'Warm'
  if (score >= 3) return 'Cool'
  return 'Cold'
}

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.contractorId) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const leads = await prisma.lead.findMany({
      where: { contractorId: session.user.contractorId },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    })

    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Address',
      'Insurance Claim', 'Lead Score', 'Score Tier',
      'Material', 'Roof Squares', 'Estimate Low', 'Estimate High', 'Out of Area', 'Date',
    ]

    const rows = leads.map((lead) => {
      return [
        lead.id,
        lead.name,
        lead.email,
        lead.phone ?? '',
        lead.address,
        INSURANCE_LABELS[lead.insuranceClaim] ?? lead.insuranceClaim,
        lead.leadScore,
        scoreTierLabel(lead.leadScore),
        MATERIAL_LABELS[lead.materialType] ?? lead.materialType,
        lead.roofSquares.toFixed(1),
        lead.estimateLow,
        lead.estimateHigh,
        lead.outOfArea ? 'Yes' : 'No',
        new Date(lead.createdAt).toLocaleDateString('en-US'),
      ]
    })

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    await logger.error('api.leads.export', error, { userId: session.user.contractorId })
    return new Response('Internal server error', { status: 500 })
  }
}
