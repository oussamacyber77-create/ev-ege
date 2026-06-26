export type ShowcaseBlockImage = {
  id: string
  type: "image"
  url: string
  alt?: string
  fullWidth?: boolean
}

export type ShowcaseBlockText = {
  id: string
  type: "text"
  content: string
  variant?: "heading" | "paragraph"
  align?: "start" | "center"
}

export type ShowcaseBlockGrid = {
  id: string
  type: "grid"
  columns: 2 | 3
  images: { url: string; alt?: string }[]
}

export type ShowcaseBlock = ShowcaseBlockImage | ShowcaseBlockText | ShowcaseBlockGrid

export interface ShowcaseSettings {
  categories: string[]
  tags: string[]
  toolsUsed?: string
}

export interface Showcase {
  version: 1
  settings: ShowcaseSettings
  blocks: ShowcaseBlock[]
}

export const EMPTY_SHOWCASE: Showcase = {
  version: 1,
  settings: { categories: [], tags: [] },
  blocks: [],
}
