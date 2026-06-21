import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-server"

export async function GET() {
  const { data: works } = await supabase
    .from("works")
    .select("*")
    .order("created_at", { ascending: false })

  if (!works) {
    return NextResponse.json([])
  }

  const withRelations = await Promise.all(
    works.map(async (w) => {
      const [images, deliverables] = await Promise.all([
        supabase.from("work_images").select("*").eq("work_id", w.id).order("sort_order"),
        supabase.from("work_deliverables").select("*").eq("work_id", w.id).order("sort_order"),
      ])
      return { ...w, images: images.data || [], deliverables: deliverables.data || [] }
    })
  )

  return NextResponse.json(withRelations)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data: work, error } = await supabase
    .from("works")
    .insert({
      slug: body.slug,
      client: body.client,
      title: body.title,
      service: body.service,
      sector: body.sector,
      year: body.year || "",
      description: body.description,
      challenge: body.challenge || "",
      solution: body.solution || "",
      result: body.result || "",
      hidden: body.hidden || false,
      featured: body.featured || false,
      banner: body.banner || body.images?.[0] || "",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (body.images?.length) {
    const { error: imgErr } = await supabase.from("work_images").insert(
      body.images.map((url: string, i: number) => ({
        work_id: work.id,
        url,
        sort_order: i,
      }))
    )
    if (imgErr) console.error("Error inserting images:", imgErr)
  }

  if (body.deliverables?.length) {
    const { error: delErr } = await supabase.from("work_deliverables").insert(
      body.deliverables.map((name: string, i: number) => ({
        work_id: work.id,
        name,
        sort_order: i,
      }))
    )
    if (delErr) console.error("Error inserting deliverables:", delErr)
  }

  return NextResponse.json(work)
}
