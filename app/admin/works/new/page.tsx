import Link from "next/link"
import { WorkForm } from "../work-form"

export default function NewWorkPage() {
  return (
    <div className="min-h-screen bg-[#111827] p-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-foreground">إضافة عمل جديد</h1>
          <Link
            href="/admin"
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-card"
          >
            العودة
          </Link>
        </div>
        <WorkForm />
      </div>
    </div>
  )
}
