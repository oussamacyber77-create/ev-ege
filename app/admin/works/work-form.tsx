"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, X, Crown } from "lucide-react"

type WorkData = {
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
  images: string[]
  banner: string
  deliverables: string[]
}

export function WorkForm({ initialData }: { initialData?: Partial<WorkData> }) {
  const router = useRouter()
  const isEdit = !!initialData?.slug
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<WorkData>({
    slug: initialData?.slug || "",
    client: initialData?.client || "",
    title: initialData?.title || "",
    service: initialData?.service || "",
    sector: initialData?.sector || "",
    year: initialData?.year || "",
    description: initialData?.description || "",
    challenge: initialData?.challenge || "",
    solution: initialData?.solution || "",
    result: initialData?.result || "",
    hidden: initialData?.hidden || false,
    featured: initialData?.featured || false,
    images: initialData?.images || [],
    banner: initialData?.banner || "",
    deliverables: initialData?.deliverables || [],
  })

  const [uploading, setUploading] = useState(false)

  async function uploadImage(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const json = await res.json()
    if (json.url) {
      setData((prev) => ({
        ...prev,
        images: [...prev.images, json.url],
        banner: prev.banner || json.url,
      }))
    }
    setUploading(false)
  }

  function removeImage(index: number) {
    setData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  function addDeliverable() {
    setData((prev) => ({ ...prev, deliverables: [...prev.deliverables, ""] }))
  }

  function updateDeliverable(index: number, value: string) {
    setData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => (i === index ? value : d)),
    }))
  }

  function removeDeliverable(index: number) {
    setData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const body = {
      ...data,
      deliverables: data.deliverables.filter(Boolean),
    }

    const method = isEdit ? "PATCH" : "POST"
    const url = isEdit ? `/api/works/${initialData.slug}` : "/api/works"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/admin/works")
      router.refresh()
    } else {
      const json = await res.json()
      setError(json.error || "فشل الحفظ")
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="الاسم (Slug)" hint="مثل: amana-riyadh" dir="ltr">
          <input
            type="text"
            value={data.slug}
            onChange={(e) => setData((p) => ({ ...p, slug: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            required
            disabled={isEdit}
          />
        </FormField>

        <FormField label="العميل">
          <input
            type="text"
            value={data.client}
            onChange={(e) => setData((p) => ({ ...p, client: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            required
          />
        </FormField>

        <FormField label="عنوان العمل">
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            required
          />
        </FormField>

        <FormField label="الخدمة">
          <input
            type="text"
            value={data.service}
            onChange={(e) => setData((p) => ({ ...p, service: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            required
          />
        </FormField>

        <FormField label="القطاع">
          <input
            type="text"
            value={data.sector}
            onChange={(e) => setData((p) => ({ ...p, sector: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            required
          />
        </FormField>

        <FormField label="السنة">
          <input
            type="text"
            value={data.year}
            onChange={(e) => setData((p) => ({ ...p, year: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
          />
        </FormField>
      </div>

      <FormField label="الوصف">
        <textarea
          value={data.description}
          onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
          rows={4}
          required
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="التحدي">
          <textarea
            value={data.challenge}
            onChange={(e) => setData((p) => ({ ...p, challenge: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            rows={3}
          />
        </FormField>

        <FormField label="الحل">
          <textarea
            value={data.solution}
            onChange={(e) => setData((p) => ({ ...p, solution: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            rows={3}
          />
        </FormField>

        <FormField label="النتيجة">
          <textarea
            value={data.result}
            onChange={(e) => setData((p) => ({ ...p, result: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            rows={3}
          />
        </FormField>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">الصور</label>
        <p className="mt-1 text-xs text-muted-foreground">اختر صورة البنر (الغلاف) بالضغط على أيقونة التاج</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {data.images.map((url, i) => (
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {data.banner === url && (
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-lg">
                  <Crown size={12} />
                  بنر
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 transition-transform group-hover:translate-y-0">
                {data.banner !== url && (
                  <button
                    type="button"
                    onClick={() => setData((p) => ({ ...p, banner: url }))}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Crown size={11} />
                    تعيين كبنر
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const removed = data.images.filter((_, idx) => idx !== i)
                    setData((p) => ({
                      ...p,
                      images: removed,
                      banner: p.banner === url ? (removed[0] || "") : p.banner,
                    }))
                  }}
                  className="flex items-center gap-1 rounded-lg bg-red-500/80 px-3 py-1.5 text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                >
                  <X size={11} />
                  حذف
                </button>
              </div>
            </div>
          ))}
          <label className="flex aspect-[4/3] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary">
            {uploading ? (
              <span className="text-sm text-muted-foreground">جاري الرفع...</span>
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImagePlus size={24} />
                <span className="text-xs">إضافة صورة</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">المنجزات</label>
          <button
            type="button"
            onClick={addDeliverable}
            className="text-xs font-bold text-primary hover:underline"
          >
            + إضافة
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.deliverables.map((d, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
              <input
                type="text"
                value={d}
                onChange={(e) => updateDeliverable(i, e.target.value)}
                className="min-w-[80px] bg-transparent text-sm text-foreground outline-none"
              />
              <button type="button" onClick={() => removeDeliverable(i)} className="text-muted-foreground hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={data.featured}
            onChange={(e) => setData((p) => ({ ...p, featured: e.target.checked }))}
            className="size-4 accent-primary"
          />
          أبرز الأعمال
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={data.hidden}
            onChange={(e) => setData((p) => ({ ...p, hidden: e.target.checked }))}
            className="size-4 accent-primary"
          />
          مخفي
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة العمل"}
      </button>
    </form>
  )
}

function FormField({ label, hint, children, dir }: { label: string; hint?: string; children: React.ReactNode; dir?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {hint && <span className="mr-2 text-xs text-muted-foreground">({hint})</span>}
      </label>
      <div className="mt-2" dir={dir}>
        {children}
      </div>
    </div>
  )
}
