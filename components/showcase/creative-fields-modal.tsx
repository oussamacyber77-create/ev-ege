"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, X, Check } from "lucide-react"
import { CREATIVE_FIELDS } from "./creative-fields"

export function CreativeFieldsModal({
  selected,
  onSave,
  onClose,
}: {
  selected: string[]
  onSave: (fields: string[]) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<string[]>(selected)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const allUnique = useMemo(() => {
    const seen = new Set<string>()
    return [...CREATIVE_FIELDS.popular, ...CREATIVE_FIELDS.all].filter((f) => {
      if (seen.has(f)) return false
      seen.add(f)
      return true
    })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return allUnique.filter((f) => f.toLowerCase().includes(q))
  }, [search, allUnique])

  const popular = CREATIVE_FIELDS.popular

  function toggle(field: string) {
    setDraft((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field)
      }
      if (prev.length >= 3) return prev
      return [...prev, field]
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="اختيار الحقول الإبداعية"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-slate-700/50 bg-[#1e293b] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700/50 p-4">
          <h2 className="text-lg font-bold text-foreground">Creative Fields</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-slate-700/50 hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="relative border-b border-slate-700/50 px-4 py-3">
          <Search size={16} className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Creative Fields"
            className="w-full rounded-md border border-slate-700/50 bg-slate-800/50 px-9 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {search.trim() && filtered !== null ? (
            <div className="space-y-1">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No results found</p>
              )}
              {filtered.map((field) => (
                <FieldRow key={field} field={field} checked={draft.includes(field)} onToggle={toggle} />
              ))}
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Most Popular</p>
              <div className="mb-4 space-y-1">
                {popular.map((field) => (
                  <FieldRow key={field} field={field} checked={draft.includes(field)} onToggle={toggle} />
                ))}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">All Categories</p>
              <div className="space-y-1">
                {allUnique
                  .filter((f) => !popular.includes(f))
                  .sort((a, b) => {
                    const aNum = /^\d/.test(a)
                    const bNum = /^\d/.test(b)
                    if (aNum && !bNum) return 1
                    if (!aNum && bNum) return -1
                    return a.localeCompare(b)
                  })
                  .map((field) => (
                    <FieldRow key={field} field={field} checked={draft.includes(field)} onToggle={toggle} />
                  ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-700/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">{draft.length}/3 selected</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-700/50 px-4 py-2 text-sm text-foreground hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(draft)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldRow({ field, checked, onToggle }: { field: string; checked: boolean; onToggle: (f: string) => void }) {
  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-right text-sm transition-colors ${
        checked ? "bg-primary/15 text-primary" : "text-foreground hover:bg-slate-700/50"
      }`}
      disabled={!checked && false}
    >
      <div
        className={`flex size-5 shrink-0 items-center justify-center rounded border ${
          checked ? "border-primary bg-primary" : "border-slate-600 bg-transparent"
        }`}
      >
        {checked && <Check size={12} className="text-white" />}
      </div>
      <span>{field}</span>
    </button>
  )
}
