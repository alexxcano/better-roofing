'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface PricingSettings {
  pricePerSquare: number
  pricePerSquareAsphalt: number
  pricePerSquareMetal: number
  pricePerSquareTile: number
  pricePerSquareFlat: number
  wasteFactor: number
  tearOffCost: number
  offersAsphalt: boolean
  offersMetal: boolean
  offersTile: boolean
  offersFlat: boolean
}

interface ContractorSettings {
  notificationEmail: string
  webhookUrl: string
  bookingUrl: string
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black uppercase tracking-widest text-stone-600">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-400 font-semibold">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full border-2 border-stone-300 bg-white text-stone-900 text-sm font-medium px-3 py-2 focus:outline-none focus:border-orange-500 placeholder:text-stone-400'

export default function SettingsPage() {
  const { toast } = useToast()

  const [pricing, setPricing] = useState<PricingSettings>({
    pricePerSquare: 425,
    pricePerSquareAsphalt: 425,
    pricePerSquareMetal: 750,
    pricePerSquareTile: 650,
    pricePerSquareFlat: 500,
    wasteFactor: 1.12,
    tearOffCost: 1000,
    offersAsphalt: true,
    offersMetal: true,
    offersTile: true,
    offersFlat: false,
  })
  const [contractorSettings, setContractorSettings] = useState<ContractorSettings>({
    notificationEmail: '',
    webhookUrl: '',
    bookingUrl: '',
  })
  const [fetching, setFetching] = useState(true)
  const [savingPricing, setSavingPricing] = useState(false)
  const [savingIntegrations, setSavingIntegrations] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/pricing').then((r) => r.json()),
      fetch('/api/contractor/settings').then((r) => r.json()),
    ]).then(([pricingData, settingsData]) => {
      if (pricingData) setPricing(pricingData)
      if (settingsData) {
        setContractorSettings({
          notificationEmail: settingsData.notificationEmail ?? '',
          webhookUrl: settingsData.webhookUrl ?? '',
          bookingUrl: settingsData.bookingUrl ?? '',
        })
      }
    }).finally(() => setFetching(false))
  }, [])

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPricing(true)
    const res = await fetch('/api/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pricing),
    })
    if (res.ok) {
      toast({ title: 'Pricing saved', description: 'Your pricing settings have been updated.' })
    } else {
      toast({ title: 'Error', description: 'Failed to save pricing settings', variant: 'destructive' })
    }
    setSavingPricing(false)
  }

  const handleIntegrationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingIntegrations(true)
    const res = await fetch('/api/contractor/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractorSettings),
    })
    if (res.ok) {
      toast({ title: 'Settings saved', description: 'Notification and webhook settings updated.' })
    } else {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    }
    setSavingIntegrations(false)
  }

  if (fetching) {
    return (
      <div className="flex flex-col gap-4 h-[calc(100vh-88px)] md:h-[calc(100vh-64px)]">
        <div className="border-l-4 border-orange-500 pl-4 flex-shrink-0">
          <div className="h-8 w-32 bg-stone-200 animate-pulse" />
          <div className="h-4 w-56 bg-stone-200 animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="border-2 border-stone-200 bg-stone-100 animate-pulse" />
          <div className="border-2 border-stone-200 bg-stone-100 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-88px)] md:h-[calc(100vh-64px)]">
      {/* Page header */}
      <div className="border-l-4 border-orange-500 pl-4 flex-shrink-0">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Settings</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">Configure pricing, notifications, and integrations</p>
      </div>

      {/* Two-panel layout — both sections always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">

        {/* Left: Pricing Settings */}
        <div className="border-2 border-stone-300 bg-white flex flex-col overflow-hidden">
          <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300 flex-shrink-0">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Pricing Settings</p>
            <p className="text-xs text-stone-400 font-semibold mt-0.5">Set prices per material type (per 100 sq ft square)</p>
          </div>
          <form onSubmit={handlePricingSubmit} className="overflow-auto flex-1 p-5 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Roof Types Offered</p>
              <p className="text-xs text-stone-400 font-semibold mb-4">Toggle which types appear in your widget. Set a price per square (100 sq ft) for each.</p>
              <div className="border-2 border-stone-200 divide-y divide-stone-200">
                {[
                  { key: 'offersAsphalt' as const, priceKey: 'pricePerSquareAsphalt' as const, label: 'Asphalt Shingles', emoji: '🏠', hint: 'Most common residential shingle' },
                  { key: 'offersMetal'   as const, priceKey: 'pricePerSquareMetal'   as const, label: 'Metal Roofing',    emoji: '🔩', hint: 'Standing seam, corrugated' },
                  { key: 'offersTile'    as const, priceKey: 'pricePerSquareTile'    as const, label: 'Tile Roofing',     emoji: '🏛️', hint: 'Clay, concrete, slate' },
                  { key: 'offersFlat'    as const, priceKey: 'pricePerSquareFlat'    as const, label: 'Flat / TPO',       emoji: '▱',  hint: 'EPDM, TPO, mod bitumen' },
                ].map(({ key, priceKey, label, emoji, hint }) => {
                  const enabled = pricing[key]
                  return (
                    <div key={key} className={`grid grid-cols-[1fr_180px] items-center ${enabled ? 'bg-white' : 'bg-stone-50'}`}>
                      {/* Toggle + label */}
                      <button
                        type="button"
                        onClick={() => setPricing((s) => ({ ...s, [key]: !s[key] }))}
                        className="flex items-center gap-3 px-4 py-3 text-left w-full"
                      >
                        <div className={`h-5 w-9 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${enabled ? 'bg-orange-500' : 'bg-stone-300'}`}>
                          <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-lg leading-none">{emoji}</span>
                        <div>
                          <p className={`text-sm font-bold ${enabled ? 'text-stone-900' : 'text-stone-400'}`}>{label}</p>
                          <p className="text-xs text-stone-400">{hint}</p>
                        </div>
                      </button>
                      {/* Price input */}
                      <div className="px-4 py-3 border-l border-stone-200">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-400 text-sm font-semibold">$</span>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={pricing[priceKey]}
                            onChange={(e) => setPricing((s) => ({ ...s, [priceKey]: parseFloat(e.target.value) }))}
                            disabled={!enabled}
                            className={`${inputClass} ${!enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                          />
                          <span className="text-stone-400 text-xs font-semibold whitespace-nowrap">/sq</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Field label="Waste Factor" hint="Multiplier for material waste (typical: 1.10–1.20)">
              <input
                type="number"
                min="1"
                max="2"
                step="0.01"
                value={pricing.wasteFactor}
                onChange={(e) => setPricing((s) => ({ ...s, wasteFactor: parseFloat(e.target.value) }))}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Tear-Off Cost ($)" hint="Flat fee to remove old roofing (typical: $500–$2,000)">
              <input
                type="number"
                min="0"
                step="1"
                value={pricing.tearOffCost}
                onChange={(e) => setPricing((s) => ({ ...s, tearOffCost: parseFloat(e.target.value) }))}
                required
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              disabled={savingPricing}
              className="btn btn-primary px-6 py-2.5"
            >
              {savingPricing ? 'Saving...' : 'Save Pricing'}
            </button>
          </form>
        </div>

        {/* Right: Notifications & Integrations */}
        <div className="border-2 border-stone-300 bg-white flex flex-col overflow-hidden">
          <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300 flex-shrink-0">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Notifications & Integrations</p>
            <p className="text-xs text-stone-400 font-semibold mt-0.5">Get notified when new leads come in, connect to your CRM</p>
          </div>
          <form onSubmit={handleIntegrationsSubmit} className="overflow-auto flex-1 p-5 space-y-5">
            <Field label="Lead Notification Email" hint="We'll email you here every time a new lead submits the estimator. Leave blank to disable.">
              <input
                type="email"
                placeholder="you@company.com"
                value={contractorSettings.notificationEmail}
                onChange={(e) => setContractorSettings((s) => ({ ...s, notificationEmail: e.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Booking / Scheduling URL" hint='Calendly, Acuity, or any scheduling link. A "Book a Free Inspection" button will appear on the widget result screen.'>
              <input
                type="url"
                placeholder="https://calendly.com/your-company/inspection"
                value={contractorSettings.bookingUrl}
                onChange={(e) => setContractorSettings((s) => ({ ...s, bookingUrl: e.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Webhook URL" hint="We'll POST the full lead JSON to this URL when a lead is created. Works with Zapier, Make, or any custom endpoint.">
              <input
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={contractorSettings.webhookUrl}
                onChange={(e) => setContractorSettings((s) => ({ ...s, webhookUrl: e.target.value }))}
                className={inputClass}
              />
            </Field>

            {/* Webhook payload example */}
            <div className="border-l-4 border-stone-300 bg-stone-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Webhook Payload Example</p>
              <pre className="text-xs text-stone-500 overflow-x-auto leading-relaxed">{`{
  "id": "clx...",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "materialType": "asphalt",
  "roofSquares": 24.0,
  "estimateLow": 9200,
  "estimateHigh": 11200,
  "createdAt": "2025-03-15T..."
}`}</pre>
            </div>

            <button
              type="submit"
              disabled={savingIntegrations}
              className="btn btn-primary px-6 py-2.5"
            >
              {savingIntegrations ? 'Saving...' : 'Save Integrations'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
