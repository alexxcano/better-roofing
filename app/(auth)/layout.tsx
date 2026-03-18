import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 bg-corrugated flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <Image src="/Logo-nobg.png" alt="BetterRoofing" width={40} height={40} className="h-10 w-auto" priority />
        <span className="font-barlow font-black text-stone-900 text-xl tracking-wider uppercase">BetterRoofing</span>
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
