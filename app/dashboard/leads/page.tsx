import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { LeadsTable } from '@/components/dashboard/LeadsTable'

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user?.contractorId) redirect('/login')

  const LIMIT = 100

  const [leads, totalCount, subscription] = await Promise.all([
    prisma.lead.findMany({
      where: { contractorId: session.user.contractorId },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
    }),
    prisma.lead.count({
      where: { contractorId: session.user.contractorId },
    }),
    prisma.subscription.findUnique({
      where: { contractorId: session.user.contractorId },
      select: { plan: true, status: true },
    }),
  ])

  const isPro = subscription?.plan === 'PRO' && ['active', 'trialing'].includes(subscription?.status ?? '')

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Leads</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">{totalCount} total leads collected</p>
      </div>
      <LeadsTable leads={leads} totalCount={totalCount} limit={LIMIT} isPro={isPro} />
    </div>
  )
}
