import { supabase, type WorkWithRelations } from "./supabase-server"

const WORK_COLUMNS = "id, slug, client, title, service, sector, year, description, challenge, solution, result, hidden, featured, banner, showcase, created_at, updated_at"
const IMAGE_COLUMNS = "id, work_id, url, sort_order"
const DELIVERABLE_COLUMNS = "id, work_id, name, sort_order"

async function fetchWorks(filters?: {
  featured?: boolean
  hidden?: boolean
  slug?: string
}): Promise<WorkWithRelations[]> {
  const select = `${WORK_COLUMNS}, images:work_images(${IMAGE_COLUMNS}), deliverables:work_deliverables(${DELIVERABLE_COLUMNS})`

  let query = supabase.from("works").select(select).order("created_at", { ascending: false })

  if (filters?.featured === true) query = query.eq("featured", true)
  if (filters?.hidden === true) query = query.eq("hidden", true)
  if (filters?.hidden === false) query = query.eq("hidden", false)
  if (filters?.slug) query = query.eq("slug", filters.slug)

  const { data } = await query
  return (data || []) as WorkWithRelations[]
}

export async function getWorks(): Promise<WorkWithRelations[]> {
  return fetchWorks()
}

export async function getWorksPublic(): Promise<WorkWithRelations[]> {
  return fetchWorks({ hidden: false })
}

export async function getWorkBySlug(slug: string): Promise<WorkWithRelations | null> {
  const select = `${WORK_COLUMNS}, images:work_images(${IMAGE_COLUMNS}), deliverables:work_deliverables(${DELIVERABLE_COLUMNS})`

  const { data } = await supabase
    .from("works")
    .select(select)
    .eq("slug", slug)
    .single()

  return (data || null) as WorkWithRelations | null
}

export async function getFeaturedWorks(): Promise<WorkWithRelations[]> {
  return fetchWorks({ featured: true, hidden: false })
}
