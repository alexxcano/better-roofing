export function CinemaDemo() {
  const demoId = process.env.NEXT_PUBLIC_DEMO_CONTRACTOR_ID

  return (
    <section id="live-demo" className="py-24 bg-stone-900 border-y-2 border-stone-700">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Copy */}
          <div className="md:pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-10 bg-orange-500" />
              <span className="text-orange-500 text-sm font-black uppercase tracking-widest">Try It Right Now</span>
            </div>
            <h2 className="font-barlow font-black text-5xl md:text-6xl text-white uppercase leading-none mb-5">
              This Is What<br />
              Your Homeowners<br />
              <span className="text-orange-500">Will See</span>
            </h2>
            <p className="text-stone-400 text-lg leading-relaxed mb-6">
              Enter any US address below and get a real roof estimate — satellite measurement, slope detection, and instant pricing. This is the exact widget your site visitors will use.
            </p>
            <ul className="space-y-3">
              {[
                'Live satellite roof measurement',
                'Slope auto-detected from 3D data',
                'Estimate calculated in under 10 seconds',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-stone-300 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Live widget frame */}
          <div className="relative">
            <div className="border-2 border-stone-600 bg-stone-800 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-600 bg-stone-700">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                </div>
                <div className="flex-1 mx-3 bg-stone-600 rounded px-3 py-0.5">
                  <span className="text-stone-400 text-[10px] font-mono">yoursite.com — live demo</span>
                </div>
              </div>

              {/* Iframe */}
              {demoId ? (
                <iframe
                  src={`/embed/${demoId}`}
                  className="w-full"
                  style={{ height: '620px', border: 'none' }}
                  title="BetterRoofing Live Demo"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center bg-stone-800 text-stone-500 text-sm" style={{ height: '620px' }}>
                  Demo not configured
                </div>
              )}
            </div>

            {/* Glow */}
            <div className="absolute -inset-4 bg-orange-500/5 blur-2xl -z-10 rounded-full" />
          </div>

        </div>
      </div>
    </section>
  )
}
