import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Reveal } from "@/components/reveal"
import { BackLink } from "@/components/back-link"
import { ShowcaseTrigger } from "@/components/showcase/showcase-viewer"
import { getWorkBySlug, getWorksPublic } from "@/lib/works"
import { supabase } from "@/lib/supabase-server"

export const revalidate = 60

export async function generateStaticParams() {
  const { data: works } = await supabase.from("works").select("slug")
  return (works || []).map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = await getWorkBySlug(slug)
  if (!work) return { title: "الأعمال | Evico agency" }
  return { title: `${work.title} | Evico agency`, description: work.description }
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = await getWorkBySlug(slug)
  if (!work) notFound()

  const allPublic = await getWorksPublic()
  const others = allPublic.filter((w) => w.slug !== work.slug).slice(0, 3)

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative pt-28 lg:pt-32">
          <div className="relative h-[50vh] min-h-80 w-full overflow-hidden lg:h-[60vh]">
            <Image
              src={work.banner || work.images?.[0]?.url || "/placeholder.svg"}
              alt={work.client}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24" style={{ marginTop: "-3.5rem" }}>
          <div className="relative z-10">
            <Suspense fallback={<div className="h-5" />}>
              <BackLink />
            </Suspense>

            <h1 className="mt-8 text-balance text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {work.client}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>{work.service}</span>
              <span>{work.sector}</span>
              {work.year && <span>{work.year}</span>}
            </div>
          </div>

          {work.showcase && <ShowcaseTrigger showcase={work.showcase} />}

          <div className="mt-16">
            <Reveal as="div">
              <h2 className="text-3xl font-black">عن المشروع</h2>
              <p className="mt-4 max-w-3xl text-pretty leading-relaxed text-muted-foreground">{work.description}</p>
            </Reveal>
          </div>

          {work.images && work.images.length > 1 && (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {work.images.slice(1).map((img, i) => (
                <Reveal as="div" delay={i} key={img.id}>
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
                    <Image src={img.url || "/placeholder.svg"} alt={`${work.client} — ${i + 2}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {work.deliverables && work.deliverables.length > 0 && (
            <div className="mt-12">
              <Reveal as="div">
                <h2 className="text-3xl font-black">المنجز ضمن المشروع</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {work.deliverables.map((item) => (
                    <span key={item.id} className="rounded-full border border-border px-4 py-2 text-sm font-medium">
                      {item.name}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          )}

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { num: "01", label: "التحدي", text: work.challenge },
              { num: "02", label: "الحل", text: work.solution },
              { num: "03", label: "النتيجة", text: work.result },
            ]
              .filter((s) => s.text)
              .map((step, i) => (
                <Reveal as="div" delay={i} key={step.label}>
                  <div className="flex h-full flex-col rounded-3xl border border-border p-7">
                    <span className="flex size-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {step.num}
                    </span>
                    <h3 className="mt-5 text-xl font-black">{step.label}</h3>
                    <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{step.text}</p>
                  </div>
                </Reveal>
              ))}
          </div>
        </div>

        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-3xl font-black">أعمال أخرى</h2>
              <Link href="/work" className="text-sm font-bold text-primary hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((w) => (
                <Link key={w.slug} href={`/work/${w.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                    <Image
                      src={w.images?.[0]?.url || "/placeholder.svg"}
                      alt={w.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-sm text-primary">{w.client}</p>
                  <h3 className="mt-1 text-xl font-bold transition-colors group-hover:text-primary">{w.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
