'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QualificationState {
  isHomeowner: string
  projectType: string
  urgency: string
}

interface StepQualificationProps {
  initial: QualificationState
  onComplete: (data: QualificationState) => void
}

function OptionButton({
  selected,
  onClick,
  emoji,
  label,
  description,
}: {
  selected: boolean
  onClick: () => void
  emoji: string
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3.5 rounded-lg border-2 text-left transition-all',
        selected
          ? 'border-orange-500 bg-orange-50'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      )}
    >
      <span className="text-xl flex-shrink-0">{emoji}</span>
      <div>
        <p className={cn('font-medium text-sm', selected ? 'text-orange-700' : 'text-slate-900')}>
          {label}
        </p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div className={cn(
        'ml-auto h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
        selected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
      )}>
        {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
    </button>
  )
}

export function StepQualification({ initial, onComplete }: StepQualificationProps) {
  const [form, setForm] = useState<QualificationState>(initial)

  const set = (key: keyof QualificationState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
          📋
        </div>
        <h2 className="text-xl font-semibold text-slate-900">A few quick questions</h2>
        <p className="text-slate-500 text-sm mt-1">Helps us give you the most accurate estimate</p>
      </div>

      {/* Homeowner */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Are you the homeowner?</p>
        <div className="space-y-2">
          <OptionButton selected={form.isHomeowner === 'yes'} onClick={() => set('isHomeowner', 'yes')} emoji="🏡" label="Yes, I own the home" />
          <OptionButton selected={form.isHomeowner === 'no'} onClick={() => set('isHomeowner', 'no')} emoji="🤝" label="No, I manage or represent the owner" />
          <OptionButton selected={form.isHomeowner === 'renter'} onClick={() => set('isHomeowner', 'renter')} emoji="🔑" label="I rent this property" />
        </div>
      </div>

      {/* Project type */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">What type of project?</p>
        <div className="space-y-2">
          <OptionButton selected={form.projectType === 'replacement'} onClick={() => set('projectType', 'replacement')} emoji="🏗️" label="Full roof replacement" description="Remove old roof and install new" />
          <OptionButton selected={form.projectType === 'repair'} onClick={() => set('projectType', 'repair')} emoji="🔧" label="Repair only" description="Fix specific damaged areas" />
        </div>
      </div>

      {/* Urgency */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">How soon do you need this done?</p>
        <div className="space-y-2">
          <OptionButton selected={form.urgency === 'emergency'} onClick={() => set('urgency', 'emergency')} emoji="🚨" label="Emergency — ASAP" description="Active leak or storm damage" />
          <OptionButton selected={form.urgency === 'soon'} onClick={() => set('urgency', 'soon')} emoji="📅" label="Within the next 3 months" />
          <OptionButton selected={form.urgency === 'browsing'} onClick={() => set('urgency', 'browsing')} emoji="🔍" label="Just getting prices for now" />
        </div>
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
        Continue
      </Button>
    </form>
  )
}
