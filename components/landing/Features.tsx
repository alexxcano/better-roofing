import { Clock, Flame, LayoutDashboard, Mail, MapPin, PanelRight, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Clock,
    number: '01',
    title: '24/7 Instant Estimates',
    subtitle: 'No rep required',
    description:
      'Your widget works nights, weekends, and holidays. While competitors\' contact forms collect dust, yours captures names, emails, and phone numbers with a real estimate attached — for asphalt, metal, tile, and flat/TPO.',
    callout: '60-second quotes',
    badge: null,
  },
  {
    icon: Flame,
    number: '02',
    title: 'Lead Scoring & Pipeline',
    subtitle: 'Stop chasing bad leads',
    description:
      'Built-in qualification captures insurance status, material preference, and job value. Hot leads score 8–10 and land at the top. Track every lead from New → Contacted → Quoted → Won — a lightweight CRM built into your dashboard.',
    callout: 'Score + status on every lead',
    badge: null,
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'AI Lead Intelligence',
    subtitle: 'Know before you call',
    description:
      'Every lead arrives with a 3-bullet AI brief: who they are, job value context, and a specific recommended action with timing context. You know exactly what to say before you pick up the phone — something no competitor offers.',
    callout: 'Instant lead brief',
    badge: 'Pro',
  },
  {
    icon: Mail,
    number: '04',
    title: 'AI Outreach Drafts',
    subtitle: 'Respond faster, win more jobs',
    description:
      'The moment a lead submits, AI writes a personalized follow-up email and SMS using their name, estimate, address, and insurance situation. Open in your email client or Messages app, review, hit send. First to respond wins the job.',
    callout: 'Reply in under 60 seconds',
    badge: 'Pro',
  },
  {
    icon: MapPin,
    number: '05',
    title: 'Multiple Service Areas',
    subtitle: 'Serve more territory',
    description:
      'Add as many office locations as you need, each with its own service radius. Leads outside every radius are automatically flagged or blocked — so your team only receives jobs you can actually take.',
    callout: 'Per-location radius control',
    badge: null,
  },
  {
    icon: LayoutDashboard,
    number: '06',
    title: 'Weekly Intelligence Report',
    subtitle: 'Your pipeline at a glance',
    description:
      'Every Monday, AI analyzes your leads and sends a plain-English report: what\'s trending in your area, which leads need follow-up, and where your best opportunities are. Like having a sales manager who never sleeps.',
    callout: 'Every Monday morning',
    badge: 'Pro',
  },
  {
    icon: PanelRight,
    number: '07',
    title: 'Floating Quote Tab',
    subtitle: 'Always one click away',
    description:
      'A branded orange "Get Instant Quote" tab pinned to the edge of every page on your site — not just one page. Homeowners see it no matter where they\'re browsing. They click it and the estimator slides in instantly, without leaving the page. The easier you make it to get a quote, the more leads you capture.',
    callout: 'Every page, always visible',
    badge: 'Pro',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white border-b border-stone-200">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="border-b-2 border-stone-200 pb-12 mb-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-10 bg-orange-500" />
                <span className="text-orange-600 text-sm font-black uppercase tracking-widest">What You Get</span>
              </div>
              <h2 className="font-barlow font-black text-5xl md:text-6xl text-stone-900 uppercase leading-none">
                Quote. Score. Close.
              </h2>
            </div>
            <p className="text-stone-500 text-base max-w-xs leading-relaxed md:text-right">
              The only roofing lead tool with AI intelligence built in — not bolted on.
            </p>
          </div>
        </div>

        {/* Feature rows */}
        <div className="border-x border-b border-stone-200 divide-y divide-stone-200">
          {features.map((feature) => (
            <div
              key={feature.number}
              className={`grid md:grid-cols-[72px_220px_1fr_160px] hover:bg-stone-50 transition-colors ${
                feature.badge === 'Pro' ? 'bg-orange-50/30' : ''
              }`}
            >
              {/* Number */}
              <div className="hidden md:flex border-r border-stone-200 items-center justify-center py-8">
                <span className="font-barlow font-black text-4xl text-stone-200 leading-none">{feature.number}</span>
              </div>

              {/* Title block */}
              <div className="border-r border-stone-200 px-6 py-8 flex flex-col justify-center">
                <feature.icon className={`h-6 w-6 mb-2 ${feature.badge === 'Pro' ? 'text-orange-500' : 'text-orange-500'}`} />
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">{feature.subtitle}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-barlow font-black text-xl text-stone-900 uppercase leading-tight">
                    {feature.title}
                  </h3>
                  {feature.badge && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-300 bg-orange-100 px-1.5 py-0.5 leading-none flex-shrink-0">
                      {feature.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-r border-stone-200 px-6 py-8 flex items-center">
                <p className="text-stone-600 text-sm leading-relaxed">{feature.description}</p>
              </div>

              {/* Callout badge */}
              <div className="hidden md:flex px-6 py-8 items-center justify-center">
                <div className={`border-l-4 pl-3 pr-4 py-2 ${feature.badge === 'Pro' ? 'border-orange-500 bg-orange-50' : 'border-orange-500 bg-orange-50'}`}>
                  <p className="text-orange-700 text-xs font-bold uppercase tracking-wide leading-snug">{feature.callout}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
