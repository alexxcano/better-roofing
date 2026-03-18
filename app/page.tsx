import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { PainPoints } from '@/components/landing/PainPoints'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Comparison } from '@/components/landing/Comparison'
import { Testimonials } from '@/components/landing/Testimonials'
import { PricingSection } from '@/components/landing/PricingSection'
import { FinalCta } from '@/components/landing/FinalCta'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <PainPoints />
      <Features />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <PricingSection />
      <FinalCta />
      <Footer />
    </div>
  )
}
