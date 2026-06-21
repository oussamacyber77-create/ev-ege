import { supabase, type WorkWithRelations } from "./supabase-server"

export async function getWorks(): Promise<WorkWithRelations[]> {
  const { data: works } = await supabase
    .from("works")
    .select("*")
    .order("created_at", { ascending: false })

  if (!works) return []

  const withRelations = await Promise.all(
    works.map(async (w) => {
      const [imagesRes, deliverablesRes] = await Promise.all([
        supabase.from("work_images").select("*").eq("work_id", w.id).order("sort_order"),
        supabase.from("work_deliverables").select("*").eq("work_id", w.id).order("sort_order"),
      ])
      return {
        ...w,
        images: imagesRes.data || [],
        deliverables: deliverablesRes.data || [],
      } as WorkWithRelations
    })
  )

  return withRelations
}

export async function getWorksPublic(): Promise<WorkWithRelations[]> {
  const all = await getWorks()
  return all.filter((w) => !w.hidden)
}

export async function getWorkBySlug(slug: string): Promise<WorkWithRelations | null> {
  const { data: work } = await supabase
    .from("works")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!work) return null

  const [imagesRes, deliverablesRes] = await Promise.all([
    supabase.from("work_images").select("*").eq("work_id", work.id).order("sort_order"),
    supabase.from("work_deliverables").select("*").eq("work_id", work.id).order("sort_order"),
  ])

  return {
    ...work,
    images: imagesRes.data || [],
    deliverables: deliverablesRes.data || [],
  } as WorkWithRelations
}

export async function getFeaturedWorks(): Promise<WorkWithRelations[]> {
  const { data: works } = await supabase
    .from("works")
    .select("*")
    .eq("featured", true)
    .eq("hidden", false)
    .order("created_at", { ascending: false })

  if (!works) return []

  const withRelations = await Promise.all(
    works.map(async (w) => {
      const [imagesRes, deliverablesRes] = await Promise.all([
        supabase.from("work_images").select("*").eq("work_id", w.id).order("sort_order"),
        supabase.from("work_deliverables").select("*").eq("work_id", w.id).order("sort_order"),
      ])
      return {
        ...w,
        images: imagesRes.data || [],
        deliverables: deliverablesRes.data || [],
      } as WorkWithRelations
    })
  )

  return withRelations
}
