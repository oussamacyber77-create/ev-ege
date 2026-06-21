"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { useRouter } from "next/navigation"

type WorkBrief = {
  slug: string
  client: string
  service: string
  img: string
}

export function AddFeaturedModal({
  nonFeatured,
  onClose,
}: {
  nonFeatured: WorkBrief[]
  onClose: () => void
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  async function handleSave() {
    if (selected.size === 0) return
    setSaving(true)

    for (const slug of selected) {
      await fetch(`/api/works/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: true }),
      })
    }

    setSaving(false)
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground">إضافة إلى أبرز الأعمال</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {nonFeatured.length === 0 ? (
          <p className="mt-6 text-center text-muted-foreground">جميع الأعمال مميزة بالفعل</p>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nonFeatured.map((w) => (
                <button
                  key={w.slug}
                  onClick={() => toggle(w.slug)}
                  className={`group relative overflow-hidden rounded-xl border text-right transition-all ${
                    selected.has(w.slug)
                      ? "border-primary ring-2 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={w.img || "/placeholder.svg"}
                      alt={w.client}
                      className="h-full w-full object-cover"
                    />
                    {selected.has(w.slug) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={20} />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-primary">{w.service}</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{w.client}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving || selected.size === 0}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : `إضافة (${selected.size})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
