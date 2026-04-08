'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

const PAGE_SIZE = 5

export type AlertRow = {
  id: string
  primary: string
  secondary?: string
  badge: string
  badgeVariant: 'orange' | 'stone' | 'red'
}

export function AlertPanel({
  header,
  rows,
  emptyMessage,
}: {
  header: ReactNode
  rows: AlertRow[]
  emptyMessage: string
}) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const visible = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="border border-stone-300 bg-white">
      {header}

      <div className="divide-y divide-stone-100">
        {rows.length === 0 ? (
          <p className="px-5 py-4 text-xs text-stone-400 font-semibold uppercase tracking-wide">
            {emptyMessage}
          </p>
        ) : (
          visible.map((row) => (
            <div key={row.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">{row.primary}</p>
                {row.secondary && (
                  <p className="text-xs text-stone-400 font-semibold mt-0.5 truncate capitalize">
                    {row.secondary}
                  </p>
                )}
              </div>
              <span
                className={`text-xs font-black border px-2 py-0.5 shrink-0 ${
                  row.badgeVariant === 'orange'
                    ? 'text-orange-600 border-orange-300 bg-orange-50'
                    : row.badgeVariant === 'red'
                      ? 'text-red-600 border-red-300 bg-red-50'
                      : 'text-stone-700 border-stone-300 bg-stone-100'
                }`}
              >
                {row.badge}
              </span>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-2.5 border-t-2 border-stone-200 bg-stone-50 flex items-center justify-between">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} of {rows.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border border-stone-300 text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="text-[10px] font-bold text-stone-400 px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages - 1}
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border border-stone-300 text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
