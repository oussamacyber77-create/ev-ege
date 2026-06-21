import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Reveal } from "./reveal"
import { getWorksPublic } from "@/lib/works"

export async function WorkSection() {
  const all = await getWorksPublic()
  const works = all.slice(0, 4)

  if (works.length === 0) return null

  return (
    <section id="work" className="border-t border-border bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-4 text-sm font-bold tracking-wide text-primary">أعمالنا</p>
            <h2 className="text-balance text-4xl font-black sm:text-5xl">من محفظتنا</h2>
          </div>
          <Link
            href="/work"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-bold transition hover:text-primary"
          >
            اكتشف كل الأعمال
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {works.map((w, i) => (
            <Reveal as="div" delay={i % 2} key={w.title}>
              <Link href={`/work/${w.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                  <Image
                    src={w.banner || w.images?.[0]?.url || "/placeholder.svg"}
                    alt={w.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-primary">{w.service}</p>
                  <h3 className="mt-1 text-2xl font-bold transition-colors group-hover:text-primary">
                    {w.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{w.year}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
