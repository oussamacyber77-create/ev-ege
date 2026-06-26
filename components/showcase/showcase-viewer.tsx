"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import type { Showcase } from "@/lib/showcase-types"
import { ShowcaseRenderer } from "./showcase-renderer"

export function ShowcaseTrigger({ showcase }: { showcase: Showcase }) {
  const [open, setOpen] = useState(false)
  const blocksExist = showcase.blocks.length > 0

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!blocksExist) return null

  return (
    <>
      <div className="mt-16">
        <h2 className="text-3xl font-black">ملف العرض</h2>
        <button
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/50"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {showcase.blocks[0]?.type === "image" && showcase.blocks[0].url ? (
            <div className="relative aspect-[16/9] w-40 shrink-0 overflow-hidden rounded-lg">
              <img src={showcase.blocks[0].url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-40 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="text-2xl font-bold">{showcase.blocks.length}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground">عرض تفصيلي للمشروع</p>
            <p className="mt-1 text-sm text-muted-foreground">{showcase.blocks.length} بلوك</p>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="ملف العرض"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 lg:px-8">
              <h2 className="text-lg font-bold text-foreground">ملف العرض</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 lg:py-12">
                <ShowcaseRenderer blocks={showcase.blocks} />

                {/* ── Settings meta ── */}
                {(showcase.settings.categories.length > 0 ||
                  showcase.settings.tags.length > 0 ||
                  showcase.settings.toolsUsed) && (
                  <div className="mt-16 border-t border-border pt-8" dir="rtl">
                    {showcase.settings.categories.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-2 text-sm font-semibold text-foreground">Creative Fields</h3>
                        <div className="flex flex-wrap gap-2">
                          {showcase.settings.categories.map((c) => (
                            <span key={c} className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {showcase.settings.tags.length > 0 && (
                      <div className="mb-6">
                        <h3 className="mb-2 text-sm font-semibold text-foreground">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {showcase.settings.tags.map((t) => (
                            <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {showcase.settings.toolsUsed && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-foreground">Tools Used</h3>
                        <p className="text-sm text-muted-foreground">{showcase.settings.toolsUsed}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
