'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle, AlertTriangle, CheckCircle, EyeOff,
  RotateCcw, Trash2, ChevronDown,
} from 'lucide-react'

type ErrorLog = {
  id: string
  level: string
  context: string
  message: string
  stack: string | null
  userId: string | null
  meta: string | null
  status: string
  resolvedAt: Date | null
  createdAt: Date
}

type Filter = 'open' | 'resolved' | 'ignored' | 'all'

export function ErrorLogList({ errors }: { errors: ErrorLog[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('open')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const counts = {
    open:     errors.filter((e) => e.status === 'open').length,
    resolved: errors.filter((e) => e.status === 'resolved').length,
    ignored:  errors.filter((e) => e.status === 'ignored').length,
    all:      errors.length,
  }

  const filtered = filter === 'all' ? errors : errors.filter((e) => e.status === filter)

  async function updateStatus(id: string, status: string) {
    setLoadingId(id)
    await fetch(`/api/admin/errors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function deleteLog(id: string) {
    setLoadingId(id)
    await fetch(`/api/admin/errors/${id}`, { method: 'DELETE' })
    setLoadingId(null)
    router.refresh()
  }

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'open',     label: 'Open'     },
    { id: 'resolved', label: 'Resolved' },
    { id: 'ignored',  label: 'Ignored'  },
    { id: 'all',      label: 'All'      },
  ]

  return (
    <div className="border border-stone-300 bg-white">
      {/* Header with filter tabs */}
      <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-stone-600">Error Log</p>
        <div className="flex items-center gap-1">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border transition-colors ${
                filter === id
                  ? 'border-stone-800 bg-stone-800 text-white'
                  : 'border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700'
              }`}
            >
              {label}
              {counts[id] > 0 && (
                <span className="ml-1 opacity-70">({counts[id]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-10 text-sm text-stone-400 font-semibold uppercase tracking-wide text-center">
          {filter === 'open' ? 'No open errors — all clear' : `No ${filter} errors`}
        </p>
      ) : (
        <div className="divide-y divide-stone-100">
          {filtered.map((log) => {
            const isError = log.level === 'error'
            const meta = log.meta
              ? (() => { try { return JSON.parse(log.meta) } catch { return null } })()
              : null

            return (
              <div
                key={log.id}
                className={`px-5 py-4 transition-opacity ${log.status !== 'open' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    {isError
                      ? <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      : <AlertTriangle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                    }
                    <span className={`text-[10px] font-black uppercase tracking-widest border px-1.5 py-0.5 flex-shrink-0 ${
                      isError
                        ? 'text-red-600 border-red-200 bg-red-50'
                        : 'text-orange-600 border-orange-200 bg-orange-50'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 border border-stone-200 bg-stone-50 px-1.5 py-0.5 flex-shrink-0">
                      {log.context}
                    </span>
                    {log.status === 'resolved' && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-700 border border-green-200 bg-green-50 px-1.5 py-0.5 flex-shrink-0">
                        resolved
                      </span>
                    )}
                    {log.status === 'ignored' && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 border border-stone-200 bg-stone-100 px-1.5 py-0.5 flex-shrink-0">
                        ignored
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-[10px] text-stone-400 font-semibold">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                    <ActionDropdown
                      id={log.id}
                      status={log.status}
                      loading={loadingId === log.id}
                      onUpdateStatus={updateStatus}
                      onDelete={deleteLog}
                    />
                  </div>
                </div>

                <p className="text-sm font-semibold text-stone-800 mb-1">{log.message}</p>

                {meta && (
                  <div className="flex flex-wrap gap-3 mb-1.5">
                    {Object.entries(meta).map(([k, v]) => (
                      <span key={k} className="text-[10px] font-semibold text-stone-500">
                        <span className="font-black text-stone-400 uppercase">{k}:</span> {String(v)}
                      </span>
                    ))}
                  </div>
                )}

                {log.userId && (
                  <p className="text-[10px] text-stone-400 font-semibold">user: {log.userId}</p>
                )}

                {log.stack && (
                  <details className="mt-2">
                    <summary className="text-[10px] font-black uppercase tracking-widest text-stone-400 cursor-pointer hover:text-stone-600">
                      Stack trace
                    </summary>
                    <pre className="mt-1.5 text-[10px] text-stone-500 bg-stone-50 border border-stone-200 p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                      {log.stack}
                    </pre>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ActionDropdown({
  id, status, loading, onUpdateStatus, onDelete,
}: {
  id: string
  status: string
  loading: boolean
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-stone-500 border border-stone-300 px-2 py-1 hover:border-stone-500 hover:text-stone-700 transition-colors disabled:opacity-40"
      >
        {loading ? '···' : 'Actions'}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-stone-300 shadow-[2px_2px_0px_0px_#1c1917] w-44">
            {status !== 'resolved' && (
              <button
                onClick={() => { setOpen(false); onUpdateStatus(id, 'resolved') }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-green-700 hover:bg-green-50 transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                Mark Resolved
              </button>
            )}
            {status !== 'ignored' && (
              <button
                onClick={() => { setOpen(false); onUpdateStatus(id, 'ignored') }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <EyeOff className="h-3.5 w-3.5 flex-shrink-0" />
                Ignore
              </button>
            )}
            {status !== 'open' && (
              <button
                onClick={() => { setOpen(false); onUpdateStatus(id, 'open') }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 flex-shrink-0" />
                Reopen
              </button>
            )}
            <div className="border-t border-stone-200" />
            <button
              onClick={() => { setOpen(false); onDelete(id) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 flex-shrink-0" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
