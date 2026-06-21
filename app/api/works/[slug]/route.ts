import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-server"

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = await request.json()

  const { data: existing } = await supabase
    .from("works")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "العمل غير موجود" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}
  const fields = ["slug", "client", "title", "service", "sector", "year", "description", "challenge", "solution", "result", "hidden", "featured", "banner"]
  for (const field of fields) {
    if (body[field] !== undefined) updateData[field] = body[field]
  }
  updateData.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from("works")
    .update(updateData)
    .eq("id", existing.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (body.images !== undefined) {
    await supabase.from("work_images").delete().eq("work_id", existing.id)
    if (body.images.length) {
      await supabase.from("work_images").insert(
        body.images.map((url: string, i: number) => ({
          work_id: existing.id,
          url,
          sort_order: i,
        }))
      )
    }
  }

  if (body.deliverables !== undefined) {
    await supabase.from("work_deliverables").delete().eq("work_id", existing.id)
    if (body.deliverables.length) {
      await supabase.from("work_deliverables").insert(
        body.deliverables.map((name: string, i: number) => ({
          work_id: existing.id,
          name,
          sort_order: i,
        }))
      )
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: work } = await supabase
    .from("works")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!work) {
    return NextResponse.json({ error: "العمل غير موجود" }, { status: 404 })
  }

  const { error } = await supabase.from("works").delete().eq("id", work.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
