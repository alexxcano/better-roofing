'use client'

import Link from 'next/link'
import { ArrowRight, Mail, MessageSquare, Sparkles, Zap } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export function Hero() {
  return (
    <section className="relative bg-stone-50 bg-corrugated overflow-hidden border-b-2 border-stone-200">
      <div className="container max-w-6xl mx-auto px-4 pt-10 pb-24">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div className="relative z-10">

            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2 border border-stone-200 bg-white px-3 py-1.5 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-black uppercase tracking-widest text-stone-500">
                Join 500+ roofing contractors capturing leads 24/7
              </span>
            </div>

            <h1 className="font-barlow font-black text-6xl md:text-7xl lg:text-[82px] leading-none tracking-tight uppercase text-stone-900 mb-4">
              Capture Every<br />
              <span className="text-orange-500">Roofing Lead —</span><br />
              Even at 2AM
            </h1>

            {/* Callout line — elevated from buried position to direct subheadline */}
            <p className="text-lg font-black text-stone-800 border-l-4 border-orange-500 pl-3 mb-6 leading-snug">
              A contact form gets you a name.<br />
              An instant estimate gets you a buyer.
            </p>

            <p className="text-stone-600 text-lg leading-relaxed mb-8 max-w-md">
              Add a quote widget to your site. Homeowners get an instant estimate nights, weekends, and holidays. You get a scored lead with AI follow-up already written.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-3">
              <Link
                href="/signup"
                className="btn btn-primary px-8 py-4 text-base"
                onClick={() => trackEvent('cta_click', { location: 'hero' })}
              >
                Start Capturing Leads Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#live-demo"
                className="btn btn-ghost px-8 py-4 text-base"
                onClick={() => trackEvent('cta_click', { location: 'hero_demo' })}
              >
                Try It On Your Own Home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust signals split by CTA */}
            <div className="flex flex-col gap-0.5 mb-6">
              <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                14-day free trial · No credit card required · Cancel anytime
              </p>
              <p className="text-xs text-stone-400 font-semibold">
                Try the widget: No sign-up needed · Takes 30 seconds
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-orange-700">
                💡 One average job covers your subscription for 10+ years.
              </p>
              <p className="text-sm text-stone-500 font-semibold">
                ⭐⭐⭐⭐⭐ &ldquo;Got 3 leads the first week&rdquo; — Mike T., Denver CO
              </p>
            </div>
          </div>

          {/* Right — lead card */}
          <div className="flex flex-col gap-2">

            {/* Caption connecting the mockup to the demo CTA */}
            <p className="text-sm text-stone-500 font-semibold leading-snug">
              A homeowner requested a quote at{' '}
              <strong className="text-stone-700">11:47 PM</strong> — this is what
              lands in your dashboard while you sleep.
            </p>

            <div className="border-2 border-stone-300 overflow-hidden shadow-xl">

              {/* Lead card header */}
              <div className="px-4 py-3 bg-stone-100 border-b-2 border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">New Lead</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 border border-blue-200 bg-blue-50 px-1.5 py-0.5 leading-none">New</span>
                </div>
                <p className="text-[10px] font-semibold text-orange-500">just now</p>
              </div>

              <div className="bg-white p-4">
                {/* Score + name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="font-barlow font-black text-white text-lg leading-none">9</span>
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">Sarah Mitchell</p>
                    <p className="text-xs text-stone-500 mt-0.5">Insurance claim · <span className="text-blue-600 font-bold">🌩️ Hail damage</span> · Asphalt</p>
                    <p className="text-xs text-stone-400 mt-0.5">123 Main St, Austin, TX</p>
                  </div>
                  <div className="ml-auto text-right flex-shrink-0">
                    <p className="font-barlow font-black text-orange-600 text-lg leading-none">$13,800</p>
                    <p className="text-[10px] text-stone-400 font-semibold">avg estimate</p>
                  </div>
                </div>

                {/* Satellite callout */}
                <div className="flex items-center gap-1.5 mb-3 bg-stone-50 border border-stone-200 px-3 py-2">
                  <Zap className="h-3 w-3 text-orange-400 flex-shrink-0" />
                  <p className="text-[10px] text-stone-500 font-bold">Roof size auto-calculated from satellite · 28 squares detected</p>
                </div>

                {/* AI Lead Intelligence */}
                <div className="bg-stone-900 px-3 py-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3 w-3 text-orange-400 flex-shrink-0" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400">AI Lead Intelligence</p>
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      'Insurance claim — hail damage on the south side. High likelihood of full replacement approval.',
                      'Score 9/10 — top of your pipeline. Reach out today, insurance leads close faster within 24 hours.',
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

            {/* Below card nudge toward the demo */}
            <p className="text-xs text-center text-stone-400 font-semibold">
              Try the widget below — see exactly what your customers experience
            </p>

          </div>

        </div>
      </div>
    </section>
  )
}
