import { Clock, Flame, LayoutDashboard, Mail, MapPin, PanelRight, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Clock,
    number: '01',
    title: '24/7 Instant Estimates',
    subtitle: 'No rep required',
    description:
      'Your widget works nights, weekends, and holidays. A homeowner who gets an instant estimate is a committed lead — not an inquiry. While competitors\' contact forms collect names, yours converts browsers into buyers with a real number attached, 24 hours a day.',
    callout: '60-second quotes',
  },
  {
    icon: Flame,
    number: '02',
    title: 'Lead Scoring & Pipeline',
    subtitle: 'Stop chasing bad leads',
    description:
      'Built-in qualification captures insurance status, material preference, and job value. Hot leads score 8–10 and land at the top. Track every lead from New → Contacted → Quoted → Won — a lightweight CRM built into your dashboard.',
    callout: 'Score + status on every lead',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'AI Lead Intelligence',
    subtitle: 'Know before you call',
    description:
      'Every lead arrives with a 3-bullet AI brief: who they are, job value context, and a specific recommended action with timing. You know exactly what to say before you pick up the phone — something no competitor offers.',
    callout: 'Instant lead brief',
  },
  {
    icon: Mail,
    number: '04',
    title: 'AI Outreach Drafts',
    subtitle: 'Respond faster, win more jobs',
    description:
      'The moment a lead submits, AI writes a personalized follow-up email and SMS using their name, estimate, address, and insurance situation. Open in your email client or Messages app, review, hit send. First to respond wins the job.',
    callout: 'Reply in under 60 seconds',
  },
  {
    icon: MapPin,
    number: '05',
    title: 'Service Area Filtering',
    subtitle: 'Only leads you can take',
    description:
      'Set a service radius around your office. Leads outside your area are automatically flagged or blocked — your pipeline stays clean and every lead is a job you can actually bid on.',
    callout: 'Per-location radius control',
  },
  {
    icon: LayoutDashboard,
    number: '06',
    title: 'Weekly Intelligence Report',
    subtitle: 'Your pipeline at a glance',
    description:
      'Every Monday, AI analyzes your leads and delivers a plain-English report: what\'s trending in your area, which leads need follow-up, and where your best opportunities are. Like having a sales manager who never sleeps.',
    callout: 'Every Monday morning',
  },
  {
    icon: PanelRight,
    number: '07',
    title: 'Floating Quote Tab',
    subtitle: 'Always one click away',
    description:
      'A branded "Get Instant Quote" tab pinned to the edge of every page on your site. Homeowners see it no matter where they\'re browsing — they click and the estimator slides in instantly without leaving the page.',
    callout: 'Every page, always visible',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white border-b border-stone-200">
      <div className="container max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="mb-12">
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

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="border-2 border-stone-200 bg-white p-6 flex flex-col hover:border-orange-300 hover:bg-orange-50/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-orange-500" />
                </div>
                <span className="font-barlow font-black text-5xl text-stone-100 leading-none select-none">{feature.number}</span>
              </div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">{feature.subtitle}</p>
              <h3 className="font-barlow font-black text-xl text-stone-900 uppercase leading-tight mb-3">{feature.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed flex-1">{feature.description}</p>
              <div className="border-l-4 border-orange-500 bg-orange-50 pl-3 pr-4 py-2 mt-5">
                <p className="text-orange-700 text-xs font-bold uppercase tracking-wide">{feature.callout}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
