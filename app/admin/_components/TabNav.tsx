'use client'

import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'leads', label: 'Leads' },
  { id: 'contractors', label: 'Contractors' },
  { id: 'revenue', label: 'Revenue' },
]

export function TabNav({ activeTab }: { activeTab: string }) {
  const router = useRouter()

  return (
    <div className="flex border-b-2 border-stone-300 -mb-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => router.push(`/admin?tab=${tab.id}`)}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 -mb-0.5 transition-colors ${
              isActive
                ? 'border-orange-500 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-600 hover:border-stone-300'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
