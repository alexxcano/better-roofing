'use client'

import { useState } from 'react'

interface StepContactProps {
  onComplete: (data: { name: string; email: string; phone: string }) => void
}

const fieldClass =
  'w-full border-2 border-stone-200 bg-white px-3 py-3.5 text-[0.9375rem] text-stone-900 placeholder:text-stone-400 outline-none focus:border-orange-500 transition-colors'

export function StepContact({ onComplete }: StepContactProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900 leading-tight">Where should we send your estimate?</h2>
        <p className="text-stone-500 text-sm mt-1.5">A roofing expert will follow up with your detailed quote.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500">Full Name</p>
          <input
            name="name"
            placeholder="John Smith"
            value={form.name}
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500">Email Address</p>
          <input
            name="email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500">
            Phone <span className="text-stone-300 font-semibold normal-case tracking-normal">— optional</span>
          </p>
          <input
            name="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!form.name || !form.email}
        className="btn btn-primary w-full py-4 text-base font-black uppercase tracking-widest"
      >
        View My Estimate →
      </button>

      <p className="text-xs text-center text-stone-300">
        By submitting, you agree to be contacted about your roofing project.
      </p>
    </form>
  )
}
