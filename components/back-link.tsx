"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function BackLink() {
  const searchParams = useSearchParams()
  const from = searchParams.get("from")

  if (from === "featured") {
    return (
      <Link
        href="/#featured-works"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4" />
        العودة إلى أبرز الأعمال
      </Link>
    )
  }

  return (
    <Link
      href="/work"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
    >
      <ArrowRight className="size-4" />
      العودة إلى محفظة الأعمال
    </Link>
  )
}
