import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { StorySection } from "@/components/story-section"
import { FeaturedWorks } from "@/components/featured-works"
import { ServicesSection } from "@/components/services-section"
import { SolutionsSection } from "@/components/solutions-section"
import { WorkSection } from "@/components/work-section"
import { ClientsSection } from "@/components/clients-section"
import { NewsSection } from "@/components/news-section"
import { CtaSection } from "@/components/cta-section"
import { SiteFooter } from "@/components/site-footer"

export default async function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <StorySection />
        <FeaturedWorks />
        <ServicesSection />
        <SolutionsSection />
        <WorkSection />
        <ClientsSection />
        <NewsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
