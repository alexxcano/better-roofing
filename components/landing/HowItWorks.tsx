const steps = [
  {
    number: '01',
    time: '~2 min',
    title: 'Set your pricing',
    description:
      'Enter your price per square for asphalt, metal, tile, and flat/TPO. Toggle off any types you don\'t offer. Set your waste factor and tear-off cost. Your widget calculates real estimates from the start.',
  },
  {
    number: '02',
    time: '~3 min',
    title: 'Drop one line of code',
    description:
      'Copy your embed snippet from the dashboard. Paste it on your site — WordPress, Squarespace, Wix, custom HTML. No developer. No plugin. No phone call to us.',
  },
  {
    number: '03',
    time: 'Ongoing',
    title: 'Wake up to qualified leads',
    description:
      'Every estimate lands in your dashboard scored and ready to act on. Hot leads at the top — with AI-written follow-up emails and SMS drafts already prepared. Review, hit send, and you\'re first to respond.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-stone-50 bg-corrugated border-b border-stone-200">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-10 bg-orange-500" />
            <span className="text-orange-600 text-sm font-black uppercase tracking-widest">Setup</span>
          </div>
          <h2 className="font-barlow font-black text-5xl md:text-6xl text-stone-900 uppercase leading-none mb-3">
            On The Roof In <span className="text-orange-500">5 Minutes</span>
          </h2>
          <p className="text-stone-600 text-lg">
            No developer. No onboarding call. No $2,000 setup fee.
          </p>
        </div>

        {/* Steps */}
        <div className="border-2 border-stone-300 divide-y-2 divide-stone-300 bg-white shadow-sm">
          {steps.map((step) => (
            <div key={step.number} className="grid md:grid-cols-[100px_1fr_110px]">
              {/* Step number — big stencil */}
              <div className="bg-orange-500 flex items-center justify-center px-6 py-8 md:border-r-2 border-orange-600">
                <span className="font-barlow font-black text-5xl text-white leading-none">{step.number}</span>
              </div>

              {/* Content */}
              <div className="px-8 py-8">
                <h3 className="font-barlow font-black text-2xl text-stone-900 uppercase tracking-wide mb-3">
                  {step.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
              </div>

              {/* Time */}
              <div className="border-t-2 md:border-t-0 md:border-l-2 border-stone-200 px-6 py-8 flex flex-col items-center justify-center bg-stone-50">
                <p className="font-barlow font-black text-2xl text-stone-900 leading-none">{step.time}</p>
                <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mt-1">Time</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-stone-300" />
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Total setup time: under 5 minutes</p>
          <div className="h-px flex-1 bg-stone-300" />
        </div>

      </div>
    </section>
  )
}
