'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Props {
  open: boolean
  onClose: () => void
  userEmail: string
  companyName: string
  plan: string
}

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'billing', label: 'Billing Issue' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Question' },
]

export function SupportDialog({ open, onClose, userEmail, companyName, plan }: Props) {
  const pathname = usePathname()
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setCategory('')
    setSubject('')
    setMessage('')
    setError('')
    setSubmitted(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) { setError('Please select a category.'); return }
    if (!subject.trim()) { setError('Please enter a subject.'); return }
    if (message.trim().length < 10) { setError('Message must be at least 10 characters.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subject: subject.trim(), message: message.trim(), pageUrl: pathname }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-[500px]">
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Request received</DialogTitle>
              <DialogDescription>
                We&apos;ll get back to you at <strong>{userEmail}</strong> as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Contact Support</DialogTitle>
              <DialogDescription>
                Fill out the form below and we&apos;ll get back to you shortly.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Pre-filled read-only context */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Account</Label>
                  <div className="px-3 py-2 text-sm bg-muted rounded-md text-muted-foreground truncate">
                    {userEmail}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <div className="px-3 py-2 text-sm bg-muted rounded-md text-muted-foreground truncate">
                    {companyName || '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Plan</Label>
                  <div className="px-3 py-2 text-sm bg-muted rounded-md text-muted-foreground">
                    {plan || '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Current page</Label>
                  <div className="px-3 py-2 text-sm bg-muted rounded-md text-muted-foreground truncate">
                    {pathname}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  maxLength={200}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  rows={5}
                  maxLength={5000}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/5000</p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
