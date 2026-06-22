"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus, Star, Archive, BarChart3, FolderOpen, Pencil, Trash2,
  EyeOff, Eye, MoreHorizontal, LogOut, AlertTriangle, User,
} from "lucide-react"

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
  updated_at: string
  created_at: string
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

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}/${m}/${day}`
}

function imgUrl(w: WorkFull) {
  return w.banner || w.images?.[0]?.url || "/placeholder.svg"
}

function ConfirmDialog({
  open, title, message, confirmLabel, onConfirm, onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-lg border border-slate-700/50 bg-[#1e293b] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-500/20">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            style={{cursor:'pointer'}}
            className="rounded-md border border-slate-700/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-800"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            style={{cursor:'pointer'}}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-red-600"
          >
            {confirmLabel || "حذف"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Standalone ActionMenu (outside main component to prevent remount flicker) ──

function ActionMenu({ w, close, toggling, onToggleFeatured, onToggleHidden, onDeleteClick }: {
  w: WorkFull
  close: () => void
  toggling: string | null
  onToggleFeatured: (slug: string, current: boolean) => void
  onToggleHidden: (slug: string, current: boolean) => void
  onDeleteClick: (slug: string) => void
}) {
  const items: { label: string; icon: React.ElementType; onClick: () => void; danger?: boolean }[] = [
    {
      label: w.featured ? "إزالة تمييز" : "تمييز",
      icon: Star,
      onClick: () => onToggleFeatured(w.slug, w.featured),
    },
    {
      label: w.hidden ? "إظهار" : "إخفاء",
      icon: w.hidden ? Eye : EyeOff,
      onClick: () => onToggleHidden(w.slug, w.hidden),
    },
    {
      label: "حذف",
      icon: Trash2,
      onClick: () => { close(); onDeleteClick(w.slug) },
      danger: true,
    },
  ]

  return (
    <div className="absolute bottom-full left-0 z-50 mb-1 w-44 overflow-hidden rounded-lg border border-slate-700/50 bg-[#1e293b] shadow-xl">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          disabled={toggling === w.slug}
          style={{cursor:'pointer'}}
          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-sm transition-colors disabled:opacity-40 ${
            item.danger
              ? "text-red-400 hover:bg-red-500/10"
              : "text-foreground hover:bg-slate-700/50"
          }`}
        >
          <item.icon size={14} />
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ── Standalone WorkCard (outside main component to prevent remount flicker) ──

function WorkCard({ w, openMenu, toggling, onToggleMenu, onToggleFeatured, onToggleHidden, onDeleteClick }: {
  w: WorkFull
  openMenu: string | null
  toggling: string | null
  onToggleMenu: (slug: string | null) => void
  onToggleFeatured: (slug: string, current: boolean) => void
  onToggleHidden: (slug: string, current: boolean) => void
  onDeleteClick: (slug: string) => void
}) {
  const isBusy = toggling === w.slug
  return (
    <div className="group relative z-[60] rounded-lg border border-slate-700/50 bg-[#1e293b] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <Link href={`/admin/works/${w.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-slate-800">
          <img
            src={imgUrl(w)}
            alt={w.client}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {w.featured && (
            <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary shadow">
              <Star size={14} className="text-white" />
            </span>
          )}
          {w.hidden && (
            <span className="absolute right-2 top-2 rounded-sm bg-red-500/80 px-2 py-0.5 text-[10px] font-semibold text-white">
              مخفي
            </span>
          )}
        </div>
        <div className="p-3.5 pb-2">
          <h3 className="truncate text-sm font-bold text-foreground">{w.client}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {w.service}
            </span>
            <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {w.sector}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-slate-700/50 px-3.5 py-2">
        <Link
          href={`/admin/works/${w.slug}`}
          style={{cursor:'pointer'}}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Pencil size={12} />
          تعديل
        </Link>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMenu(openMenu === w.slug ? null : w.slug) }}
            disabled={isBusy}
            style={{cursor:'pointer'}}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-slate-700/50 hover:text-foreground disabled:opacity-40"
          >
            <MoreHorizontal size={16} />
          </button>
          {openMenu === w.slug && (
            <ActionMenu
              w={w}
              close={() => onToggleMenu(null)}
              toggling={toggling}
              onToggleFeatured={onToggleFeatured}
              onToggleHidden={onToggleHidden}
              onDeleteClick={onDeleteClick}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function TabbedDashboard({ works, stats }: { works: WorkFull[]; stats: Stats }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>("all")
  const [toggling, setToggling] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const deleteSlugRef = useRef("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAllServices, setShowAllServices] = useState(false)

  const allWorks = works
  const featuredWorks = works.filter((w) => w.featured)
  const archivedWorks = works.filter((w) => w.hidden)
  const nonFeatured = works.filter((w) => !w.featured && !w.hidden)

  const deleteSlug = showDeleteConfirm ? deleteSlugRef.current : null
  const deleteWorkObj = deleteSlug ? works.find((w) => w.slug === deleteSlug) || null : null
  const anyMenuOpen = showUserMenu || openMenu !== null

  // ── API handlers ──

  async function toggleFeatured(slug: string, current: boolean) {
    setToggling(slug)
    setOpenMenu(null)
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
    setOpenMenu(null)
    await fetch(`/api/works/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !current }),
    })
    setToggling(null)
    router.refresh()
  }

  async function confirmDelete() {
    const slug = deleteSlugRef.current
    if (!slug) return
    setToggling(slug)
    setShowDeleteConfirm(false)
    setDeleteError("")
    try {
      const res = await fetch(`/api/works/${slug}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setDeleteError(json.error || "فشل الحذف، حاول مرة أخرى")
        setToggling(null)
        return
      }
      setToggling(null)
      router.refresh()
    } catch {
      setDeleteError("فشل الاتصال بالخادم")
      setToggling(null)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" })
    window.location.href = "/login"
  }

  // ── Stats computations ──

  function computeServiceDist() {
    const map: Record<string, number> = {}
    works.forEach((w) => { map[w.service] = (map[w.service] || 0) + 1 })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: works.length ? Math.round((count / works.length) * 100) : 0 }))
  }

  function computeSectorDist() {
    const map: Record<string, number> = {}
    works.forEach((w) => { map[w.sector] = (map[w.sector] || 0) + 1 })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }

  function computeLatestUpdated() {
    return [...works]
      .filter((w) => w.updated_at)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
  }

  const serviceDist = computeServiceDist()
  const sectorDist = computeSectorDist()
  const latestUpdated = computeLatestUpdated()
  const displayedServices = showAllServices ? serviceDist : serviceDist.slice(0, 8)
  const hasMoreServices = serviceDist.length > 8

  // ── Summary bar ──

  const latestUpdateDate = works.reduce<string | null>((latest, w) => {
    if (!w.updated_at) return latest
    return !latest || new Date(w.updated_at) > new Date(latest) ? w.updated_at : latest
  }, null)

  return (
    <div className="min-h-screen bg-[#0f172a]" dir="rtl">
      <div className="mx-auto max-w-[1280px] px-6 py-5 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon-admin.svg" alt="" className="size-7 opacity-60" />
            <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/works/new"
              style={{cursor:'pointer'}}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              إضافة عمل
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{cursor:'pointer'}}
                className="flex size-9 items-center justify-center rounded-md border border-slate-700/50 text-muted-foreground transition-colors hover:bg-slate-800 hover:text-foreground"
              >
                <User size={17} />
              </button>
              {showUserMenu && (
                <div className="absolute left-0 top-full z-[70] mt-1 w-40 overflow-hidden rounded-lg border border-slate-700/50 bg-[#1e293b] shadow-xl">
                  <button
                    onClick={handleLogout}
                    style={{cursor:'pointer'}}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-slate-700/50"
                  >
                    <LogOut size={14} />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Summary bar ── */}
        <div className="mt-5 grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-3">
            <p className="text-[11px] text-muted-foreground">إجمالي</p>
            <p className="mt-0.5 text-xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-3">
            <p className="text-[11px] text-muted-foreground">مميز</p>
            <p className="mt-0.5 text-xl font-bold text-primary">{stats.featured}</p>
          </div>
          <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-3">
            <p className="text-[11px] text-muted-foreground">مخفي</p>
            <p className="mt-0.5 text-xl font-bold text-foreground">{stats.hidden}</p>
          </div>
          <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-3">
            <p className="text-[11px] text-muted-foreground">آخر تعديل</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {latestUpdateDate ? formatDate(latestUpdateDate) : "—"}
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-5 flex items-center justify-start gap-1 border-b border-slate-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const count =
              tab.id === "all" ? allWorks.length
                : tab.id === "featured" ? featuredWorks.length
                  : tab.id === "archive" ? archivedWorks.length
                    : null
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{cursor:'pointer'}}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {count !== null && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive ? "bg-primary/15 text-primary" : "bg-slate-700/50 text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Tab content ── */}
        <div className="mt-5">

          {/* ── ALL WORKS ── */}
          {activeTab === "all" && (
            allWorks.length === 0 ? <EmptyState /> : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allWorks.map((w) => <WorkCard
                  key={w.id}
                  w={w}
                  openMenu={openMenu}
                  toggling={toggling}
                  onToggleMenu={(slug) => setOpenMenu(slug)}
                  onToggleFeatured={toggleFeatured}
                  onToggleHidden={toggleHidden}
                  onDeleteClick={(slug) => { deleteSlugRef.current = slug; setDeleteError(""); setShowDeleteConfirm(true) }}
                />)}
              </div>
            )
          )}

          {/* ── FEATURED ── */}
          {activeTab === "featured" && (
            <div>
              {featuredWorks.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    {featuredWorks.length} مشروع مميز
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredWorks.map((w) => <WorkCard
                  key={w.id}
                  w={w}
                  openMenu={openMenu}
                  toggling={toggling}
                  onToggleMenu={(slug) => setOpenMenu(slug)}
                  onToggleFeatured={toggleFeatured}
                  onToggleHidden={toggleHidden}
                  onDeleteClick={(slug) => { deleteSlugRef.current = slug; setDeleteError(""); setShowDeleteConfirm(true) }}
                />)}
                  </div>
                </div>
              )}

              {featuredWorks.length === 0 && nonFeatured.length === 0 && (
                <p className="py-12 text-center text-muted-foreground">لا توجد مشاريع بعد</p>
              )}

              {featuredWorks.length === 0 && nonFeatured.length > 0 && (
                <p className="mb-3 text-sm font-medium text-muted-foreground">لم يتم تمييز أي مشروع بعد</p>
              )}

              {nonFeatured.length > 0 && (
                <div className={featuredWorks.length > 0 ? "mt-8 border-t border-slate-700/50 pt-6" : ""}>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">متاح للتمييز</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {nonFeatured.map((w) => (
                      <div key={w.id} className="rounded-lg border border-slate-700/50 bg-[#1e293b] transition-all hover:border-primary/30">
                        <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-slate-800">
                          <img src={imgUrl(w)} alt={w.client} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-3.5 pb-2">
                          <h3 className="truncate text-sm font-bold text-foreground">{w.client}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{w.service}</p>
                        </div>
                        <div className="border-t border-slate-700/50 px-3.5 py-2">
                          <button
                            onClick={() => toggleFeatured(w.slug, false)}
                            disabled={toggling === w.slug}
                            style={{cursor:'pointer'}}
                            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            <Star size={12} />
                            تمييز
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nonFeatured.length === 0 && featuredWorks.length > 0 && (
                <p className="mt-6 text-center text-sm text-muted-foreground">جميع المشاريع مميزة بالفعل ✓</p>
              )}
            </div>
          )}

          {/* ── ARCHIVE ── */}
          {activeTab === "archive" && (
            archivedWorks.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">لا توجد مشاريع في الأرشيف</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archivedWorks.map((w) => <WorkCard
                  key={w.id}
                  w={w}
                  openMenu={openMenu}
                  toggling={toggling}
                  onToggleMenu={(slug) => setOpenMenu(slug)}
                  onToggleFeatured={toggleFeatured}
                  onToggleHidden={toggleHidden}
                  onDeleteClick={(slug) => { deleteSlugRef.current = slug; setDeleteError(""); setShowDeleteConfirm(true) }}
                />)}
              </div>
            )
          )}

          {/* ── STATS ── */}
          {activeTab === "stats" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* توزيع الخدمات */}
              <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">توزيع الخدمات</h3>
                {displayedServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-2.5">
                    {displayedServices.map((s) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <span className="w-24 truncate text-xs text-foreground">{s.name}</span>
                        <div className="flex-1">
                          <div className="h-3.5 rounded-sm bg-slate-700/50">
                            <div
                              className="h-full rounded-sm bg-primary/70 transition-all"
                              style={{ width: `${s.pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-8 text-right text-xs text-muted-foreground">{s.count}</span>
                      </div>
                    ))}
                    {hasMoreServices && (
                      <button
                        onClick={() => setShowAllServices(!showAllServices)}
                        style={{cursor:'pointer'}}
                        className="mt-2 text-xs font-medium text-primary hover:underline"
                      >
                        {showAllServices ? "عرض أقل" : `عرض الكل (${serviceDist.length})`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* حالة النشر */}
              <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">حالة النشر</h3>
                {stats.total === 0 ? (
                  <p className="text-xs text-muted-foreground">لا توجد بيانات</p>
                ) : (
                  <div className="flex gap-4">
                    <div className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                      <p className="text-xs text-muted-foreground">منشور</p>
                      <p className="mt-1 text-2xl font-bold text-green-400">{stats.visible}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Math.round((stats.visible / stats.total) * 100)}%
                      </p>
                    </div>
                    <div className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                      <p className="text-xs text-muted-foreground">مخفي</p>
                      <p className="mt-1 text-2xl font-bold text-red-400">{stats.hidden}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {Math.round((stats.hidden / stats.total) * 100)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* توزيع القطاعات */}
              <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">توزيع القطاعات</h3>
                {sectorDist.length === 0 ? (
                  <p className="text-xs text-muted-foreground">لا توجد بيانات</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sectorDist.map((s) => (
                      <span
                        key={s.name}
                        className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/50 px-3 py-1.5 text-xs text-foreground"
                      >
                        {s.name}
                        <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {s.count}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* آخر التعديلات */}
              <div className="rounded-lg border border-slate-700/50 bg-[#1e293b] p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">آخر التعديلات</h3>
                {latestUpdated.length === 0 ? (
                  <p className="text-xs text-muted-foreground">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-2">
                    {latestUpdated.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between rounded-md bg-slate-800/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground">{w.client}</span>
                          <span className="text-[11px] text-muted-foreground">{w.service}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{formatDate(w.updated_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Global overlay for menus ── */}
      {anyMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowUserMenu(false); setOpenMenu(null) }} />
      )}

      {/* ── Delete error ── */}
      {deleteError && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-md border border-red-400/30 bg-[#1e293b] px-5 py-3 text-sm text-red-400 shadow-lg">
          {deleteError}
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="حذف العمل"
        message={`هل أنت متأكد من حذف "${deleteWorkObj?.client || ""}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteConfirm(false); setDeleteError("") }}
      />
    </div>
  )
}

// ── Empty state ──

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <FolderOpen size={48} className="text-slate-600" />
      <p className="mt-4 text-base font-medium text-muted-foreground">لا توجد مشاريع بعد</p>
      <p className="mt-1 text-sm text-slate-600">أضف أول مشروع لبدء إدارة أعمالك</p>
      <Link
        href="/admin/works/new"
        style={{cursor:'pointer'}}
        className="mt-6 flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus size={16} />
        أضف أول مشروع
      </Link>
    </div>
  )
}
