import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const NAV = [
  { href: '#quick-start',     label: 'Quick Start' },
  { href: '#install-widget',  label: 'Install Widget' },
  { href: '#pricing-setup',   label: 'Pricing & Materials' },
  { href: '#ai-features',     label: 'AI Features' },
  { href: '#lead-pipeline',   label: 'Lead Pipeline' },
  { href: '#notifications',   label: 'Lead Notifications' },
  { href: '#webhook-zapier',  label: 'Webhook & Zapier' },
  { href: '#lead-scoring',    label: 'Lead Scoring' },
]

function SectionHeader({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div id={id} className="mb-8 scroll-mt-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-1 w-8 bg-orange-500 flex-shrink-0" />
        <span className="text-orange-600 text-xs font-black uppercase tracking-widest">{eyebrow}</span>
      </div>
      <h2 className="font-barlow font-black text-3xl md:text-4xl text-stone-900 uppercase leading-none">{title}</h2>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-stone-300 bg-white mb-6">
      <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300">
        <p className="text-xs font-black uppercase tracking-widest text-stone-600">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-stone-950 text-stone-100 p-4 text-sm overflow-x-auto leading-relaxed font-mono rounded-none">
      {code}
    </pre>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-stone-100 last:border-0">
      <span className="font-barlow font-black text-2xl text-orange-500 leading-none w-8 flex-shrink-0">{n}</span>
      <div>
        <p className="font-bold text-stone-900 text-sm uppercase tracking-wide mb-1">{title}</p>
        <div className="text-sm text-stone-500 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function ProBadge() {
  return (
    <span className="inline-block text-[9px] font-black uppercase tracking-widest text-orange-600 border border-orange-300 bg-orange-100 px-1.5 py-0.5 leading-none align-middle ml-1">
      Pro
    </span>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Page hero */}
      <div className="bg-stone-900 border-b-2 border-orange-500">
        <div className="container max-w-6xl mx-auto px-4 py-14">
          <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-3">Documentation</p>
          <h1 className="font-barlow font-black text-5xl md:text-6xl text-white uppercase leading-none mb-3">
            Get Up &amp; Running
          </h1>
          <p className="text-stone-400 text-lg max-w-xl">
            Everything you need to install the widget, configure pricing, use AI features, and connect your tools.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-[220px_1fr] gap-12">

          {/* Sidebar nav */}
          <aside className="hidden md:block">
            <div className="sticky top-24 border-2 border-stone-300 bg-white">
              <div className="px-4 py-3 bg-stone-100 border-b-2 border-stone-300">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">On This Page</p>
              </div>
              <nav className="p-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-sm font-semibold text-stone-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 space-y-16">

            {/* ── Quick Start ── */}
            <section>
              <SectionHeader id="quick-start" eyebrow="Step 1" title="Quick Start" />
              <Card title="You'll be live in under 5 minutes">
                <Step n="01" title="Create your account">
                  <Link href="/signup" className="text-orange-600 hover:underline font-semibold">Sign up at betterroofing.co/signup</Link>
                  {' '}with email or Google. A card is required to start your 14-day trial — you won't be charged until day 15.
                </Step>
                <Step n="02" title="Set your pricing">
                  Go to <strong>Dashboard → Settings</strong>. Enter your price per square for each material type you offer, set your waste factor, and tear-off cost. Toggle off any materials you don't install.
                </Step>
                <Step n="03" title="Install the widget">
                  Go to <strong>Dashboard → Install Widget</strong>. Copy your unique snippet and paste it into your website. Done.
                </Step>
                <Step n="04" title="Start receiving leads">
                  Homeowners visit your site, get an instant estimate, and submit their contact info. Every lead lands in your dashboard scored, AI-analyzed, and ready to act on.
                </Step>
              </Card>
            </section>

            {/* ── Install Widget ── */}
            <section>
              <SectionHeader id="install-widget" eyebrow="Setup" title="Install Widget" />
              <Card title="How the Widget Works">
                <p className="text-sm text-stone-500">
                  The widget is a <strong>one-question-at-a-time journey</strong> — not a multi-step form. Each screen asks a single question with large tap-friendly cards. Homeowners auto-advance through a short series of qualification questions before receiving their instant estimate. The flow is designed to maximize completion rates while capturing everything you need to qualify and follow up on the lead.
                </p>
              </Card>

              <Card title="The Embed Snippet">
                <p className="text-sm text-stone-500 mb-4">
                  Go to <strong>Dashboard → Install Widget</strong> to copy your personal snippet. It looks like this:
                </p>
                <CodeBlock code={`<!-- BetterRoofing Widget -->
<div id="roof-estimator"></div>
<script
  src="https://app.betterroofing.co/widget.js"
  data-contractor-id="YOUR_ID"
  async
></script>`} />
                <p className="text-xs text-stone-400 font-semibold mt-3 uppercase tracking-wide">
                  Paste before the closing &lt;/body&gt; tag on any page you want the estimator to appear.
                </p>
              </Card>

              <Card title="Platform Guides">
                <div className="space-y-5">
                  {[
                    {
                      platform: 'WordPress',
                      steps: [
                        'Install the "Insert Headers and Footers" plugin (free)',
                        'Go to Settings → Insert Headers and Footers → Scripts in Footer',
                        'Paste your snippet and save',
                        'Or add a Custom HTML block anywhere on a page',
                      ],
                    },
                    {
                      platform: 'Squarespace',
                      steps: [
                        'Go to Settings → Advanced → Code Injection',
                        'Paste your snippet in the Footer section',
                        'Or add a Code Block to any specific page',
                      ],
                    },
                    {
                      platform: 'Wix',
                      steps: [
                        'Go to Settings → Custom Code',
                        'Click Add Custom Code',
                        'Paste your snippet, set location to "Body — end", apply to the pages you want',
                      ],
                    },
                    {
                      platform: 'Custom HTML',
                      steps: [
                        'Place <div id="roof-estimator"></div> where you want the widget',
                        'Paste the full snippet before </body>',
                        'The widget renders in a self-sizing iframe — no CSS conflicts',
                      ],
                    },
                  ].map(({ platform, steps }) => (
                    <div key={platform}>
                      <p className="text-xs font-black uppercase tracking-widest text-stone-700 mb-2">{platform}</p>
                      <ol className="space-y-1">
                        {steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-500">
                            <span className="font-bold text-orange-500 flex-shrink-0">{i + 1}.</span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* ── Pricing & Materials ── */}
            <section>
              <SectionHeader id="pricing-setup" eyebrow="Configuration" title="Pricing & Materials" />
              <Card title="Material Types">
                <p className="text-sm text-stone-500 mb-4">
                  Enable only the roof types you install. Disabled types won't appear in the widget for homeowners to select.
                </p>
                <div className="border border-stone-200 divide-y divide-stone-200">
                  {[
                    { name: 'Asphalt Shingles', note: 'Most common, enabled by default' },
                    { name: 'Metal Roofing',    note: 'Standing seam, corrugated — enabled by default' },
                    { name: 'Tile Roofing',     note: 'Clay, concrete, slate — enabled by default' },
                    { name: 'Flat / TPO',       note: 'EPDM, TPO, modified bitumen — disabled by default' },
                  ].map((m) => (
                    <div key={m.name} className="px-4 py-3 text-sm">
                      <p className="font-bold text-stone-800">{m.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{m.note}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Estimate Formula">
                <p className="text-sm text-stone-500 mb-3">
                  The widget calculates a low/high range using your settings:
                </p>
                <CodeBlock code={`squares    = (home_sqft × slope_factor) / 100
base       = squares × price_per_square × waste_factor
total      = base + tear_off_cost
low / high = total ± a calibrated margin  (rounded to nearest $100)`} />
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Slope factor',  value: 'Adjusted automatically based on roof pitch selected by the homeowner' },
                    { label: 'Waste factor',  value: 'Set in Dashboard → Settings. Accounts for cuts and material overlap.' },
                    { label: 'Tear-off cost', value: 'Flat fee you configure — added to every estimate.' },
                  ].map((r) => (
                    <div key={r.label} className="col-span-2 border-l-2 border-orange-300 pl-3">
                      <p className="font-black uppercase tracking-wide text-stone-500">{r.label}</p>
                      <p className="text-stone-600 mt-0.5">{r.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* ── AI Features ── */}
            <section>
              <SectionHeader id="ai-features" eyebrow="Pro Feature" title="AI Features" />

              <Card title={`AI Lead Intelligence Brief  ·  Pro`}>
                <p className="text-sm text-stone-500 mb-4">
                  Every lead that comes in triggers an AI analysis. Within seconds of submission, BetterRoofing generates a
                  3-bullet intelligence card visible when you expand a lead in your dashboard.
                </p>
                <div className="bg-stone-900 px-4 py-4 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-3">AI Lead Intelligence · Example</p>
                  <ul className="space-y-2">
                    {[
                      'Homeowner on Shoal Creek requesting emergency asphalt replacement — likely storm or active leak requiring immediate attention.',
                      'Estimated job value $11,300 avg; score 10/10 — highest-priority lead in your pipeline.',
                      'Call within 1–2 hours — emergency leads have a significantly higher conversion rate when contacted same day.',
                    ].map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                        <p className="text-sm text-stone-300 leading-snug">{b}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-stone-500">
                  The brief always covers: <strong>who the lead is</strong>, <strong>job value context</strong>,
                  and a <strong>specific recommended action with urgency timing</strong>. Insurance claim leads get
                  tailored language around working with adjusters.
                </p>
              </Card>

              <Card title={`AI Follow-up Drafts (Email & SMS)  ·  Pro`}>
                <p className="text-sm text-stone-500 mb-4">
                  At the same time as the intelligence brief, BetterRoofing writes a personalized follow-up email
                  and SMS for each lead — using their name, address, estimate range, material type, and urgency level.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="border border-stone-200 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">Email Draft</p>
                    <p className="text-xs text-stone-500">
                      Includes a personalized subject line, 3–4 short paragraphs acknowledging their situation,
                      the estimate range as a starting point, and a clear CTA to schedule a free inspection.
                      Tone is straight-talking local contractor — not salesy.
                    </p>
                  </div>
                  <div className="border border-stone-200 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-600 mb-1">SMS Draft</p>
                    <p className="text-xs text-stone-500">
                      Under 160 characters. Friendly, mentions their name and your company,
                      ends with a call-to-action. Click <strong>Send SMS</strong> in the dashboard to open it
                      pre-filled in your Messages app.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-stone-500">
                  Both drafts are generated in the background — they appear in the dashboard within 5–15 seconds of
                  a lead submitting. You review, optionally edit, and send. First to respond wins the job.
                </p>
              </Card>

              <Card title={`Weekly AI Intelligence Report  ·  Pro`}>
                <p className="text-sm text-stone-500 mb-4">
                  Every Monday morning, BetterRoofing generates a plain-English report summarizing your pipeline from the previous week.
                  It appears at the top of your dashboard and covers:
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    'Total leads received and average estimate value for the week',
                    'Which lead types dominated (e.g. emergency replacements trending up)',
                    'Specific leads that haven\'t been contacted and may need follow-up',
                    'Observations about your service area (e.g. out-of-area patterns)',
                    'A prioritized recommendation for the week ahead',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-stone-500">
                      <span className="text-orange-500 font-black flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-stone-500">
                  The report is collapsible — click the header to expand it. Reports are stored and remain accessible
                  in your dashboard for future reference.
                </p>
              </Card>
            </section>

            {/* ── Lead Pipeline ── */}
            <section>
              <SectionHeader id="lead-pipeline" eyebrow="Dashboard" title="Lead Pipeline" />
              <Card title="Tracking Lead Status">
                <p className="text-sm text-stone-500 mb-5">
                  Every lead has a status that you control. Use it to track where each job stands without needing
                  a separate CRM. The status is shown as a pill in the leads table and can be changed with one click.
                </p>
                <div className="border border-stone-200 divide-y divide-stone-200 mb-5">
                  {[
                    { status: 'New',       dot: 'bg-blue-500',   desc: 'Lead just came in — not yet contacted.' },
                    { status: 'Contacted', dot: 'bg-yellow-500', desc: 'You\'ve reached out via email, SMS, or phone.' },
                    { status: 'Quoted',    dot: 'bg-orange-500', desc: 'You\'ve sent or presented a formal quote.' },
                    { status: 'Won',       dot: 'bg-green-500',  desc: 'Job signed and confirmed.' },
                    { status: 'Lost',      dot: 'bg-stone-400',  desc: 'Lead went elsewhere or went cold.' },
                  ].map(({ status, dot, desc }) => (
                    <div key={status} className="flex items-center gap-4 px-4 py-3">
                      <div className="flex items-center gap-2 w-28 flex-shrink-0">
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dot}`} />
                        <span className="text-sm font-bold text-stone-800">{status}</span>
                      </div>
                      <p className="text-sm text-stone-500">{desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-stone-500">
                  Status updates are instant and saved automatically. Click any lead row to open the lead drawer — a full-screen side panel with the satellite image, AI brief, contact details, insurance status, and outreach drafts, with the status picker right there too.
                </p>
              </Card>
            </section>

            {/* ── Notifications ── */}
            <section>
              <SectionHeader id="notifications" eyebrow="Alerts" title="Lead Notifications" />
              <Card title="Email Notifications">
                <p className="text-sm text-stone-500 mb-4">
                  Set a notification email under <strong>Dashboard → Settings → Notifications</strong>.
                  You'll get an email the moment a lead submits — including their name, address, estimate range,
                  material, urgency level, and lead score.
                </p>
                <div className="bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-600 space-y-1">
                  <p><strong>Subject:</strong> New lead — Sarah M. · Score 9/10 · $13,400 avg estimate</p>
                  <p><strong>Body:</strong> Full lead profile with address, estimate range, material, urgency, and a link to your dashboard.</p>
                </div>
                <p className="text-xs text-stone-400 font-semibold mt-3">
                  Leave the field blank to disable email notifications.
                </p>
              </Card>
            </section>

            {/* ── Webhook & Zapier ── */}
            <section>
              <SectionHeader id="webhook-zapier" eyebrow="Integrations" title="Webhook & Zapier" />
              <Card title="Webhook Payload">
                <p className="text-sm text-stone-500 mb-4">
                  BetterRoofing sends a <code className="bg-stone-100 px-1.5 py-0.5 text-xs font-mono text-stone-700">POST</code> request
                  to your webhook URL every time a new lead is created. The body is JSON:
                </p>
                <CodeBlock code={`{
  "id":              "clx8abc123",
  "name":            "Sarah Mitchell",
  "email":           "sarah@example.com",
  "phone":           "512-555-0199",
  "address":         "123 Main St, Austin, TX 78701",
  "lat":             30.2672,
  "lng":             -97.7431,
  "isHomeowner":     "yes",
  "projectType":     "replacement",
  "insuranceClaim":  "yes",
  "urgency":         "emergency",
  "materialType":    "asphalt",
  "roofSlope":       "medium",
  "homeSqft":        2000,
  "roofSquares":     24.0,
  "estimateLow":     11200,
  "estimateHigh":    13600,
  "leadScore":       9,
  "status":          "new",
  "outOfArea":       false,
  "createdAt":       "2026-03-16T14:22:00.000Z"
}`} />
                <div className="mt-3 space-y-1.5 text-xs text-stone-400 font-semibold">
                  <p>
                    <code className="bg-stone-100 px-1 font-mono">insuranceClaim</code> — one of{' '}
                    <code className="bg-stone-100 px-1 font-mono">"yes"</code>,{' '}
                    <code className="bg-stone-100 px-1 font-mono">"no"</code>, or{' '}
                    <code className="bg-stone-100 px-1 font-mono">"unsure"</code>. Use this to route insurance jobs to a different workflow.
                  </p>
                  <p>
                    <code className="bg-stone-100 px-1 font-mono">homeSqft</code> — the interior square footage entered by the homeowner. Useful for records and verification.
                  </p>
                  <p>
                    <code className="bg-stone-100 px-1 font-mono">aiLeadBrief</code>, <code className="bg-stone-100 px-1 font-mono">aiEmailDraft</code>,
                    and <code className="bg-stone-100 px-1 font-mono">aiSmsDraft</code> are generated asynchronously and will be <code className="bg-stone-100 px-1 font-mono">null</code> at
                    webhook delivery time. Access AI content from the dashboard lead drawer.
                  </p>
                </div>
              </Card>

              <Card title="Connect to Zapier">
                <Step n="01" title="Create a new Zap">
                  In Zapier, click <strong>Create Zap</strong>. Search for <strong>Webhooks by Zapier</strong> as the trigger app.
                </Step>
                <Step n="02" title='Select "Catch Hook"'>
                  Choose <strong>Catch Hook</strong> as the trigger event. Click Continue.
                </Step>
                <Step n="03" title="Copy your webhook URL">
                  Zapier will give you a unique URL like{' '}
                  <code className="bg-stone-100 px-1.5 py-0.5 text-xs font-mono text-stone-700">
                    https://hooks.zapier.com/hooks/catch/...
                  </code>. Copy it.
                </Step>
                <Step n="04" title="Paste it into BetterRoofing">
                  Go to <strong>Dashboard → Settings → Webhook URL</strong>. Paste the URL and save.
                </Step>
                <Step n="05" title="Trigger a test lead">
                  Submit a test estimate on your widget. Zapier will detect the incoming data.
                  Click <strong>Test Trigger</strong> in Zapier to confirm.
                </Step>
                <Step n="06" title="Add your action">
                  Connect the lead data to any app — <strong>Google Sheets, HubSpot, JobNimbus, AccuLynx, Slack, SMS</strong>, or
                  anything else in Zapier's library. Map fields like <code className="bg-stone-100 px-1 font-mono text-xs">name</code>,{' '}
                  <code className="bg-stone-100 px-1 font-mono text-xs">leadScore</code>, <code className="bg-stone-100 px-1 font-mono text-xs">estimateLow</code>,
                  and <code className="bg-stone-100 px-1 font-mono text-xs">status</code> to your destination.
                </Step>
              </Card>

              <Card title="Custom Webhooks (Make, n8n, or your own server)">
                <p className="text-sm text-stone-500 mb-3">
                  Any endpoint that accepts a <code className="bg-stone-100 px-1.5 py-0.5 text-xs font-mono text-stone-700">POST</code> with
                  a JSON body will work. A few things to know:
                </p>
                <ul className="space-y-2">
                  {[
                    'Your endpoint must respond with a 2xx status within 10 seconds.',
                    'BetterRoofing does not retry failed webhook deliveries.',
                    'The Content-Type header is always application/json.',
                    'For Make (formerly Integromat), use the "Custom webhook" module as the trigger.',
                  ].map((note) => (
                    <li key={note} className="flex items-start gap-2 text-sm text-stone-500">
                      <span className="text-orange-500 font-black flex-shrink-0">→</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            {/* ── Lead Scoring ── */}
            <section>
              <SectionHeader id="lead-scoring" eyebrow="Reference" title="Lead Scoring" />
              <Card title="How Scores Are Calculated">
                <p className="text-sm text-stone-500 mb-5">
                  Every lead receives a score from 1–10 based on four qualification signals captured during the estimate flow.
                  Higher-value signals (full replacement, emergency urgency, confirmed homeowner) contribute more to the score.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      factor: 'Project Type',
                      values: [
                        { label: 'Full Replacement', tier: 'High',   color: 'text-green-600' },
                        { label: 'Repair',           tier: 'Medium', color: 'text-amber-600' },
                      ],
                    },
                    {
                      factor: 'Urgency',
                      values: [
                        { label: 'Emergency',     tier: 'High',   color: 'text-green-600' },
                        { label: 'Soon',          tier: 'Medium', color: 'text-amber-600' },
                        { label: 'Just browsing', tier: 'Low',    color: 'text-stone-400' },
                      ],
                    },
                    {
                      factor: 'Homeowner Status',
                      values: [
                        { label: 'Homeowner',     tier: 'High',   color: 'text-green-600' },
                        { label: 'Renter',        tier: 'Medium', color: 'text-amber-600' },
                        { label: 'Not homeowner', tier: 'Low',    color: 'text-stone-400' },
                      ],
                    },
                    {
                      factor: 'Service Area',
                      values: [
                        { label: 'Inside service area',  tier: 'No impact',  color: 'text-stone-500' },
                        { label: 'Outside service area', tier: 'Penalized',  color: 'text-red-500' },
                      ],
                    },
                  ].map(({ factor, values }) => (
                    <div key={factor} className="border border-stone-200">
                      <div className="px-4 py-2 bg-stone-50 border-b border-stone-200">
                        <p className="text-xs font-black uppercase tracking-widest text-stone-500">{factor}</p>
                      </div>
                      <div className="divide-y divide-stone-100">
                        {values.map(({ label, tier, color }) => (
                          <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                            <span className="text-stone-700 font-medium">{label}</span>
                            <span className={`font-bold text-sm ${color}`}>{tier}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { range: '8–10', label: 'Hot lead',  color: 'bg-red-50 border-red-200 text-red-700' },
                    { range: '5–7',  label: 'Warm lead', color: 'bg-amber-50 border-amber-300 text-amber-800' },
                    { range: '1–4',  label: 'Cool lead', color: 'bg-stone-50 border-stone-200 text-stone-500' },
                  ].map(({ range, label, color }) => (
                    <div key={range} className={`border-2 px-4 py-3 text-center ${color}`}>
                      <p className="font-barlow font-black text-2xl leading-none">{range}</p>
                      <p className="text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-stone-400 font-semibold mt-4">
                  The AI Lead Intelligence Brief <ProBadge /> uses the score alongside urgency and job context
                  to generate its recommended action — e.g. "call within 2 hours" for a 10/10 emergency lead.
                </p>
              </Card>
            </section>

            {/* Footer CTA */}
            <div className="border-2 border-stone-900 bg-stone-900 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="font-barlow font-black text-2xl text-white uppercase leading-none mb-1">
                  Still have questions?
                </p>
                <p className="text-stone-400 text-sm">Reach out and we'll get back to you quickly.</p>
              </div>
              <a
                href="mailto:hello@betterroofing.co"
                className="flex-shrink-0 btn btn-primary px-8 py-3 whitespace-nowrap"
              >
                Email Us →
              </a>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
