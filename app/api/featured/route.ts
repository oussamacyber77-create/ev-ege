import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-server"

export async function GET() {
  const { data: works } = await supabase
    .from("works")
    .select("slug, client, title, service, description, hidden, featured")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  return NextResponse.json(works || [])
}

export async function PUT(request: Request) {
  const { slugs } = await request.json()

  if (!Array.isArray(slugs)) {
    return NextResponse.json({ error: "slugs must be an array" }, { status: 400 })
  }

  await supabase.from("works").update({ featured: false }).neq("featured", false)

  if (slugs.length > 0) {
    await supabase.from("works").update({ featured: true }).in("slug", slugs)
  }

  return NextResponse.json({ success: true })
}
