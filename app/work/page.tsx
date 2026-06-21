import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { WorkGallery } from "@/components/work-gallery"
import { getWorksPublic } from "@/lib/works"

export const metadata = {
  title: "أعمالنا | Evico agency",
  description: "محفظة الأعمال — مشاريع تجمع بين الاستراتيجية والإبداع لعلامات تجارية تؤمن بقيمة التأثير.",
}

export default async function WorkPage() {
  const works = await getWorksPublic()

  const briefs = works.map((w) => ({
    slug: w.slug,
    client: w.client,
    title: w.title,
    service: w.service,
    sector: w.sector,
    year: w.year,
    img: w.banner || w.images?.[0]?.url || "/placeholder.svg",
    banner: w.banner || "",
    images: w.images || [],
  }))

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="أعمالنا"
          title="محفظة الأعمال"
          subtitle="مشاريع تجمع بين الاستراتيجية والإبداع — لعلامات تجارية تؤمن بقيمة التأثير."
        />
        <WorkGallery works={briefs} />
      </main>
      <SiteFooter />
    </>
  )
}
