import { TabNav } from './_components/TabNav'
import { OverviewTab } from './_components/OverviewTab'
import { LeadsTab } from './_components/LeadsTab'
import { ContractorsTab } from './_components/ContractorsTab'
import { RevenueTab } from './_components/RevenueTab'
import { AlertCards } from './_components/AlertCards'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string; status?: string; setup?: string }>
}) {
  const params = await searchParams
  const tab = params.tab || 'overview'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">
            Admin Dashboard
          </h1>
          <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">
            Platform overview
          </p>
        </div>
        <AlertCards />
      </div>

      <TabNav activeTab={tab} />

      <div className="pt-2">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'leads' && <LeadsTab />}
        {tab === 'contractors' && (
          <ContractorsTab search={params.search?.trim() || ''} status={params.status || ''} setup={params.setup || ''} />
        )}
        {tab === 'revenue' && <RevenueTab />}
      </div>
    </div>
  )
}
