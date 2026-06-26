"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import type { ShowcaseSettings } from "@/lib/showcase-types"
import { CreativeFieldsModal } from "./creative-fields-modal"

export function ShowcaseSettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: ShowcaseSettings
  onSave: (s: ShowcaseSettings) => void
  onClose: () => void
}) {
  const [categories, setCategories] = useState<string[]>(settings.categories)
  const [tags, setTags] = useState<string[]>(settings.tags)
  const [toolsUsed, setToolsUsed] = useState(settings.toolsUsed || "")
  const [tagInput, setTagInput] = useState("")
  const [showCreativeFields, setShowCreativeFields] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    overlayRef.current?.focus()
  }, [])

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t])
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      addTag()
    }
  }

  function handleSave() {
    onSave({ categories, tags, toolsUsed: toolsUsed || undefined })
    onClose()
  }

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="إعدادات ملف العرض"
        tabIndex={-1}
      >
        <div
          className="flex w-full max-w-lg flex-col rounded-xl border border-slate-700/50 bg-[#1e293b] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-700/50 p-4">
            <h2 className="text-lg font-bold text-foreground">Project Information</h2>
            <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-slate-700/50 hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 overflow-y-auto p-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Category</label>
              <p className="mt-1 text-xs text-muted-foreground">Up to 3 creative fields</p>
              <button
                onClick={() => setShowCreativeFields(true)}
                className="mt-2 flex w-full flex-wrap gap-1.5 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2.5 text-right text-sm text-foreground hover:border-primary"
              >
                {categories.length === 0 ? (
                  <span className="text-muted-foreground">Select category...</span>
                ) : (
                  categories.map((c) => (
                    <span key={c} className="rounded-md bg-primary/15 px-2 py-0.5 text-xs text-primary">{c}</span>
                  ))
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Tags</label>
              <p className="mt-1 text-xs text-muted-foreground">Up to 10 keywords</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-md bg-slate-700/50 px-2.5 py-1 text-xs text-foreground">
                    {t}
                    <button onClick={() => removeTag(t)} className="text-muted-foreground hover:text-red-400">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={tags.length >= 10 ? "Max 10 tags" : "Type and press Enter"}
                  disabled={tags.length >= 10}
                  className="flex-1 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
                />
                <button
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Tools Used</label>
              <p className="mt-1 text-xs text-muted-foreground">Software / hardware / materials</p>
              <input
                type="text"
                value={toolsUsed}
                onChange={(e) => setToolsUsed(e.target.value)}
                placeholder="e.g. Photoshop, Illustrator, Figma"
                className="mt-2 w-full rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-700/50 p-4">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-700/50 px-4 py-2 text-sm text-foreground hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {showCreativeFields && (
        <CreativeFieldsModal
          selected={categories}
          onSave={(fields) => setCategories(fields)}
          onClose={() => setShowCreativeFields(false)}
        />
      )}
    </>
  )
}
