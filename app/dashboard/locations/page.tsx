import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { LocationsClient } from './locations-client'

export default async function LocationsPage() {
  const session = await auth()
  if (!session?.user?.contractorId) redirect('/login')

  const [locations, contractor] = await Promise.all([
    prisma.location.findMany({
      where: { contractorId: session.user.contractorId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.contractor.findUnique({
      where: { id: session.user.contractorId },
      select: { outOfAreaBehavior: true },
    }),
  ])

  return (
    <LocationsClient
      initialLocations={locations}
      outOfAreaBehavior={contractor?.outOfAreaBehavior ?? 'FLAG'}
    />
  )
}
