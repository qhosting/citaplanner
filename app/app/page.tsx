
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { BenefitsSection } from '@/components/landing/benefits-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CTASection } from '@/components/landing/cta-section'
import { LandingFooter } from '@/components/landing/landing-footer'
import { LandingNavbar } from '@/components/landing/landing-navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
