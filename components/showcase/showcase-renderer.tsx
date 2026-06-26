import Image from "next/image"
import type { ShowcaseBlock } from "@/lib/showcase-types"

export function ShowcaseRenderer({ blocks }: { blocks: ShowcaseBlock[] }) {
  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block) => {
        switch (block.type) {
          case "image":
            return <ImageBlock key={block.id} block={block} />
          case "text":
            return <TextBlock key={block.id} block={block} />
          case "grid":
            return <GridBlock key={block.id} block={block} />
          default:
            return null
        }
      })}
    </div>
  )
}

function ImageBlock({ block }: { block: ShowcaseBlock & { type: "image" } }) {
  return (
    <div className={block.fullWidth ? "w-full" : "mx-auto w-full max-w-4xl"}>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <Image src={block.url} alt={block.alt || ""} fill sizes="(max-width: 768px) 100vw, 80vw" className="object-cover" />
      </div>
    </div>
  )
}

function TextBlock({ block }: { block: ShowcaseBlock & { type: "text" } }) {
  const Component = block.variant === "heading" ? "h3" : "p"
  const size = block.variant === "heading" ? "text-2xl font-black" : "text-base leading-relaxed"
  return (
    <div className={`mx-auto w-full max-w-3xl ${block.align === "center" ? "text-center" : "text-start"}`} dir="auto">
      <Component className={`${size} text-foreground`}>{block.content}</Component>
    </div>
  )
}

function GridBlock({ block }: { block: ShowcaseBlock & { type: "grid" } }) {
  return (
    <div
      className="mx-auto w-full max-w-5xl"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${block.columns}, 1fr)`,
        gap: "1rem",
      }}
    >
      {block.images.map((img, i) => (
        <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image src={img.url} alt={img.alt || ""} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      ))}
    </div>
  )
}
