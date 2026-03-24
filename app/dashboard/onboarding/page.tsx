import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from './onboarding-wizard'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.contractorId) redirect('/login')

  const contractor = await prisma.contractor.findUnique({
    where: { id: session.user.contractorId },
    select: { companyName: true, onboardingCompleted: true },
  })

  if (contractor?.onboardingCompleted) redirect('/dashboard')

  return (
    <OnboardingWizard
      contractorId={session.user.contractorId}
      companyName={contractor?.companyName ?? 'Your Company'}
      userName={session.user.name ?? ''}
    />
  )
}
