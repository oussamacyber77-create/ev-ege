import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase-server"
import { WorkForm } from "../work-form"

export default async function EditWorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: work } = await supabase
    .from("works")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!work) notFound()

  const { data: images } = await supabase
    .from("work_images")
    .select("*")
    .eq("work_id", work.id)
    .order("sort_order")

  const { data: deliverables } = await supabase
    .from("work_deliverables")
    .select("*")
    .eq("work_id", work.id)
    .order("sort_order")

  return (
    <div className="min-h-screen bg-[#111827] p-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">تعديل: {work.client}</h1>
          <Link
            href="/admin"
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-card"
          >
            العودة
          </Link>
        </div>
        <WorkForm
          initialData={{
            slug: work.slug,
            client: work.client,
            title: work.title,
            service: work.service,
            sector: work.sector,
            year: work.year,
            description: work.description,
            challenge: work.challenge,
            solution: work.solution,
            result: work.result,
            hidden: work.hidden,
            featured: work.featured,
            images: images?.map((i) => i.url) || [],
            banner: work.banner || images?.[0]?.url || "",
            deliverables: deliverables?.map((d) => d.name) || [],
            showcase: work.showcase,
          }}
        />
      </div>
    </div>
  )
}
