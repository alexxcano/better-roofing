import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-stone-900 border-t border-stone-800">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/Logo-nobg.png" alt="BetterRoofing" width={35} height={35} className="h-8 w-auto" />
              <span
                className="font-barlow font-black text-stone-500 text-base uppercase tracking-widest"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.04)' }}
              >BetterRoofing</span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">
              The instant quote platform built for roofing contractors. Quote. Lead. Close.
            </p>
            <a href="mailto:hello@betterroofing.co" className="text-xs text-stone-600 hover:text-orange-400 font-semibold uppercase tracking-widest transition-colors">
              hello@betterroofing.co
            </a>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs text-stone-600 font-black uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              {[
                { href: '#features', label: 'Features' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#testimonials', label: 'Results' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-500 hover:text-stone-300 font-medium transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs text-stone-600 font-black uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              <li><Link href="/login" className="text-sm text-stone-500 hover:text-stone-300 font-medium transition-colors">Log In</Link></li>
              <li>
                <Link href="/signup" className="text-sm text-orange-400 hover:text-orange-300 font-bold transition-colors">
                  Sign Up Free →
                </Link>
              </li>
              <li><a href="mailto:hello@betterroofing.co" className="text-sm text-stone-500 hover:text-stone-300 font-medium transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs text-stone-600 font-black uppercase tracking-widest mb-4">Resources</p>
            <ul className="space-y-2.5">
              <li><Link href="/docs" className="text-sm text-stone-500 hover:text-stone-300 font-medium transition-colors">Docs</Link></li>
              <li><Link href="/privacy" className="text-sm text-stone-500 hover:text-stone-300 font-medium transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-stone-500 hover:text-stone-300 font-medium transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600 font-semibold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} BetterRoofing. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-stone-600 hover:text-stone-400 font-semibold uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-stone-600 hover:text-stone-400 font-semibold uppercase tracking-widest transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
