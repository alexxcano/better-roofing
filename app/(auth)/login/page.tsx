'use client'

import { Suspense, useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputClass =
  'w-full border-2 border-stone-300 bg-white text-stone-900 text-sm font-medium px-3 py-2.5 focus:outline-none focus:border-orange-500 placeholder:text-stone-400'

const STORAGE_KEY = 'br_last_provider'
type Provider = 'google' | 'password' | null

function getOAuthErrorMessage(error: string | null) {
  switch (error) {
    case 'OAuthAccountNotLinked':
      return 'That email already exists with a different sign-in method. Try Google or use your password.'
    case 'AccessDenied':
      return 'Google sign-in was denied for this account.'
    case 'Configuration':
      return 'Google sign-in is misconfigured. Check the OAuth client and callback URL settings.'
    default:
      return error ? 'Google sign-in could not be completed. Please try again.' : null
  }
}

function Banner({ variant, children }: { variant: 'error' | 'warn' | 'success'; children: React.ReactNode }) {
  const styles = {
    error:   'border-red-200 bg-red-50 text-red-700',
    warn:    'border-orange-200 bg-orange-50 text-orange-700',
    success: 'border-green-200 bg-green-50 text-green-700',
  }
  return (
    <div className={`border px-3 py-2 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const oauthError = searchParams.get('error')
  const reason = searchParams.get('reason')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [credError, setCredError] = useState<string | null>(null)
  const [lastProvider, setLastProvider] = useState<Provider>(null)

  const oauthErrorMessage = getOAuthErrorMessage(oauthError)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Provider
    if (saved === 'google' || saved === 'password') setLastProvider(saved)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCredError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      const msg = result.error
      if (msg === 'GOOGLE_ONLY') {
        setCredError('This account was created with Google. Use "Continue with Google" above to sign in.')
      } else if (msg.startsWith('Too many failed attempts')) {
        setCredError(msg)
      } else {
        setCredError('Invalid email or password.')
      }
      setLoading(false)
    } else {
      localStorage.setItem(STORAGE_KEY, 'password')
      router.push(callbackUrl)
    }
  }

  const handleGoogle = () => {
    setGoogleLoading(true)
    localStorage.setItem(STORAGE_KEY, 'google')
    signIn('google', { callbackUrl }, { prompt: 'select_account' })
  }

  return (
    <div className="border-2 border-stone-300 bg-white shadow-[6px_6px_0px_0px_#1c1917]">
      {/* Header */}
      <div className="px-7 py-5 border-b-2 border-stone-200 bg-stone-100">
        <h1 className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none">Welcome Back</h1>
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-wide mt-1">Sign in to your BetterRoofing account</p>
      </div>

      <div className="px-7 py-6 space-y-5">
        {/* Banners */}
        {reason === 'expired' && (
          <Banner variant="warn">Your session expired. Please sign in again.</Banner>
        )}
        {reason === 'password_reset' && (
          <Banner variant="success">Password updated. You can now sign in with your new password.</Banner>
        )}
        {oauthErrorMessage && (
          <Banner variant="error">{oauthErrorMessage}</Banner>
        )}
        {credError && (
          <Banner variant="error">{credError}</Banner>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className={`btn w-full py-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
            lastProvider === 'google'
              ? 'btn-primary ring-2 ring-orange-400 ring-offset-2'
              : 'btn-ghost'
          }`}
        >
          {googleLoading ? (
            <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
          {!googleLoading && lastProvider === 'google' && (
            <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5">
              Last used
            </span>
          )}
        </button>

        {lastProvider === 'google' && !credError && (
          <p className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-2">
            You signed in with Google last time. Use the button above to continue.
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Credentials form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-stone-600">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-widest text-stone-600">Password</label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-bold text-stone-400 hover:text-orange-600 uppercase tracking-widest transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary w-full py-3 ${lastProvider === 'google' ? 'opacity-40' : ''}`}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="px-7 py-4 border-t-2 border-stone-100 text-center">
        <p className="text-sm text-stone-500 font-semibold">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-bold">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
