import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { InstallClient } from './install-client'

export default async function InstallPage() {
  const session = await auth()
  if (!session?.user?.contractorId) redirect('/login')

  return <InstallClient contractorId={session.user.contractorId} />
}
