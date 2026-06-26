import { createClient } from "@supabase/supabase-js"
import type { Showcase } from "./showcase-types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type WorkRow = {
  id: string
  slug: string
  client: string
  title: string
  service: string
  sector: string
  year: string
  description: string
  challenge: string
  solution: string
  result: string
  hidden: boolean
  featured: boolean
  banner: string
  showcase: Showcase | null
  created_at: string
  updated_at: string
}

export type WorkImageRow = {
  id: string
  work_id: string
  url: string
  sort_order: number
}

export type WorkDeliverableRow = {
  id: string
  work_id: string
  name: string
  sort_order: number
}

export type WorkWithRelations = WorkRow & {
  images: WorkImageRow[]
  deliverables: WorkDeliverableRow[]
}
