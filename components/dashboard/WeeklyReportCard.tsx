'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

function WeeklyReportBody({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean)
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const headerMatch = line.match(/^\*\*(.*?)\*\*$/)
        if (headerMatch) {
          return (
            <p key={i} className="text-[10px] font-black uppercase tracking-widest text-orange-600 mt-4 first:mt-0">
              {headerMatch[1]}
            </p>
          )
        }
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="text-sm text-stone-700 leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-stone-900">{part}</strong> : part
            )}
          </p>
        )
      })}
    </div>
  )
}

interface WeeklyReportCardProps {
  report: string
  weekOf: Date
}

export function WeeklyReportCard({ report, weekOf }: WeeklyReportCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-2 border-stone-300 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3 bg-stone-900 border-b-2 border-stone-700 flex items-center justify-between hover:bg-stone-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-orange-500 rounded-full flex-shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest text-white">Weekly Intelligence Report</p>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
            Week of {new Date(weekOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-stone-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-6 py-5">
          <WeeklyReportBody text={report} />
        </div>
      )}
    </div>
  )
}
