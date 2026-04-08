'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { ResolveTicketButton } from './AdminActions'

export type TicketDetail = {
  id: string
  subject: string
  message: string
  category: string
  status: string
  companyName: string | null
  plan: string | null
  userEmail: string
  pageUrl: string | null
  createdAt: Date
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  billing: 'Billing',
  feature: 'Feature Request',
  general: 'General',
}

const STATUS_CLASSES: Record<string, string> = {
  open:        'text-orange-600 border-orange-300 bg-orange-50',
  in_progress: 'text-blue-700 border-blue-200 bg-blue-50',
  resolved:    'text-green-700 border-green-200 bg-green-50',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2.5 border-b border-stone-100 last:border-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 w-28 shrink-0 pt-0.5">
        {label}
      </p>
      <div className="text-sm font-medium text-stone-800 flex-1 min-w-0">{value}</div>
    </div>
  )
}

export function TicketModal({ ticket }: { ticket: TicketDetail }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="text-left w-full group"
      >
        <p className="text-xs font-bold text-stone-900 truncate group-hover:text-orange-600 transition-colors">
          {ticket.subject}
        </p>
        {ticket.companyName && (
          <p className="text-[10px] text-stone-400 font-semibold truncate">
            {ticket.companyName}
          </p>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white border-2 border-stone-300 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="bg-stone-900 border-b-2 border-orange-500 px-5 py-4 flex items-start justify-between gap-4 flex-shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">
                  Support Ticket
                </p>
                <p className="font-barlow font-black text-lg uppercase text-white leading-tight">
                  {ticket.subject}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-white transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Meta strip */}
            <div className="px-5 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center gap-2 flex-wrap flex-shrink-0">
              <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 ${STATUS_CLASSES[ticket.status] ?? STATUS_CLASSES.open}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 text-stone-600 border-stone-300 bg-stone-50">
                {CATEGORY_LABELS[ticket.category] ?? ticket.category}
              </span>
              <span className="text-[10px] text-stone-400 font-semibold ml-auto">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Body */}
            <div className="overflow-auto flex-1 px-5 py-4">
              <div className="mb-5">
                <Row label="From" value={<a href={`mailto:${ticket.userEmail}`} className="text-orange-600 hover:underline">{ticket.userEmail}</a>} />
                {ticket.companyName && <Row label="Company" value={ticket.companyName} />}
                {ticket.plan && <Row label="Plan" value={<span className="font-black uppercase text-xs">{ticket.plan}</span>} />}
                {ticket.pageUrl && (
                  <Row
                    label="Page"
                    value={
                      <a href={ticket.pageUrl} target="_blank" rel="noreferrer" className="text-stone-500 hover:text-orange-600 text-xs break-all transition-colors">
                        {ticket.pageUrl}
                      </a>
                    }
                  />
                )}
              </div>

              {/* Message */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Message</p>
                <div className="border-l-4 border-orange-500 bg-stone-50 px-4 py-3">
                  <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {ticket.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            {ticket.status !== 'resolved' && (
              <div className="border-t-2 border-stone-200 px-5 py-3 flex items-center justify-between flex-shrink-0 bg-stone-50">
                <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide">
                  Mark as resolved to remove from queue
                </p>
                <ResolveTicketButton ticketId={ticket.id} onResolved={() => setOpen(false)} />
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
