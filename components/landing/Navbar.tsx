import Link from 'next/link'
import Image from 'next/image'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-orange-500 bg-white/97 backdrop-blur shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/Logo-nobg.png" alt="BetterRoofing" width={40} height={40} className="h-10 w-auto" priority />
          <span className="font-barlow font-black text-stone-900 text-xl tracking-wider uppercase">BetterRoofing</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '#pain', label: 'How It Works' },
            { href: '#features', label: 'Features' },
            { href: '#pricing', label: 'Pricing' },
            { href: '#testimonials', label: 'Results' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-stone-500 hover:text-orange-600 uppercase tracking-wide transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-stone-500 hover:text-stone-800 font-semibold uppercase tracking-wide transition-colors px-3 py-2">
            Log In
          </Link>
          <Link href="/signup" className="btn btn-primary px-5 py-2">
            Try Free →
          </Link>
        </div>
      </div>
    </nav>
  )
}
