'use client'

import { useState } from 'react'
import { MapPin, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete'

interface Location {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  serviceRadiusMiles: number
}

interface LocationsClientProps {
  initialLocations: Location[]
  outOfAreaBehavior: 'GATE' | 'FLAG'
  isStarter: boolean
}

const inputClass = 'w-full border-2 border-stone-300 bg-white text-stone-900 text-sm font-medium px-3 py-2 focus:outline-none focus:border-orange-500 placeholder:text-stone-400'

function LocationRow({
  location,
  onDelete,
  onUpdate,
}: {
  location: Location
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<Location>) => void
}) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: location.name,
    address: location.address,
    lat: location.lat,
    lng: location.lng,
    serviceRadiusMiles: location.serviceRadiusMiles,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/locations/${location.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      onUpdate(location.id, updated)
      setEditing(false)
      toast({ title: 'Location updated' })
    } else {
      toast({ title: 'Error', description: 'Failed to update location', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Remove "${location.name}"?`)) return
    setDeleting(true)
    const res = await fetch(`/api/locations/${location.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete(location.id)
      toast({ title: 'Location removed' })
    } else {
      toast({ title: 'Error', description: 'Failed to remove location', variant: 'destructive' })
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div className="border-t border-stone-200 bg-orange-50/50 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Location Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className={inputClass}
              placeholder="Austin HQ"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Service Radius (miles)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={form.serviceRadiusMiles}
              onChange={(e) => setForm((s) => ({ ...s, serviceRadiusMiles: parseFloat(e.target.value) }))}
              className={inputClass}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Address</label>
          <AddressAutocomplete
            value={form.address}
            onChange={(v) => setForm((s) => ({ ...s, address: v }))}
            onSelect={(d) => setForm((s) => ({ ...s, ...d }))}
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn btn-primary px-4 py-1.5">
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => setEditing(false)} className="btn btn-ghost px-4 py-1.5">
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-stone-200 flex items-center gap-4 px-4 py-3 hover:bg-stone-50 transition-colors group">
      <div className="h-8 w-8 bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
        <MapPin className="h-4 w-4 text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-stone-900 text-sm">{location.name}</p>
        <p className="text-xs text-stone-400 truncate mt-0.5">{location.address}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-xs font-black uppercase tracking-widest text-stone-500 border border-stone-300 bg-stone-100 px-2 py-0.5">
          {location.serviceRadiusMiles} mi radius
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function LocationsClient({ initialLocations, outOfAreaBehavior: initialBehavior, isStarter }: LocationsClientProps) {
  const { toast } = useToast()
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [behavior, setBehavior] = useState<'GATE' | 'FLAG'>(initialBehavior)
  const [savingBehavior, setSavingBehavior] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '',
    address: '',
    lat: 0,
    lng: 0,
    serviceRadiusMiles: 50,
  })

  const handleBehaviorChange = async (val: 'GATE' | 'FLAG') => {
    setSavingBehavior(true)
    setBehavior(val)
    await fetch('/api/contractor/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outOfAreaBehavior: val }),
    })
    toast({ title: val === 'GATE' ? 'Hard gate enabled' : 'Soft flag enabled' })
    setSavingBehavior(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.lat || !newForm.lng) {
      toast({ title: 'Select an address from the dropdown', variant: 'destructive' })
      return
    }
    setAdding(true)
    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    })
    if (res.ok) {
      const created = await res.json()
      setLocations((prev) => [...prev, created])
      setNewForm({ name: '', address: '', lat: 0, lng: 0, serviceRadiusMiles: 50 })
      setShowAdd(false)
      toast({ title: 'Location added' })
    } else {
      toast({ title: 'Error', description: 'Failed to add location', variant: 'destructive' })
    }
    setAdding(false)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Service Locations</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">
          Define where you work — leads outside your radius are filtered automatically
        </p>
      </div>

      {/* Out-of-area behavior */}
      <div className="border-2 border-stone-300 bg-white">
        <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">Out-of-Area Behavior</p>
          <p className="text-xs text-stone-400 font-semibold mt-0.5">What happens when a homeowner outside your service area uses the widget</p>
        </div>
        <div className="p-5 space-y-3">
          {([
            {
              val: 'GATE' as const,
              title: 'Hard Gate',
              desc: 'Show a dead-end screen. Out-of-area homeowners cannot submit a lead. Clean pipeline, no noise.',
              icon: '🚧',
            },
            {
              val: 'FLAG' as const,
              title: 'Soft Flag',
              desc: 'Let them through and capture the lead, but mark it as out-of-area in your dashboard. Good for tracking expansion demand.',
              icon: '🚩',
            },
          ] as const).map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => handleBehaviorChange(opt.val)}
              disabled={savingBehavior}
              className={`w-full text-left flex items-start gap-4 p-4 border-2 transition-colors ${
                behavior === opt.val
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm uppercase tracking-wide text-stone-900">{opt.title}</p>
                  {behavior === opt.val && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 border border-orange-400 bg-orange-50 px-1.5 py-0.5">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{opt.desc}</p>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 mt-1 ${behavior === opt.val ? 'border-orange-500 bg-orange-500' : 'border-stone-300'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Locations list */}
      <div className="border-2 border-stone-300 bg-white">
        <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Locations</p>
            <p className="text-xs text-stone-400 font-semibold mt-0.5">
              {locations.length === 0
                ? 'No locations yet — add one to enable service area filtering'
                : `${locations.length} location${locations.length !== 1 ? 's' : ''} configured`}
            </p>
          </div>
          {isStarter && locations.length >= 1 ? (
            <a href="/dashboard/billing" className="btn btn-ghost px-4 py-1.5 text-xs">
              Upgrade to Pro for multiple locations →
            </a>
          ) : (
            <button onClick={() => setShowAdd(true)} className="btn btn-primary px-4 py-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Location
            </button>
          )}
        </div>

        {/* Add form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="p-4 border-b-2 border-orange-200 bg-orange-50/40 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">New Location</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Location Name</label>
                <input
                  value={newForm.name}
                  onChange={(e) => setNewForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Austin HQ"
                  required
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Service Radius (miles)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newForm.serviceRadiusMiles}
                  onChange={(e) => setNewForm((s) => ({ ...s, serviceRadiusMiles: parseFloat(e.target.value) }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Address (select from dropdown)</label>
              <AddressAutocomplete
                value={newForm.address}
                onChange={(v) => setNewForm((s) => ({ ...s, address: v, lat: 0, lng: 0 }))}
                onSelect={(d) => setNewForm((s) => ({ ...s, ...d }))}
                className={inputClass}
              />
              {newForm.address && !newForm.lat && (
                <p className="text-[11px] text-orange-600 font-semibold">Select an address from the dropdown to confirm coordinates</p>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={adding} className="btn btn-primary px-4 py-1.5">
                <Check className="h-3.5 w-3.5" />
                {adding ? 'Adding...' : 'Add Location'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost px-4 py-1.5">
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </form>
        )}

        {locations.length === 0 && !showAdd ? (
          <div className="px-5 py-10 text-center">
            <MapPin className="h-8 w-8 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 font-semibold uppercase tracking-wide text-sm">No locations configured</p>
            <p className="text-stone-400 text-xs mt-1">All leads are accepted until you add a location</p>
          </div>
        ) : (
          locations.map((loc) => (
            <LocationRow
              key={loc.id}
              location={loc}
              onDelete={(id) => setLocations((prev) => prev.filter((l) => l.id !== id))}
              onUpdate={(id, data) => setLocations((prev) => prev.map((l) => l.id === id ? { ...l, ...data } : l))}
            />
          ))
        )}
      </div>

      {/* Info callout */}
      {locations.length > 0 && (
        <div className="border-l-4 border-stone-400 bg-white border border-stone-200 px-4 py-3">
          <p className="text-xs text-stone-500 font-semibold leading-relaxed">
            <span className="font-black text-stone-700">How it works:</span> When a homeowner enters their address in your widget,
            we calculate the distance to your nearest location. If they&apos;re outside your radius,
            the widget {behavior === 'GATE' ? 'shows a "we don\'t service your area" screen' : 'still collects their lead but flags it in your dashboard'}.
            Flagged leads are scored max 4/10 to keep them separated from your core pipeline.
          </p>
        </div>
      )}
    </div>
  )
}
