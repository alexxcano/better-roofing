'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'

const inputClass =
  'w-full border-2 border-stone-300 bg-white text-stone-900 text-sm font-medium px-3 py-2.5 focus:outline-none focus:border-orange-500 placeholder:text-stone-400'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <div className="border-2 border-stone-300 bg-white shadow-[6px_6px_0px_0px_#1c1917]">
        <div className="px-7 py-5 border-b-2 border-stone-200 bg-stone-100">
          <h1 className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none">Invalid Link</h1>
        </div>
        <div className="px-7 py-6">
          <p className="text-sm text-stone-600 font-semibold">This reset link is invalid. Please request a new one.</p>
        </div>
        <div className="px-7 py-4 border-t-2 border-stone-100">
          <Link href="/forgot-password" className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700">
            <ArrowLeft className="h-3.5 w-3.5" />
            Request new link
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    // Auto sign-in is not possible here since we don't know the email client-side.
    // Redirect to login with a success message.
    router.push('/login?reason=password_reset')
  }

  return (
    <div className="border-2 border-stone-300 bg-white shadow-[6px_6px_0px_0px_#1c1917]">
      <div className="px-7 py-5 border-b-2 border-stone-200 bg-stone-100">
        <h1 className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none">New Password</h1>
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mt-1">Choose a strong password</p>
      </div>

      <div className="px-7 py-6 space-y-5">
        {error && (
          <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}{' '}
            {error.includes('expired') && (
              <Link href="/forgot-password" className="underline font-bold">Request a new link</Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-stone-600">New Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              autoFocus
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-stone-600">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Saving…' : 'Set New Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
