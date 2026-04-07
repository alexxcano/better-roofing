'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { LeadScoreBadge } from './LeadScoreBadge'
import { Download, Search, MapPinOff, Mail, MessageSquare, Sparkles, X, ShieldCheck, Shield, Lock } from 'lucide-react'
import Link from 'next/link'
import { SatelliteMap } from '@/components/shared/SatelliteMap'
import type { Lead } from '@prisma/client'

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'Asphalt',
  metal: 'Metal',
  tile: 'Tile',
  flat: 'Flat/TPO',
}

const INSURANCE_LABELS: Record<string, { label: string; tableLabel: string; color: string }> = {
  yes:    { label: '🌩️ Insurance claim', tableLabel: '🌩️ Claim',       color: 'text-blue-700 bg-blue-50 border-blue-200' },
  no:     { label: '💰 Out of pocket',   tableLabel: '💰 Out of pocket', color: 'text-stone-600 bg-stone-50 border-stone-200' },
  unsure: { label: '🤷 Unsure',          tableLabel: '🤷 Unsure',        color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  new:       { label: 'New',       color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  quoted:    { label: 'Quoted',    color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  won:       { label: 'Won',       color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  lost:      { label: 'Lost',      color: 'bg-stone-100 text-stone-500 border-stone-200',    dot: 'bg-stone-400' },
}

function relativeTime(date: Date): { label: string; urgent: boolean } {
  const diff = Date.now() - new Date(date).getTime()
  const hours = diff / (1000 * 60 * 60)
  const days = hours / 24
  if (hours < 1) return { label: 'Just now', urgent: true }
  if (hours < 24) return { label: `${Math.floor(hours)}h ago`, urgent: true }
  if (days < 7) return { label: `${Math.floor(days)}d ago`, urgent: false }
  return { label: new Date(date).toLocaleDateString(), urgent: false }
}

const GRID = 'grid-cols-[96px_1fr_1fr_150px_90px_180px_130px]'

function StatusPill({
  status,
  leadId,
  onUpdate,
}: {
  status: string
  leadId: string
  onUpdate: (id: string, status: string) => void
}) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide border px-2 py-1 transition-colors ${cfg.color}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border-2 border-stone-300 shadow-lg min-w-[130px]">
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button
              key={key}
              onClick={(e) => {
                e.stopPropagation()
                onUpdate(leadId, key)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wide hover:bg-stone-50 transition-colors ${
                key === status ? 'bg-stone-50' : ''
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${val.dot}`} />
              {val.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusPillLarge({
  status,
  leadId,
  onUpdate,
}: {
  status: string
  leadId: string
  onUpdate: (id: string, status: string) => void
}) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(STATUS_CONFIG).map(([key, val]) => {
        const isActive = key === status
        return (
          <button
            key={key}
            onClick={(e) => { e.stopPropagation(); onUpdate(leadId, key) }}
            className={`flex flex-col items-center gap-1.5 px-2 py-3 border-2 transition-all ${
              isActive
                ? `${val.color} border-current font-black`
                : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${isActive ? val.dot : 'bg-stone-300'}`} />
            <span className="text-[10px] font-black uppercase tracking-wide leading-none">{val.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function LeadDrawer({
  lead,
  onClose,
  onStatusUpdate,
  isPro,
}: {
  lead: Lead
  onClose: () => void
  onStatusUpdate: (id: string, status: string) => void
  isPro: boolean
}) {
  const emailDraft = lead.aiEmailDraft ?? ''
  const smsDraft = lead.aiSmsDraft ?? ''
  const brief = lead.aiLeadBrief ?? ''

  const emailLines = emailDraft.split('\n')
  const subject = emailLines[0]?.startsWith('Subject:') ? emailLines[0].replace('Subject:', '').trim() : ''
  const body = subject ? emailLines.slice(2).join('\n').trim() : emailDraft

  const mailtoHref = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const smsHref = lead.phone
    ? `sms:${lead.phone.replace(/\D/g, '')}?body=${encodeURIComponent(smsDraft)}`
    : null

  const briefBullets = brief
    .split('\n')
    .map((l) => l.replace(/^•\s*/, '').trim())
    .filter(Boolean)

  const { label: timeLabel } = relativeTime(lead.createdAt)
  const insurance = INSURANCE_LABELS[lead.insuranceClaim ?? 'no']
  const [mapExpanded, setMapExpanded] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:max-w-lg bg-white z-50 flex flex-col shadow-2xl border-l-4 border-orange-500 overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 bg-stone-900 px-6 pt-5 pb-6 border-b-2 border-stone-700">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <LeadScoreBadge
                score={lead.leadScore}
                outOfArea={lead.outOfArea}
                showScore
              />
              {lead.outOfArea && (
                <span title="Out of area — this address is outside your configured service radius" className="text-[9px] font-black uppercase tracking-widest text-orange-400 border border-orange-600 bg-orange-950 px-1.5 py-0.5 cursor-help">OOA</span>
              )}
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors flex-shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="font-barlow font-black text-2xl text-white uppercase leading-none mb-1">{lead.name}</h2>
          <p className="text-stone-400 text-xs font-semibold">{lead.address}</p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-700">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-0.5">Estimate Range</p>
              <p className="text-orange-400 font-black text-xl leading-none">
                ${lead.estimateLow.toLocaleString()} – ${lead.estimateHigh.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-0.5">Received</p>
              <p className="text-stone-300 text-sm font-semibold">{timeLabel}</p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto bg-stone-50">

          {/* Satellite image */}
          {lead.lat && lead.lng && (
            <>
              <div
                className="relative overflow-hidden flex-shrink-0 cursor-zoom-in group"
                style={{ height: 200 }}
                onClick={() => setMapExpanded(true)}
              >
                <SatelliteMap lat={lead.lat} lng={lead.lng} zoom={19} className="absolute inset-0 w-full h-full" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-3">
                  <p className="text-white text-xs font-semibold">{lead.address}</p>
                </div>
                <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Expand ↗
                </div>
              </div>

              {/* Expanded map lightbox */}
              {mapExpanded && (
                <div
                  className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                  onClick={() => setMapExpanded(false)}
                >
                  <div className="relative w-full max-w-3xl aspect-square max-h-[80vh]">
                    <SatelliteMap lat={lead.lat!} lng={lead.lng!} zoom={19} className="w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
                      <p className="text-white text-sm font-semibold">{lead.address}</p>
                    </div>
                    <button
                      className="absolute top-3 right-3 bg-black/60 text-white hover:bg-black transition-colors p-2"
                      onClick={() => setMapExpanded(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI Brief */}
          {briefBullets.length > 0 && (
            <div className="bg-stone-900 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Lead Intelligence Brief</p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 border border-orange-700 bg-orange-950 px-2 py-0.5">AI</span>
              </div>
              <ul className="space-y-4">
                {briefBullets.map((bullet, i) => {
                  const labels = ['Situation', 'Job Value', 'Priority Action', 'Opening Line']
                  const colors = ['text-stone-400', 'text-orange-400', 'text-green-400', 'text-blue-400']
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {labels[i] && (
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${colors[i]}`}>{labels[i]}</p>
                        )}
                      </div>
                      <p className="text-sm text-stone-200 leading-relaxed">{bullet}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-6 py-5 grid grid-cols-2 gap-3 bg-white border-b border-stone-200">
            <a href={mailtoHref} className="btn btn-primary py-3 justify-center">
              <Mail className="h-3.5 w-3.5" />
              Send Email
            </a>
            {smsHref ? (
              <a href={smsHref} className="btn btn-secondary py-3 justify-center">
                <MessageSquare className="h-3.5 w-3.5" />
                Send SMS
              </a>
            ) : (
              <span className="btn btn-ghost py-3 justify-center opacity-40 cursor-not-allowed">
                No Phone
              </span>
            )}
          </div>

          {/* Pipeline status */}
          <div className="px-6 py-5 bg-white border-b border-stone-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Pipeline Status</p>
            <StatusPillLarge status={lead.status} leadId={lead.id} onUpdate={onStatusUpdate} />
          </div>

          {/* Lead details */}
          <div className="px-6 py-5 bg-white border-b border-stone-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Lead Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Detail label="Email" value={lead.email} />
              <Detail label="Phone" value={lead.phone ?? '—'} />
              <Detail label="Material" value={MATERIAL_LABELS[lead.materialType] ?? lead.materialType} />
              <Detail
                label="Roof Size"
                value={`${lead.roofSquares} squares${lead.homeSqft ? ` (${lead.homeSqft.toLocaleString()} sq ft)` : ''}`}
              />
            </div>

            {/* Insurance */}
            <div className={`flex items-center gap-3 border px-4 py-3 mt-5 ${insurance.color}`}>
              {(lead.insuranceClaim ?? 'no') === 'yes'
                ? <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                : <Shield className="h-4 w-4 flex-shrink-0 opacity-50" />
              }
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Insurance</p>
                <p className="text-sm font-bold">{insurance.label}</p>
              </div>
            </div>
          </div>

          {/* AI Drafts */}
          {isPro ? (
            (emailDraft || smsDraft) && (
              <div className="px-6 py-5 space-y-6 bg-white border-b border-stone-200">
                {emailDraft && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-3">AI Email Draft</p>
                    {subject && (
                      <p className="text-xs font-bold text-stone-500 mb-2">
                        Subject: <span className="text-stone-700 font-semibold normal-case">{subject}</span>
                      </p>
                    )}
                    <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed bg-stone-50 border-2 border-stone-200 p-4">{body}</p>
                  </div>
                )}
                {smsDraft && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">AI SMS Draft</p>
                      <span className="text-[10px] text-stone-400 font-semibold">{smsDraft.length} / 160 chars</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 border-2 border-stone-200 p-4">{smsDraft}</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="px-6 py-5 bg-white border-b border-stone-200">
              <div className="border-2 border-dashed border-stone-300 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Pro Feature</p>
                </div>
                <p className="text-sm font-bold text-stone-700 mb-1">AI-written follow-up drafts</p>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  Pro subscribers get a ready-to-send email and SMS draft for every lead — written specifically for this homeowner, their material, and their insurance situation.
                </p>
                <div className="space-y-2 mb-4 pointer-events-none select-none">
                  <div className="bg-stone-100 border border-stone-200 px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1.5">AI Email Draft</p>
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-stone-200 w-3/4" />
                      <div className="h-2.5 bg-stone-200 w-full" />
                      <div className="h-2.5 bg-stone-200 w-5/6" />
                      <div className="h-2.5 bg-stone-200 w-2/3" />
                    </div>
                  </div>
                  <div className="bg-stone-100 border border-stone-200 px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1.5">AI SMS Draft</p>
                    <div className="h-2.5 bg-stone-200 w-5/6" />
                  </div>
                </div>
                <Link href="/dashboard/billing" className="btn btn-primary px-4 py-2 text-xs">
                  Upgrade to Pro →
                </Link>
              </div>
            </div>
          )}

          <div className="h-10" />
        </div>
      </div>
    </>
  )
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-orange-600 font-bold' : 'text-stone-800'}`}>{value}</p>
    </div>
  )
}

interface LeadsTableProps {
  leads: Lead[]
  totalCount?: number
  limit?: number
  isPro?: boolean
}

const STATUS_FILTERS = [
  { value: 'active',    label: 'Active' },
  { value: 'new',       label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted',    label: 'Quoted' },
  { value: 'won',       label: 'Won' },
  { value: 'lost',      label: 'Lost' },
  { value: 'all',       label: 'All' },
]

export function LeadsTable({ leads: initialLeads, totalCount, limit, isPro = false }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [hideOutOfArea, setHideOutOfArea] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const outOfAreaCount = useMemo(() => leads.filter((l) => l.outOfArea).length, [leads])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return leads.filter((lead) => {
      if (statusFilter === 'active' && (lead.status === 'won' || lead.status === 'lost')) return false
      if (statusFilter !== 'active' && statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (hideOutOfArea && lead.outOfArea) return false
      if (!q) return true
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.address.toLowerCase().includes(q)
      )
    })
  }, [leads, search, statusFilter, hideOutOfArea])

  const handleStatusUpdate = useCallback(async (leadId: string, status: string) => {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l))
    // Keep drawer in sync
    setSelectedLead((prev) => prev?.id === leadId ? { ...prev, status } : prev)
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch {
      setLeads(initialLeads)
    }
  }, [initialLeads])

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3">
          {/* Search + export row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                placeholder="Search name, email, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border-2 border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>
            <a href="/api/leads/export" download className="btn btn-ghost px-3 py-2 flex-shrink-0">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center border-2 border-stone-300 bg-white divide-x divide-stone-300 overflow-x-auto">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-2 text-[11px] font-black uppercase tracking-wide transition-colors whitespace-nowrap ${
                    statusFilter === value
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {outOfAreaCount > 0 && (
              <button
                onClick={() => setHideOutOfArea((v) => !v)}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide border-2 px-3 py-2 transition-colors ${
                  hideOutOfArea
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                <MapPinOff className="h-3.5 w-3.5" />
                {hideOutOfArea ? 'In-area only' : `Hide OOA (${outOfAreaCount})`}
              </button>
            )}

            <p className="text-xs font-semibold text-stone-400 whitespace-nowrap ml-auto">
              <span className="text-stone-700 font-black">{filtered.length}</span>
              {filtered.length !== initialLeads.length && (
                <> of <span className="text-stone-700 font-black">{initialLeads.length}</span></>
              )}
              {' '}leads
            </p>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block border-2 border-stone-300 bg-white overflow-hidden">
          {/* Header */}
          <div className={`grid ${GRID} bg-stone-100 border-b-2 border-stone-300`}>
            {['Score', 'Name', 'Address', 'Insurance', 'Material', 'Estimate', 'Status'].map((h, i) => (
              <div key={i} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-stone-500 border-r border-stone-200 last:border-r-0">
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-stone-400 font-semibold uppercase tracking-wide text-sm">
                {search || hideOutOfArea || statusFilter !== 'all'
                  ? 'No leads match your filters'
                  : 'No leads yet — share your widget to start collecting leads'}
              </p>
            </div>
          ) : (
            filtered.map((lead, i) => {
              const { label: timeLabel, urgent } = relativeTime(lead.createdAt)
              const isSelected = selectedLead?.id === lead.id
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(isSelected ? null : lead)}
                  className={`grid ${GRID} border-t border-stone-200 cursor-pointer transition-colors active:translate-y-px active:brightness-95 ${
                    isSelected
                      ? 'bg-orange-50 border-l-2 border-l-orange-500'
                      : lead.outOfArea
                      ? 'opacity-60 hover:bg-stone-50'
                      : i % 2 === 1
                      ? 'bg-stone-50/50 hover:bg-orange-50/40'
                      : 'hover:bg-orange-50/40'
                  }`}
                >
                  <div className="px-4 py-3 border-r border-stone-100 flex items-center overflow-hidden">
                    <LeadScoreBadge score={lead.leadScore} outOfArea={lead.outOfArea} showScore />
                  </div>
                  <div className="px-4 py-3 border-r border-stone-100 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-bold text-stone-900 text-sm truncate">{lead.name}</p>
                      {lead.outOfArea && <span title="Out of area — this address is outside your configured service radius" className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-300 bg-orange-50 px-1 py-0.5 leading-none flex-shrink-0 cursor-help">OOA</span>}
                    </div>
                    <p className="text-[11px] text-stone-400 font-semibold mt-0.5 truncate">
                      <span className={urgent ? 'text-orange-500 font-bold' : ''}>{timeLabel}</span>
                    </p>
                  </div>
                  <div className="px-4 py-3 border-r border-stone-100 flex items-center min-w-0">
                    <p className="text-sm text-stone-600 truncate">{lead.address}</p>
                  </div>
                  <div className="px-4 py-3 border-r border-stone-100 flex items-center">
                    {(() => {
                      const ins = INSURANCE_LABELS[lead.insuranceClaim ?? 'no']
                      return (
                        <span className={`text-[10px] font-bold border px-2 py-1 whitespace-nowrap ${ins.color}`}>
                          {ins.tableLabel}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="px-4 py-3 border-r border-stone-100 flex items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wide border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-stone-600 whitespace-nowrap">
                      {MATERIAL_LABELS[lead.materialType] ?? lead.materialType}
                    </span>
                  </div>
                  <div className="px-4 py-3 border-r border-stone-100 flex items-center">
                    <span className="text-sm font-bold text-orange-600 whitespace-nowrap">
                      ${lead.estimateLow.toLocaleString()} – ${lead.estimateHigh.toLocaleString()}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center">
                    <StatusPill status={lead.status} leadId={lead.id} onUpdate={handleStatusUpdate} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Mobile card list */}
        <div className="md:hidden space-y-2">
          {filtered.length === 0 ? (
            <div className="border-2 border-stone-300 bg-white px-4 py-12 text-center">
              <p className="text-stone-400 font-semibold uppercase tracking-wide text-sm">
                {search || hideOutOfArea || statusFilter !== 'all'
                  ? 'No leads match your filters'
                  : 'No leads yet — share your widget to start collecting leads'}
              </p>
            </div>
          ) : (
            filtered.map((lead) => {
              const { label: timeLabel, urgent } = relativeTime(lead.createdAt)
              const isSelected = selectedLead?.id === lead.id
              const statusCfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(isSelected ? null : lead)}
                  className={`border-2 bg-white cursor-pointer transition-colors active:translate-y-px active:brightness-95 p-4 ${
                    isSelected ? 'border-orange-500 bg-orange-50' : 'border-stone-300'
                  } ${lead.outOfArea ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-black text-stone-900 text-base leading-none">{lead.name}</p>
                        {lead.outOfArea && <span title="Out of area — this address is outside your configured service radius" className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-300 bg-orange-50 px-1 py-0.5 leading-none cursor-help">OOA</span>}
                      </div>
                      <p className="text-xs text-stone-500 truncate">{lead.address}</p>
                      <p className="text-[11px] text-stone-400 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                        {(lead.insuranceClaim ?? 'no') === 'yes' && <span className="text-blue-600">🌩️ Claim ·</span>}
                        <span className={urgent ? 'text-orange-500 font-bold' : ''}>{timeLabel}</span>
                      </p>
                    </div>
                    <LeadScoreBadge score={lead.leadScore} outOfArea={lead.outOfArea} showScore />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                    <span className="text-sm font-bold text-orange-600">
                      ${lead.estimateLow.toLocaleString()} – ${lead.estimateHigh.toLocaleString()}
                    </span>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide border px-2 py-1 ${statusCfg.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Soft limit disclosure */}
      {limit && totalCount && totalCount > limit && (
        <p className="text-xs text-stone-400 font-semibold text-center pt-1">
          Showing the most recent {limit} leads · Use search or filters to find older ones, or{' '}
          <a href="/api/leads/export" download className="text-orange-600 hover:underline">export all {totalCount} to CSV</a>.
        </p>
      )}

      {/* Lead drawer */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusUpdate={handleStatusUpdate}
          isPro={isPro}
        />
      )}
    </>
  )
}
