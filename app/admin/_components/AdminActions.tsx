'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Variant = 'stone' | 'orange' | 'green'

const VARIANT_CLASSES: Record<Variant, string> = {
  stone:  'text-stone-600 border-stone-300 bg-stone-50 hover:bg-stone-200',
  orange: 'text-orange-600 border-orange-300 bg-orange-50 hover:bg-orange-100',
  green:  'text-green-700 border-green-200 bg-green-50 hover:bg-green-100',
}

function ActionBtn({
  onClick,
  children,
  variant = 'stone',
  title,
}: {
  onClick: () => Promise<void>
  children: React.ReactNode
  variant?: Variant
  title?: string
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handle = async () => {
    setState('loading')
    try {
      await onClick()
      setState('done')
      setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2500)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={state !== 'idle'}
      title={title}
      className={`text-[10px] font-black uppercase tracking-widest border px-2 py-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]}`}
    >
      {state === 'loading' ? '···' : state === 'done' ? '✓ Done' : state === 'error' ? '✗ Error' : children}
    </button>
  )
}

// ─── Ticket ───────────────────────────────────────────────────────────────────

export function ResolveTicketButton({ ticketId }: { ticketId: string }) {
  const router = useRouter()
  return (
    <ActionBtn
      variant="green"
      title="Mark ticket as resolved"
      onClick={async () => {
        const res = await fetch(`/api/admin/tickets/${ticketId}/resolve`, { method: 'POST' })
        if (!res.ok) throw new Error()
        router.refresh()
      }}
    >
      Resolve
    </ActionBtn>
  )
}

// ─── Trial ────────────────────────────────────────────────────────────────────

export function ExtendTrialButton({ contractorId }: { contractorId: string }) {
  const router = useRouter()
  return (
    <ActionBtn
      variant="orange"
      title="Extend trial by 7 days"
      onClick={async () => {
        const res = await fetch(`/api/admin/contractors/${contractorId}/extend-trial`, { method: 'POST' })
        if (!res.ok) throw new Error()
        router.refresh()
      }}
    >
      +7 Days
    </ActionBtn>
  )
}

export function SendReminderButton({
  contractorId,
  type,
  label,
}: {
  contractorId: string
  type: '3d' | 'expiry'
  label?: string
}) {
  const router = useRouter()
  return (
    <ActionBtn
      variant="stone"
      title={`Manually send the ${type} trial reminder email`}
      onClick={async () => {
        const res = await fetch(`/api/admin/contractors/${contractorId}/send-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        })
        if (!res.ok) throw new Error()
        router.refresh()
      }}
    >
      {label ?? (type === '3d' ? 'Send 3d' : 'Send Expiry')}
    </ActionBtn>
  )
}
