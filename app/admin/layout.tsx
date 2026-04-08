import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { TabNav } from './_components/TabNav'

function TabNavFallback() {
  return (
    <nav className="flex items-stretch h-full">
      {['Overview', 'Leads', 'Contractors', 'Revenue'].map((label) => (
        <div
          key={label}
          className="px-5 flex items-center text-xs font-black uppercase tracking-widest text-stone-500"
        >
          {label}
        </div>
      ))}
    </nav>
  )
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-50 bg-corrugated">
      <header className="bg-stone-900 text-white px-6 flex items-stretch justify-between border-b-2 border-orange-500 h-14">
        {/* Left: logo + brand */}
        <div className="flex items-center gap-3">
          <Image src="/Logo-nobg.png" alt="BetterRoofing" width={32} height={32} className="h-7 w-auto" />
          <Link href="/" className="font-barlow font-black text-white uppercase tracking-wide text-base">
            BetterRoofing
          </Link>
          <span className="text-stone-600 font-bold">/</span>
          <span className="text-xs font-black uppercase tracking-widest text-orange-400 border border-orange-500/40 px-2 py-0.5">
            Admin
          </span>
        </div>

        {/* Center: tab nav */}
        <Suspense fallback={<TabNavFallback />}>
          <TabNav />
        </Suspense>

        {/* Right: back to dashboard */}
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-wide text-stone-400 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="p-8">{children}</main>
    </div>
  )
}
