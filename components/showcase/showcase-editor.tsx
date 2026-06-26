"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, Copy, ImageIcon, Type, Grid3X3, Settings, Plus, Upload } from "lucide-react"
import type { Showcase, ShowcaseBlock, ShowcaseBlockImage, ShowcaseBlockText, ShowcaseBlockGrid, ShowcaseSettings } from "@/lib/showcase-types"
import { EMPTY_SHOWCASE } from "@/lib/showcase-types"
import { ShowcaseRenderer } from "./showcase-renderer"
import { ShowcaseSettingsModal } from "./showcase-settings-modal"
import { supabase } from "@/lib/supabase-browser"

const ALLOWED_TYPES = ["image/png", "image/jpeg"]
const MAX_SIZE = 8 * 1024 * 1024

export function ShowcaseEditor({
  showcase,
  onChange,
}: {
  showcase: Showcase
  onChange: (s: Showcase) => void
}) {
  const [showSettings, setShowSettings] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const setBlocks = useCallback(
    (blocks: ShowcaseBlock[]) => {
      onChange({ ...showcase, blocks })
    },
    [showcase, onChange]
  )

  function addBlock(type: ShowcaseBlock["type"]) {
    const id = crypto.randomUUID()
    let block: ShowcaseBlock
    switch (type) {
      case "image":
        block = { id, type: "image", url: "", alt: "", fullWidth: false } as ShowcaseBlockImage
        break
      case "text":
        block = { id, type: "text", content: "", variant: "paragraph", align: "start" } as ShowcaseBlockText
        break
      case "grid":
        block = { id, type: "grid", columns: 2, images: [] } as ShowcaseBlockGrid
        break
    }
    setBlocks([...showcase.blocks, block])
  }

  function duplicateBlock(id: string) {
    const idx = showcase.blocks.findIndex((b) => b.id === id)
    if (idx === -1) return
    const block = { ...showcase.blocks[idx], id: crypto.randomUUID() }
    const blocks = [...showcase.blocks]
    blocks.splice(idx + 1, 0, block)
    setBlocks(blocks)
  }

  function removeBlock(id: string) {
    setBlocks(showcase.blocks.filter((b) => b.id !== id))
  }

  function updateBlock(id: string, updates: Partial<ShowcaseBlock>) {
    setBlocks(showcase.blocks.map((b) => (b.id === id ? ({ ...b, ...updates } as ShowcaseBlock) : b)))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = showcase.blocks.findIndex((b) => b.id === active.id)
    const newIndex = showcase.blocks.findIndex((b) => b.id === over.id)
    setBlocks(arrayMove(showcase.blocks, oldIndex, newIndex))
  }

  async function uploadImage(): Promise<string | null> {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".png,.jpg,.jpeg"
    const file = await new Promise<File | null>((resolve) => {
      input.onchange = () => resolve(input.files?.[0] || null)
      input.click()
    })
    if (!file) return null

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("فقط PNG و JPG مسموح بها")
      return null
    }
    if (file.size > MAX_SIZE) {
      alert("الملف كبير جداً (الحد الأقصى 8MB)")
      return null
    }

    try {
      const res = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          contentLength: file.size,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "فشل الرفع")
        return null
      }

      const { signedUrl, path, token } = await res.json()

      const { error: uploadError } = await supabase.storage
        .from("work-images")
        .uploadToSignedUrl(path, token, file)

      if (uploadError) {
        alert("فشل رفع الملف إلى التخزين")
        return null
      }

      const { data: publicUrlData } = supabase.storage.from("work-images").getPublicUrl(path)
      return publicUrlData.publicUrl
    } catch {
      alert("حدث خطأ أثناء الرفع")
      return null
    }
  }

  function updateSettings(settings: ShowcaseSettings) {
    onChange({ ...showcase, settings })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <AddBlockButton icon={ImageIcon} label="Image" onClick={() => addBlock("image")} />
          <AddBlockButton icon={Type} label="Text" onClick={() => addBlock("text")} />
          <AddBlockButton icon={Grid3X3} label="Photo Grid" onClick={() => addBlock("grid")} />
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 rounded-md border border-slate-700/50 px-3 py-2 text-sm text-foreground hover:bg-slate-800"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      {showcase.blocks.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50">
          <p className="text-sm text-muted-foreground">Click the buttons above to add content blocks</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={showcase.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {showcase.blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={(updates) => updateBlock(block.id, updates)}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onRemove={() => removeBlock(block.id)}
                  onUploadImage={uploadImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showSettings && (
        <ShowcaseSettingsModal
          settings={showcase.settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

function AddBlockButton({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-foreground transition-colors hover:border-primary hover:bg-slate-800"
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function SortableBlock({
  block,
  onUpdate,
  onDuplicate,
  onRemove,
  onUploadImage,
}: {
  block: ShowcaseBlock
  onUpdate: (updates: Partial<ShowcaseBlock>) => void
  onDuplicate: () => void
  onRemove: () => void
  onUploadImage: () => Promise<string | null>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-lg border border-slate-700/50 bg-[#1e293b] p-1 transition-colors hover:border-primary/30"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-3 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-slate-700/50 hover:text-foreground group-hover:opacity-100"
          aria-label="سحب لإعادة الترتيب"
        >
          <GripVertical size={16} />
        </button>

        <div className="min-w-0 flex-1">
          {block.type === "image" && (
            <ImageBlockEditor block={block} onUpdate={onUpdate} onUploadImage={onUploadImage} />
          )}
          {block.type === "text" && (
            <TextBlockEditor block={block} onUpdate={onUpdate} />
          )}
          {block.type === "grid" && (
            <GridBlockEditor block={block} onUpdate={onUpdate} onUploadImage={onUploadImage} />
          )}
        </div>
      </div>

      <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <ControlButton icon={Copy} label="تكرار" onClick={onDuplicate} />
        <ControlButton icon={Trash2} label="حذف" onClick={onRemove} danger />
      </div>
    </div>
  )
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
        danger
          ? "bg-red-500/80 text-white hover:bg-red-500"
          : "bg-slate-700/80 text-foreground hover:bg-slate-600"
      }`}
      aria-label={label}
    >
      <Icon size={12} />
    </button>
  )
}

function ImageBlockEditor({
  block,
  onUpdate,
  onUploadImage,
}: {
  block: ShowcaseBlockImage
  onUpdate: (updates: Partial<ShowcaseBlock>) => void
  onUploadImage: () => Promise<string | null>
}) {
  return (
    <div className="p-3">
      {block.url ? (
        <div className="relative cursor-pointer" onClick={async () => {
          const url = await onUploadImage()
          if (url) onUpdate({ url })
        }}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <img src={block.url} alt={block.alt || ""} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <Upload size={24} className="text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={block.fullWidth || false}
                onChange={(e) => onUpdate({ fullWidth: e.target.checked })}
                className="size-3.5 accent-primary"
              />
              Full width
            </label>
          </div>
        </div>
      ) : (
        <button
          onClick={onUploadImage}
          className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50 text-sm text-muted-foreground transition-colors hover:border-primary"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} />
            <span>Click to upload image</span>
          </div>
        </button>
      )}
    </div>
  )
}

function TextBlockEditor({
  block,
  onUpdate,
}: {
  block: ShowcaseBlockText
  onUpdate: (updates: Partial<ShowcaseBlock>) => void
}) {
  return (
    <div className="p-3">
      <div className="mb-2 flex gap-2">
        <button
          onClick={() => onUpdate({ variant: block.variant === "heading" ? "paragraph" : "heading" })}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            block.variant === "heading" ? "bg-primary/20 text-primary" : "bg-slate-700/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          {block.variant === "heading" ? "Heading" : "Paragraph"}
        </button>
        <button
          onClick={() => onUpdate({ align: block.align === "center" ? "start" : "center" })}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            block.align === "center" ? "bg-primary/20 text-primary" : "bg-slate-700/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          {block.align === "center" ? "Centered" : "Left"}
        </button>
      </div>
      <textarea
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Type your content here..."
        className="w-full rounded-md border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        rows={block.variant === "heading" ? 2 : 4}
        dir="auto"
      />
    </div>
  )
}

function GridBlockEditor({
  block,
  onUpdate,
  onUploadImage,
}: {
  block: ShowcaseBlockGrid
  onUpdate: (updates: Partial<ShowcaseBlock>) => void
  onUploadImage: () => Promise<string | null>
}) {
  async function addGridImage() {
    const url = await onUploadImage()
    if (url) {
      onUpdate({ images: [...block.images, { url, alt: "" }] })
    }
  }

  function removeGridImage(index: number) {
    onUpdate({ images: block.images.filter((_, i) => i !== index) })
  }

  return (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Columns:</label>
        <select
          value={block.columns}
          onChange={(e) => onUpdate({ columns: Number(e.target.value) as 2 | 3 })}
          className="rounded-md border border-slate-700/50 bg-slate-800/50 px-2 py-1 text-xs text-foreground outline-none"
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>

      <div
        className="gap-3"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${block.columns}, 1fr)`,
        }}
      >
        {block.images.map((img, i) => (
          <div key={i} className="group/img relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-800">
            <img src={img.url} alt={img.alt || ""} className="h-full w-full object-cover" />
            <button
              onClick={() => removeGridImage(i)}
              className="absolute left-1 top-1 rounded-md bg-red-500/80 p-1 text-white opacity-0 transition-opacity group-hover/img:opacity-100"
              aria-label="حذف الصورة"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={addGridImage}
          className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-slate-700/50 text-muted-foreground transition-colors hover:border-primary"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  )
}
