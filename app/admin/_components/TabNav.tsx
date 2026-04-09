'use client'

import { useSearchParams, useRouter } from 'next/navigation'

const TABS = [
  { id: 'overview',     label: 'Overview'     },
  { id: 'leads',        label: 'Leads'        },
  { id: 'contractors',  label: 'Contractors'  },
  { id: 'revenue',      label: 'Revenue'      },
  { id: 'errors',       label: 'Errors'       },
]

export function TabNav() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  return (
    <nav className="flex items-stretch h-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => router.push(`/admin?tab=${tab.id}`)}
            className={`px-5 flex items-center text-xs font-black uppercase tracking-widest border-b-2 -mb-[2px] transition-colors ${
              isActive
                ? 'border-orange-500 text-white'
                : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-600'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
