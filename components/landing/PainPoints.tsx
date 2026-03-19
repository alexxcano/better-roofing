const pains = [
  {
    number: '01',
    before: 'A homeowner visits your site at 10pm, gets no answer, and books your competitor by morning.',
    tag: 'After Hours',
    tagColor: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    number: '02',
    before: 'You spend 45 minutes driving to a "lead" who just wanted a ballpark number — not a new roof.',
    tag: 'Unqualified Lead',
    tagColor: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    number: '03',
    before: 'Your contact form collects names. Your competitor\'s widget is collecting roofing jobs.',
    tag: 'Lost Revenue',
    tagColor: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    number: '04',
    before: 'You call back 18 hours later. The homeowner already signed with the contractor who responded first. You never had a chance.',
    tag: 'Slow Response',
    tagColor: 'bg-amber-100 text-amber-700 border-amber-200',
  },
]

export function PainPoints() {
  return (
    <section id="pain" className="py-24 bg-stone-800 bg-asphalt border-b border-stone-700">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Hazard stripe header */}
        <div className="mb-12">
          <div className="bg-hazard border-l-4 border-orange-500 pl-5 py-2 mb-6 inline-block">
            <span className="text-orange-400 text-sm font-black uppercase tracking-widest">
              ⚠ Sound Familiar?
            </span>
          </div>
          <h2 className="font-barlow font-black text-5xl md:text-6xl text-white uppercase leading-none mb-4">
            Every Week Roofing Contractors<br />
            <span className="text-orange-400">Lose Jobs</span> They Never Knew<br />
            They Lost
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl">
            Your website gets traffic. The question is whether it becomes revenue — or goes to the guy down the road.
          </p>
        </div>

        {/* Job board */}
        <div className="border border-stone-600 divide-y divide-stone-600 mb-12">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_160px] bg-stone-700">
            <div className="px-4 py-3 text-xs text-stone-400 font-bold uppercase tracking-widest border-r border-stone-600">#</div>
            <div className="px-4 py-3 text-xs text-stone-400 font-bold uppercase tracking-widest border-r border-stone-600">What Happened</div>
            <div className="px-4 py-3 text-xs text-stone-400 font-bold uppercase tracking-widest">Why You Lost It</div>
          </div>
          {pains.map((pain) => (
            <div key={pain.number} className="grid grid-cols-[60px_1fr_160px] hover:bg-stone-700/40 transition-colors">
              <div className="px-4 py-5 border-r border-stone-600 flex items-center">
                <span className="font-barlow font-black text-2xl text-orange-400 leading-none">{pain.number}</span>
              </div>
              <div className="px-4 py-5 border-r border-stone-600 flex items-center">
                <p className="text-stone-300 text-sm leading-relaxed">{pain.before}</p>
              </div>
              <div className="px-4 py-5 flex items-center">
                <span className={`text-xs font-bold uppercase tracking-wide border px-2.5 py-1 ${pain.tagColor}`}>
                  {pain.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Transition CTA */}
        <div className="flex items-center gap-6">
          <div className="h-px flex-1 bg-stone-600" />
          <div className="border-2 border-orange-500 bg-orange-500/10 px-8 py-4 text-center">
            <p className="font-barlow font-black text-xl text-white uppercase tracking-wide">
              BetterRoofing Fixes All Four. <span className="text-orange-400">Here&apos;s How ↓</span>
            </p>
            <p className="text-stone-400 text-xs font-semibold mt-1 uppercase tracking-wide">
              With AI your competitors don&apos;t have
            </p>
          </div>
          <div className="h-px flex-1 bg-stone-600" />
        </div>

      </div>
    </section>
  )
}
