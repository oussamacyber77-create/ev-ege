"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Eye, BarChart3, Archive, Star, FolderOpen, Pencil, Trash2, EyeOff } from "lucide-react"
import { AddFeaturedModal } from "./add-featured-modal"

type WorkFull = {
  id: string
  slug: string
  client: string
  title: string
  service: string
  sector: string
  year: string
  hidden: boolean
  featured: boolean
  banner: string
  images: { url: string }[]
}

type Stats = {
  total: number
  featured: number
  hidden: number
  visible: number
}

const tabs = [
  { id: "all", label: "كل الأعمال", icon: FolderOpen },
  { id: "featured", label: "أبرز الأعمال", icon: Star },
  { id: "archive", label: "الأرشيف", icon: Archive },
  { id: "stats", label: "الإحصائيات", icon: BarChart3 },
] as const

type TabId = (typeof tabs)[number]["id"]

export function TabbedDashboard({ works, stats }: { works: WorkFull[]; stats: Stats }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>("all")
  const [showFeaturedModal, setShowFeaturedModal] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const allWorks = works
  const featuredWorks = works.filter((w) => w.featured)
  const archivedWorks = works.filter((w) => w.hidden)
  const nonFeatured = works.filter((w) => !w.featured && !w.hidden)

  async function toggleFeatured(slug: string, current: boolean) {
    setToggling(slug)
    await fetch(`/api/works/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !current }),
    })
    setToggling(null)
    router.refresh()
  }

  async function toggleHidden(slug: string, current: boolean) {
    setToggling(slug)
    await fetch(`/api/works/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !current }),
    })
    setToggling(null)
    router.refresh()
  }

  async function deleteWork(slug: string) {
    if (!confirm("هل أنت متأكد من حذف هذا العمل؟")) return
    setToggling(slug)
    await fetch(`/api/works/${slug}`, { method: "DELETE" })
    setToggling(null)
    router.refresh()
  }

  function imgUrl(w: WorkFull) {
    return w.banner || w.images?.[0]?.url || "/placeholder.svg"
  }

  function WorkActionCard({ w }: { w: WorkFull }) {
    const isBusy = toggling === w.slug
    return (
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card">
        <Link href={`/admin/works/${w.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={imgUrl(w)}
              alt={w.client}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-4 pb-3">
            <p className="text-xs font-medium text-primary">{w.service}</p>
            <h3 className="mt-1 truncate text-base font-bold text-foreground">{w.client}</h3>
          </div>
        </Link>

        <div className="flex border-t border-border opacity-0 transition-opacity group-hover:opacity-100">
          <ActionBtn
            icon={Pencil}
            label="تعديل"
            onClick={() => router.push(`/admin/works/${w.slug}`)}
          />
          <ActionBtn
            icon={w.featured ? Star : Star}
            label={w.featured ? "إزالة تمييز" : "تمييز"}
            active={w.featured}
            onClick={() => toggleFeatured(w.slug, w.featured)}
            disabled={isBusy}
          />
          <ActionBtn
            icon={w.hidden ? Eye : EyeOff}
            label={w.hidden ? "إظهار" : "إخفاء"}
            active={w.hidden}
            onClick={() => toggleHidden(w.slug, w.hidden)}
            disabled={isBusy}
          />
          <ActionBtn
            icon={Trash2}
            label="حذف"
            danger
            onClick={() => deleteWork(w.slug)}
            disabled={isBusy}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111827]" dir="rtl">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-foreground">لوحة التحكم</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/works/new"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              إضافة عمل
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/auth", { method: "DELETE" })
                window.location.href = "/login"
              }}
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-card"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-1 rounded-2xl border border-border bg-card p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="mt-8">
          {activeTab === "all" && (
            <div>
              <p className="mb-5 text-sm font-bold text-muted-foreground">{allWorks.length} مشروع</p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allWorks.map((w) => (
                  <WorkActionCard key={w.id} w={w} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "featured" && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-bold text-muted-foreground">{featuredWorks.length} مشروع مميز</p>
                {nonFeatured.length > 0 && (
                  <button
                    onClick={() => setShowFeaturedModal(true)}
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
                  >
                    <Plus size={16} />
                    إضافة أعمال
                  </button>
                )}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredWorks.map((w) => (
                  <WorkActionCard key={w.id} w={w} />
                ))}
              </div>
              {featuredWorks.length === 0 && (
                <p className="py-16 text-center text-muted-foreground">لا توجد أعمال مميزة بعد</p>
              )}
            </div>
          )}

          {activeTab === "archive" && (
            <div>
              <p className="mb-5 text-sm font-bold text-muted-foreground">{archivedWorks.length} عمل مخفي</p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {archivedWorks.map((w) => (
                  <WorkActionCard key={w.id} w={w} />
                ))}
              </div>
              {archivedWorks.length === 0 && (
                <p className="py-16 text-center text-muted-foreground">لا توجد أعمال في الأرشيف</p>
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-8">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="إجمالي الأعمال" value={stats.total} />
                <StatCard label="أبرز الأعمال" value={stats.featured} highlight />
                <StatCard label="ظاهر في الموقع" value={stats.visible} />
                <StatCard label="مخفي" value={stats.hidden} />
              </div>

              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-primary" size={24} />
                  <h2 className="text-xl font-black text-foreground">زيارات الموقع</h2>
                </div>
                <p className="mt-3 text-muted-foreground">
                  إحصائيات الزيارات ستكون متاحة قريباً. يمكنك ربط Google Analytics أو Supabase Analytics للحصول على بيانات دقيقة.
                </p>
                <div className="mt-6 flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground">
                  قريباً — عداد الزيارات
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showFeaturedModal && (
        <AddFeaturedModal
          nonFeatured={nonFeatured.map((w) => ({ slug: w.slug, client: w.client, service: w.service, img: imgUrl(w) }))}
          onClose={() => setShowFeaturedModal(false)}
        />
      )}
    </div>
  )
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
  disabled,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  active?: boolean
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      title={label}
      className={`flex flex-1 items-center justify-center gap-1.5 border-l border-border py-2.5 text-[11px] font-bold transition-colors last:border-l-0 disabled:opacity-40 ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : active
            ? "text-primary hover:bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-card"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-4xl font-black ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  )
}
