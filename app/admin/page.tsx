import { supabase } from "@/lib/supabase-server"
import { TabbedDashboard } from "@/components/admin/tabbed-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const { data: works } = await supabase
    .from("works")
    .select("id, slug, client, title, service, sector, year, hidden, featured, banner")
    .order("created_at", { ascending: false })

  const worksWithImages = await Promise.all(
    (works || []).map(async (w) => {
      const { data: images } = await supabase
        .from("work_images")
        .select("url")
        .eq("work_id", w.id)
        .order("sort_order")
        .limit(1)
      return { ...w, banner: w.banner || "", images: images || [] }
    })
  )

  const total = worksWithImages.length
  const featured = worksWithImages.filter((w) => w.featured).length
  const hidden = worksWithImages.filter((w) => w.hidden).length

  return (
    <TabbedDashboard
      works={worksWithImages}
      stats={{ total, featured, hidden, visible: total - hidden }}
    />
  )
}
