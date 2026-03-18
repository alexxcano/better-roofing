import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLeadScore } from '@/lib/leadScore'

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'Asphalt Shingles',
  metal: 'Metal Roofing',
  tile: 'Tile Roofing',
}

const URGENCY_LABELS: Record<string, string> = {
  emergency: 'Emergency',
  soon: 'Within 3 months',
  browsing: 'Just browsing',
}

const HOMEOWNER_LABELS: Record<string, string> = {
  yes: 'Homeowner',
  no: 'Represents owner',
  renter: 'Renter',
}

const PROJECT_LABELS: Record<string, string> = {
  replacement: 'Full replacement',
  repair: 'Repair only',
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

  const leads = await prisma.lead.findMany({
    where: { contractorId: session.user.contractorId },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'ID', 'Name', 'Email', 'Phone', 'Address',
    'Homeowner', 'Project Type', 'Urgency', 'Lead Score', 'Score Tier',
    'Material', 'Roof Squares', 'Estimate Low', 'Estimate High', 'Date',
  ]

  const rows = leads.map((lead) => {
    const { score, label } = calculateLeadScore({
      isHomeowner: lead.isHomeowner,
      projectType: lead.projectType,
      urgency: lead.urgency,
    })
    return [
      lead.id,
      lead.name,
      lead.email,
      lead.phone ?? '',
      lead.address,
      HOMEOWNER_LABELS[lead.isHomeowner] ?? lead.isHomeowner,
      PROJECT_LABELS[lead.projectType] ?? lead.projectType,
      URGENCY_LABELS[lead.urgency] ?? lead.urgency,
      score,
      label,
      MATERIAL_LABELS[lead.materialType] ?? lead.materialType,
      lead.roofSquares.toFixed(1),
      lead.estimateLow,
      lead.estimateHigh,
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
}
