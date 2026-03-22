export function CinemaDemo() {
  return (
    <section className="py-24 bg-stone-900 border-y-2 border-stone-700">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Copy */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-10 bg-orange-500" />
              <span className="text-orange-500 text-sm font-black uppercase tracking-widest">Live Demo</span>
            </div>
            <h2 className="font-barlow font-black text-5xl md:text-6xl text-white uppercase leading-none mb-5">
              We Scan<br />
              The Home<br />
              <span className="text-orange-500">From Space</span>
            </h2>
            <p className="text-stone-400 text-lg leading-relaxed mb-6">
              The moment a homeowner enters their address, BetterRoofing pulls a live satellite image, measures the roof footprint, and detects the slope — automatically. No manual input. No guesswork.
            </p>
            <ul className="space-y-3">
              {[
                'Roof area measured from satellite imagery',
                'Slope detected from 3D building data',
                'Estimate calculated in under 10 seconds',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-stone-300 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Video frame */}
          <div className="relative">
            <div className="border-2 border-stone-600 bg-stone-800 shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-600 bg-stone-700">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                </div>
                <div className="flex-1 mx-3 bg-stone-600 rounded px-3 py-0.5">
                  <span className="text-stone-400 text-[10px] font-mono">betterroofing.co/estimate</span>
                </div>
              </div>

              {/* Video */}
              <div className="relative bg-[#050a14]" style={{ aspectRatio: '16/9' }}>
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/cinema-demo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            {/* Glow */}
            <div className="absolute -inset-4 bg-orange-500/5 blur-2xl -z-10 rounded-full" />
          </div>

        </div>
      </div>
    </section>
  )
}
