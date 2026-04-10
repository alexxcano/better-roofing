'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  Code2,
  LogOut,
  MapPin,
  Menu,
  X,
  LifeBuoy,
  BookOpen,
} from 'lucide-react'
import { SupportDialog } from './SupportDialog'

const STORAGE_KEY = 'br_last_provider'

const navItems: { href: string; label: string; icon: React.ElementType; external?: boolean }[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/locations', label: 'Locations', icon: MapPin },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/install', label: 'Install Widget', icon: Code2 },
]

export function DashboardNav({ companyName, userEmail, plan }: { companyName: string; userEmail: string; plan: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  const close = () => setMobileOpen(false)

  const logoBlock = (
    <div className="px-5 py-5 border-b border-stone-800">
      <Link href="/" onClick={close} className="flex items-center gap-2.5">
        <Image src="/Logo-nobg.png" alt="BetterRoofing" width={35} height={35} className="h-8 w-auto" />
        <span
          className="font-barlow font-black text-stone-500 text-base uppercase tracking-widest"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.04)' }}
        >
          BetterRoofing
        </span>
      </Link>
    </div>
  )

  const navLinks = (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {navItems.map((item) => {
        const isActive = !item.external && pathname === item.href
        const className = cn(
          'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors',
          isActive
            ? 'bg-orange-500 text-white'
            : 'text-stone-400 hover:text-white hover:bg-stone-800'
        )
        return item.external ? (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={className}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const signOutBtn = (
    <div className="px-3 py-4 border-t border-stone-800 space-y-0.5">
      <a
        href="/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-semibold uppercase tracking-wide text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
      >
        <BookOpen className="h-4 w-4" />
        Docs
      </a>
      <button
        onClick={() => { close(); setSupportOpen(true) }}
        className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-semibold uppercase tracking-wide text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
      >
        <LifeBuoy className="h-4 w-4" />
        Support
      </button>
      <button
        onClick={() => {
          localStorage.removeItem(STORAGE_KEY)
          signOut({ callbackUrl: '/' })
        }}
        className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-semibold uppercase tracking-wide text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  )

  return (
    <>
      <SupportDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        userEmail={userEmail}
        companyName={companyName}
        plan={plan}
      />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-stone-900 border-b-2 border-orange-500 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/Logo-nobg.png" alt="BetterRoofing" width={35} height={35} className="h-8 w-auto" />
          <span
            className="font-barlow font-black text-stone-500 text-base uppercase tracking-widest"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.04)' }}
          >
            BetterRoofing
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-stone-400 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-60 bg-stone-900 text-white flex flex-col border-r-2 border-orange-500',
          'fixed top-0 bottom-0 z-50 transition-transform duration-300',
          'md:sticky md:h-screen md:translate-x-0 md:flex-shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Desktop logo */}
        <div className="hidden md:block">
          {logoBlock}
        </div>

        {/* Mobile spacer (pushes nav below the fixed top bar) */}
        <div className="md:hidden h-14 flex-shrink-0" />

        {navLinks}
        {signOutBtn}
      </aside>
    </>
  )
}
