'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const inputClass =
  'w-full border-2 border-stone-300 bg-white text-stone-900 text-sm font-medium px-3 py-2.5 focus:outline-none focus:border-orange-500 placeholder:text-stone-400'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.status === 429) {
      setError('Too many requests. Please wait before trying again.')
      setLoading(false)
      return
    }

    // Always show the success state — don't leak whether the email exists
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="border-2 border-stone-300 bg-white shadow-[6px_6px_0px_0px_#1c1917]">
        <div className="px-7 py-5 border-b-2 border-stone-200 bg-stone-100">
          <h1 className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none">Check Your Email</h1>
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mt-1">Reset link sent</p>
        </div>
        <div className="px-7 py-6 space-y-4">
          <p className="text-sm text-stone-600 font-semibold leading-relaxed">
            If <span className="text-stone-900 font-bold">{email}</span> has an account with a password, you'll receive a reset link shortly. Check your spam folder if it doesn't appear within a minute.
          </p>
          <p className="text-xs text-stone-400 font-semibold">The link expires in 1 hour.</p>
        </div>
        <div className="px-7 py-4 border-t-2 border-stone-100">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-stone-300 bg-white shadow-[6px_6px_0px_0px_#1c1917]">
      <div className="px-7 py-5 border-b-2 border-stone-200 bg-stone-100">
        <h1 className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none">Forgot Password</h1>
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mt-1">We'll send you a reset link</p>
      </div>

      <div className="px-7 py-6 space-y-5">
        {error && (
          <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-stone-600">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      </div>

      <div className="px-7 py-4 border-t-2 border-stone-100">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-stone-700">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
