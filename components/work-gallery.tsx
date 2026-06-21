"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Reveal } from "@/components/reveal"

export type WorkBrief = {
  slug: string
  client: string
  title: string
  service: string
  sector: string
  year: string
  img: string
  banner: string
  images: { url: string }[]
}

const serviceFilters = ["الكل", "الإبداع", "الإنتاج السينمائي", "التحويل و الأداء"]
const sectorFilters = [
  "الكل",
  "القطاع الحكومي",
  "التقنية والتجارة الإلكترونية",
  "الأغذية والمشروبات",
  "الوجهات والأماكن",
  "القطاع غير الربحي",
]

export function WorkGallery({ works }: { works: WorkBrief[] }) {
  const [service, setService] = useState("الكل")
  const [sector, setSector] = useState("الكل")

  const filtered = useMemo(
    () =>
      works.filter(
        (w) => (service === "الكل" || w.service === service) && (sector === "الكل" || w.sector === sector),
      ),
    [service, sector, works],
  )

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="ml-2 text-sm font-bold text-muted-foreground">الخدمة</span>
          {serviceFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setService(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                service === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground/70 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="ml-2 text-sm font-bold text-muted-foreground">القطاع</span>
          {sectorFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSector(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                sector === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground/70 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm font-bold text-muted-foreground">{filtered.length} مشروع</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((w, i) => (
          <Reveal as="div" delay={i % 3} key={w.slug}>
            <Link href={`/work/${w.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                <Image
                  src={w.banner || w.images?.[0]?.url || w.img || "/placeholder.svg"}
                  alt={w.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute right-4 top-4 flex gap-2">
                  <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
                    {w.service}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-primary">{w.client}</p>
                <h3 className="mt-1 text-2xl font-bold transition-colors group-hover:text-primary">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {w.sector} · {w.year}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
