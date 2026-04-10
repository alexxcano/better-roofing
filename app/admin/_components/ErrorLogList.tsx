'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle, EyeOff, RotateCcw, Trash2, ChevronDown, ChevronUp,
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

function extractHeadline(message: string): string {
  if (message.length <= 160) return message
  const match = message.match(/\.\s+([A-Z][^.]{10,}\.?\s*)$/)
  if (match && match[1].length < 200) return match[1].trim()
  return message.slice(0, 160).trimEnd() + '…'
}

function relativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export function ErrorLogList({ errors }: { errors: ErrorLog[] }) {
  const router = useRouter()
  const [filter, setFilter]             = useState<Filter>('open')
  const [loadingId, setLoadingId]       = useState<string | null>(null)
  const [expandedMsg, setExpandedMsg]   = useState<Set<string>>(new Set())
  const [expandedStack, setExpandedStack] = useState<Set<string>>(new Set())

  const counts = {
    open:     errors.filter((e) => e.status === 'open').length,
    resolved: errors.filter((e) => e.status === 'resolved').length,
    ignored:  errors.filter((e) => e.status === 'ignored').length,
    all:      errors.length,
  }

  const filtered = filter === 'all' ? errors : errors.filter((e) => e.status === filter)

  function toggleMsg(id: string) {
    setExpandedMsg((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleStack(id: string) {
    setExpandedStack((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

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
      {/* Header */}
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
                <span className="ml-1 opacity-60">({counts[id]})</span>
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
            const isError        = log.level === 'error'
            const isOpen         = log.status === 'open'
            const msgExpanded    = expandedMsg.has(log.id)
            const stackExpanded  = expandedStack.has(log.id)
            const isLongMessage  = log.message.length > 160
            const headline       = extractHeadline(log.message)
            const isLoading      = loadingId === log.id

            const meta = log.meta
              ? (() => { try { return JSON.parse(log.meta) } catch { return null } })()
              : null

            // Left border color signals severity at a glance
            const borderAccent = !isOpen
              ? 'border-l-stone-200'
              : isError
                ? 'border-l-red-500'
                : 'border-l-orange-400'

            return (
              <div
                key={log.id}
                className={`pl-4 pr-5 py-4 border-l-[3px] ${borderAccent} ${!isOpen ? 'opacity-55' : ''}`}
              >
                {/* Row 1: context + level + timestamp + actions */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {/* Severity — primary signal */}
                    <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 border flex-shrink-0 ${
                      isError
                        ? 'text-red-600 border-red-200 bg-red-50'
                        : 'text-orange-600 border-orange-200 bg-orange-50'
                    }`}>
                      {log.level}
                    </span>
                    {/* Context — secondary */}
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 flex-shrink-0">
                      {log.context}
                    </span>
                    {/* Status badge — only when not open */}
                    {log.status === 'resolved' && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-700 border border-green-200 bg-green-50 px-1.5 py-0.5 flex-shrink-0">
                        resolved
                      </span>
                    )}
                    {log.status === 'ignored' && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 border border-stone-200 bg-stone-100 px-1.5 py-0.5 flex-shrink-0">
                        ignored
                      </span>
                    )}
                  </div>

                  {/* Timestamp + inline actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[10px] text-stone-400 font-semibold tabular-nums"
                      title={new Date(log.createdAt).toLocaleString()}
                    >
                      {relativeTime(log.createdAt)}
                    </span>
                    <InlineActions
                      id={log.id}
                      status={log.status}
                      loading={isLoading}
                      onUpdateStatus={updateStatus}
                      onDelete={deleteLog}
                    />
                  </div>
                </div>

                {/* Row 2: message headline */}
                <div className="mb-1.5">
                  {msgExpanded ? (
                    <pre className="text-xs text-stone-600 bg-stone-50 border border-stone-200 p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono mb-1">
                      {log.message}
                    </pre>
                  ) : (
                    <p className="text-sm font-semibold text-stone-800 leading-snug">
                      {headline}
                    </p>
                  )}
                  {isLongMessage && (
                    <button
                      onClick={() => toggleMsg(log.id)}
                      className="mt-0.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {msgExpanded
                        ? <><ChevronUp className="h-3 w-3" /> Collapse</>
                        : <><ChevronDown className="h-3 w-3" /> Full message</>
                      }
                    </button>
                  )}
                </div>

                {/* Row 3: metadata chips — only if present */}
                {(meta || log.userId) && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {log.userId && (
                      <MetaChip label="user" value={log.userId} />
                    )}
                    {meta && Object.entries(meta).map(([k, v]) => (
                      <MetaChip key={k} label={k} value={String(v)} />
                    ))}
                  </div>
                )}

                {/* Row 4: stack trace */}
                {log.stack && (
                  <div className="mt-1">
                    <button
                      onClick={() => toggleStack(log.id)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {stackExpanded
                        ? <><ChevronUp className="h-3 w-3" /> Hide stack</>
                        : <><ChevronDown className="h-3 w-3" /> Stack trace</>
                      }
                    </button>
                    {stackExpanded && (
                      <pre className="mt-1.5 text-[10px] text-stone-500 bg-stone-50 border border-stone-200 p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono">
                        {log.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-stone-50 border border-stone-200 px-2 py-0.5 text-stone-600 max-w-[240px] truncate">
      <span className="font-black text-stone-400 uppercase flex-shrink-0">{label}</span>
      <span className="truncate">{value}</span>
    </span>
  )
}

function InlineActions({
  id, status, loading, onUpdateStatus, onDelete,
}: {
  id: string
  status: string
  loading: boolean
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  if (loading) {
    return <span className="text-[10px] text-stone-400 font-black tracking-widest">···</span>
  }

  return (
    <div className="flex items-center gap-0.5">
      {status !== 'resolved' && (
        <ActionBtn
          onClick={() => onUpdateStatus(id, 'resolved')}
          title="Mark resolved"
          className="text-green-600 hover:bg-green-50"
        >
          <CheckCircle className="h-3.5 w-3.5" />
        </ActionBtn>
      )}
      {status !== 'ignored' && (
        <ActionBtn
          onClick={() => onUpdateStatus(id, 'ignored')}
          title="Ignore"
          className="text-stone-400 hover:bg-stone-100"
        >
          <EyeOff className="h-3.5 w-3.5" />
        </ActionBtn>
      )}
      {status !== 'open' && (
        <ActionBtn
          onClick={() => onUpdateStatus(id, 'open')}
          title="Reopen"
          className="text-stone-500 hover:bg-stone-100"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </ActionBtn>
      )}
      <ActionBtn
        onClick={() => onDelete(id)}
        title="Delete"
        className="text-red-400 hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </ActionBtn>
    </div>
  )
}

function ActionBtn({
  onClick, title, className, children,
}: {
  onClick: () => void
  title: string
  className: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1 rounded transition-colors ${className}`}
    >
      {children}
    </button>
  )
}
