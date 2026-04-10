import Link from 'next/link'

const testimonials = [
  {
    quote:
      "We were losing leads every night and weekend and didn't even know it. BetterRoofing captures them automatically. First month we had 14 leads we never would have gotten.",
    name: 'Marcus T.',
    company: 'Summit Roofing',
    location: 'Austin, TX',
    result: '14 new leads in month one',
    stars: 5,
  },
  {
    quote:
      "The lead scoring alone is worth the subscription. I know exactly who to call first. Emergency homeowner replacements at the top — tire-kickers at the bottom. My close rate is up.",
    name: 'Jennifer R.',
    company: 'Premier Roofing Co.',
    location: 'Denver, CO',
    result: 'Close rate is up',
    stars: 5,
  },
  {
    quote:
      "I used to spend half my week driving out to give estimates to people who were just price shopping. Now I check the score first. I only go out on 8s and 9s. My conversion on site visits has doubled.",
    name: 'Tony B.',
    company: 'Blue Ridge Roofing',
    location: 'Charlotte, NC',
    result: 'Site visit conversion doubled',
    stars: 5,
  },
  {
    quote:
      "I looked at Roofle. $350 a month plus a $2,000 setup fee — and they don't even write your follow-ups. BetterRoofing has the widget, lead scoring, and AI drafts for $97. I was live in 10 minutes. It's not close.",
    name: 'Dave K.',
    company: 'Keystone Roofing',
    location: 'Nashville, TN',
    result: 'More features at 1/4 the price',
    stars: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-stone-50 border-b border-stone-200">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-10 bg-orange-500" />
            <span className="text-orange-600 text-sm font-black uppercase tracking-widest">From Contractors</span>
          </div>
          <h2 className="font-barlow font-black text-5xl md:text-6xl text-stone-900 uppercase leading-none">
            Roofing Crews <span className="text-orange-500">Winning More Jobs</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white border-2 border-stone-200 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              {/* Orange top stripe */}
              <div className="h-1.5 bg-orange-500" />

              <div className="p-7 flex flex-col flex-1">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-orange-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-stone-700 text-sm leading-relaxed mb-6 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="border-t-2 border-stone-100 pt-4">
                  <p className="font-barlow font-black text-base text-stone-900 uppercase tracking-wide">{t.name}</p>
                  <p className="text-xs text-stone-500 font-semibold mt-0.5">{t.company} · {t.location}</p>
                  <div className="mt-3 border-l-4 border-orange-500 pl-3">
                    <p className="text-orange-700 text-xs font-bold uppercase tracking-wide">{t.result}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/signup" className="btn btn-primary px-8 py-4 text-base">
            Join them — Start Free →
          </Link>
        </div>

      </div>
    </section>
  )
}
