import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EstimatorWidget } from '@/components/estimator/EstimatorWidget'

// Cache the embed page — contractor config changes infrequently
export const revalidate = 3600 // 1 hour

interface EmbedPageProps {
  params: Promise<{ contractorId: string }>
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { contractorId } = await params
  const [contractor, totalLeads, locations, pricing] = await Promise.all([
    prisma.contractor.findUnique({
      where: { id: contractorId },
      include: { subscription: true },
    }),
    prisma.lead.count({ where: { contractorId } }),
    prisma.location.findMany({
      where: { contractorId },
      select: { id: true, lat: true, lng: true, serviceRadiusMiles: true },
    }),
    prisma.pricingSettings.findUnique({
      where: { contractorId },
      select: { offersAsphalt: true, offersMetal: true, offersTile: true, offersFlat: true },
    }),
  ])

  if (!contractor) notFound()

  const isActive =
    contractor.subscription?.status === 'active' ||
    contractor.subscription?.status === 'trialing'

  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="text-center max-w-md border-2 border-stone-200 bg-white p-8">
          <div className="h-14 w-14 bg-stone-100 border-2 border-stone-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏚️</span>
          </div>
          <h2 className="font-barlow font-black text-xl uppercase text-stone-700 mb-2">Estimator Unavailable</h2>
          <p className="text-stone-500 text-sm">
            This estimator is currently inactive. Please contact the roofing company directly.
          </p>
        </div>
      </div>
    )
  }

  const enabledMaterials = [
    pricing?.offersAsphalt !== false && 'asphalt',
    pricing?.offersMetal   !== false && 'metal',
    pricing?.offersTile    !== false && 'tile',
    pricing?.offersFlat    === true  && 'flat',
  ].filter(Boolean) as string[]

  return (
    <EstimatorWidget
      contractorId={contractor.id}
      companyName={contractor.companyName}
      totalLeads={totalLeads}
      bookingUrl={contractor.bookingUrl}
      locations={locations}
      outOfAreaBehavior={contractor.outOfAreaBehavior}
      enabledMaterials={enabledMaterials.length > 0 ? enabledMaterials : ['asphalt']}
    />
  )
}
