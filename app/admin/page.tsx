import { OverviewTab } from './_components/OverviewTab'
import { LeadsTab } from './_components/LeadsTab'
import { ContractorsTab } from './_components/ContractorsTab'
import { RevenueTab } from './_components/RevenueTab'
import { ErrorsTab } from './_components/ErrorsTab'
import { AlertCards } from './_components/AlertCards'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string; status?: string; setup?: string }>
}) {
  const params = await searchParams
  const tab = params.tab || 'overview'

  return (
    <div className="space-y-5">
      {tab === 'overview' && (
        <>
          <AlertCards />
          <OverviewTab />
        </>
      )}
      {tab === 'leads' && <LeadsTab />}
      {tab === 'contractors' && (
        <ContractorsTab search={params.search?.trim() || ''} status={params.status || ''} setup={params.setup || ''} />
      )}
      {tab === 'revenue' && <RevenueTab />}
      {tab === 'errors' && <ErrorsTab />}
    </div>
  )
}
