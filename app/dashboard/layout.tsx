import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const contractor = session.user.contractorId
    ? await prisma.contractor.findUnique({
        where: { id: session.user.contractorId },
        select: { companyName: true },
      })
    : null

  return (
    <div className="flex min-h-screen">
      <DashboardNav
        companyName={contractor?.companyName ?? ''}
        userEmail={session.user.email ?? ''}
      />
      <main className="flex-1 bg-stone-50 bg-corrugated p-4 md:p-8 overflow-auto pt-[72px] md:pt-8">
        {children}
      </main>
    </div>
  )
}
