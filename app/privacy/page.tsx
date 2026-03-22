import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-barlow font-black text-2xl uppercase text-stone-900 mb-3">{title}</h2>
      <div className="text-stone-600 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="bg-stone-900 border-b-2 border-orange-500">
        <div className="container max-w-3xl mx-auto px-4 py-14">
          <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-barlow font-black text-5xl text-white uppercase leading-none mb-2">
            Privacy Policy
          </h1>
          <p className="text-stone-400 text-sm">Last updated: March 2026</p>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border-2 border-stone-300 p-8 md:p-12">

          <Section title="Overview">
            <p>
              BetterRoofing ("we", "our", "us") operates the BetterRoofing platform at betterroofing.co.
              This policy explains what information we collect, how we use it, and your rights regarding that information.
            </p>
          </Section>

          <Section title="Information We Collect">
            <p><strong>From contractors (account holders):</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, and password when you create an account</li>
              <li>Company name, website, and contact details</li>
              <li>Billing information processed securely by Stripe — we never store card numbers</li>
              <li>Pricing settings and widget configuration</li>
            </ul>
            <p><strong>From homeowners (widget users):</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, and phone number submitted via the estimator</li>
              <li>Property address and approximate coordinates</li>
              <li>Roofing project details (material type, square footage, insurance claim status)</li>
            </ul>
            <p><strong>Automatically collected:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address and browser type for security and analytics</li>
              <li>Usage data such as pages visited and features used</li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the BetterRoofing platform</li>
              <li>To deliver lead data to the contractor whose widget collected it</li>
              <li>To send email notifications about new leads</li>
              <li>To generate AI-written follow-up drafts (Pro plan)</li>
              <li>To process payments via Stripe</li>
              <li>To send product updates and announcements (you can opt out anytime)</li>
              <li>To improve the platform and fix bugs</li>
            </ul>
          </Section>

          <Section title="Data Sharing">
            <p>We do not sell your data. We share information only in these cases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contractors:</strong> Homeowner lead data is shared with the contractor whose widget collected it — that is the core function of the service.</li>
              <li><strong>Service providers:</strong> We use Stripe (payments), Supabase (database), Resend (email), OpenAI (AI drafts), and Vercel (hosting). Each is bound by their own privacy policies.</li>
              <li><strong>Webhooks:</strong> If a contractor configures a webhook URL, lead data is sent to that endpoint per their instruction.</li>
              <li><strong>Legal:</strong> We may disclose information if required by law.</li>
            </ul>
          </Section>

          <Section title="Data Retention">
            <p>
              We retain account data for as long as your account is active. Lead data is retained until you delete it or close your account.
              You can request deletion of your data at any time by emailing us.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use session cookies for authentication. We do not use third-party advertising or tracking cookies.
            </p>
          </Section>

          <Section title="Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your lead data via CSV from the dashboard</li>
            </ul>
            <p>To exercise these rights, email us at <a href="mailto:hello@betterroofing.co" className="text-orange-600 hover:underline">hello@betterroofing.co</a>.</p>
          </Section>

          <Section title="Security">
            <p>
              We use industry-standard security practices including encrypted connections (HTTPS), hashed passwords,
              and access controls. No system is 100% secure — if you discover a vulnerability, please contact us immediately.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this policy occasionally. We'll notify account holders by email for material changes.
              Continued use of the platform after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:hello@betterroofing.co" className="text-orange-600 hover:underline">hello@betterroofing.co</a>.
            </p>
          </Section>

        </div>
      </div>

      <Footer />
    </div>
  )
}
