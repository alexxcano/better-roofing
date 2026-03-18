import Link from 'next/link'
import { ArrowRight, HardHat, Mail, MessageSquare, Sparkles, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative bg-stone-50 bg-corrugated overflow-hidden border-b-2 border-stone-200">
      <div className="container max-w-6xl mx-auto px-4 pt-20 pb-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 px-4 py-2 mb-8">
              <HardHat className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 text-sm font-bold uppercase tracking-wide">
                Roofle & Demand IQ alternative — AI features they don&apos;t have
              </span>
            </div>

            <h1 className="font-barlow font-black text-6xl md:text-7xl lg:text-[82px] leading-none tracking-tight uppercase text-stone-900 mb-6">
              Stop Losing Jobs<br />
              <span className="text-orange-500">You Never</span><br />
              Knew About
            </h1>

            <p className="text-stone-600 text-xl leading-relaxed mb-10 max-w-md">
              Embed a 60-second quote widget on your site. Every lead gets scored, analyzed by AI, and arrives with a personalized follow-up already written — starting at $49/mo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/signup" className="btn btn-primary px-8 py-4 text-base">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#how-it-works" className="btn btn-secondary px-8 py-4 text-base">
                See How It Works
              </Link>
            </div>

            <p className="text-sm text-stone-400 uppercase tracking-wider font-semibold">
              14-day free trial · Card required · No charge until day 15
            </p>
          </div>

          {/* Right — the contractor's view */}
          <div className="flex flex-col gap-3">

            {/* Act 1: Homeowner submits */}
            <div className="border-2 border-stone-300 bg-white overflow-hidden">
              <div className="bg-stone-800 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span className="text-stone-400 text-[11px] font-bold uppercase tracking-widest">Instant Roof Estimate · acmeroofing.com</span>
                </div>
              </div>
              <div className="bg-orange-500 px-5 py-5">
                <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest mb-1">Estimate Ready</p>
                <p className="font-barlow font-black text-4xl text-white leading-none mb-1">$12,400 – $15,200</p>
                <p className="text-orange-200 text-xs font-semibold">Sarah M. · Asphalt shingles · 2,200 sq ft · Austin, TX</p>
              </div>
              <div className="px-5 py-3 bg-orange-50 border-t border-orange-200 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                <p className="text-xs text-orange-700 font-bold">Lead submitted — your dashboard just updated</p>
              </div>
            </div>

            {/* Arrow connector */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-px bg-stone-300" />
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">You receive</p>
              <div className="flex-1 h-px bg-stone-300" />
            </div>

            {/* Act 2: What the contractor gets */}
            <div className="border-2 border-stone-300 bg-white overflow-hidden">
              {/* Lead header */}
              <div className="px-4 py-3 bg-stone-100 border-b-2 border-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">New Lead</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 border border-blue-200 bg-blue-50 px-1.5 py-0.5 leading-none">New</span>
                </div>
                <p className="text-[10px] font-semibold text-orange-500">just now</p>
              </div>

              <div className="p-4">
                {/* Score + name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="font-barlow font-black text-white text-lg leading-none">9</span>
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">Sarah Mitchell</p>
                    <p className="text-xs text-stone-500 mt-0.5">Homeowner · Full replacement · <span className="text-red-600 font-bold">Emergency</span></p>
                    <p className="text-xs text-stone-400 mt-0.5">123 Main St, Austin, TX</p>
                  </div>
                  <div className="ml-auto text-right flex-shrink-0">
                    <p className="font-barlow font-black text-orange-600 text-lg leading-none">$13,800</p>
                    <p className="text-[10px] text-stone-400 font-semibold">avg estimate</p>
                  </div>
                </div>

                {/* AI Lead Intelligence */}
                <div className="bg-stone-900 px-3 py-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3 w-3 text-orange-400 flex-shrink-0" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400">AI Lead Intelligence</p>
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      'Homeowner with active leak — emergency replacement, not browsing.',
                      'Job value $13,800 avg. Score 9/10 — top of your pipeline.',
                      'Call within 2 hours. Emergency leads convert 3× faster same-day.',
                    ].map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1 w-1 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                        <p className="text-[10px] text-stone-300 leading-snug">{bullet}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI outreach */}
                <div className="border-t border-stone-100 pt-3 flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mr-1">AI draft ready</p>
                  <a className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide border-2 border-orange-500 text-orange-700 px-3 py-1.5 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer">
                    <Mail className="h-3 w-3" />
                    Open in Email
                  </a>
                  <a className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide border-2 border-stone-300 text-stone-600 px-3 py-1.5 hover:bg-stone-700 hover:text-white hover:border-stone-700 transition-colors cursor-pointer">
                    <MessageSquare className="h-3 w-3" />
                    Send SMS
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
