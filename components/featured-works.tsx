import Image from "next/image"
import Link from "next/link"
import { getFeaturedWorks } from "@/lib/works"

export async function FeaturedWorks() {
  const featured = await getFeaturedWorks()

  if (featured.length === 0) return null

  return (
    <section id="featured-works" className="border-t border-border bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12">
          <p className="mb-4 text-sm font-bold tracking-wide text-primary">أبرز الأعمال</p>
          <h2 className="text-balance text-4xl font-black sm:text-5xl">مشاريعنا المميزة</h2>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            مجموعة من أبرز المشاريع التي تعكس خبرتنا وإبداعنا في مختلف المجالات.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((w) => (
            <Link
              key={w.slug}
              href={`/work/${w.slug}?from=featured`}
              className="group overflow-hidden rounded-2xl border border-border bg-card block"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={w.banner || w.images?.[0]?.url || "/placeholder.svg"}
                  alt={w.client}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-primary">{w.service}</p>
                <h3 className="mt-1 text-lg font-bold">{w.client}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
