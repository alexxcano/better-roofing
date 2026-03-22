import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { InstallClient } from './install-client'

export default async function InstallPage() {
  const session = await auth()
  if (!session?.user?.contractorId) redirect('/login')
  const contractorId = session.user.contractorId

  const subscription = await prisma.subscription.findUnique({
    where: { contractorId },
    select: { plan: true, status: true },
  })
  const isPro =
    subscription?.plan === 'PRO' &&
    ['active', 'trialing'].includes(subscription?.status ?? '')

  return <InstallClient contractorId={contractorId} isPro={isPro} />
}
