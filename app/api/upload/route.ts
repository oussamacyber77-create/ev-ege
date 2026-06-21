import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${crypto.randomUUID()}.${ext}`
  const filePath = `works/${fileName}`

  const { error } = await supabase.storage
    .from("work-images")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: publicUrl } = supabase.storage
    .from("work-images")
    .getPublicUrl(filePath)

  return NextResponse.json({ url: publicUrl.publicUrl })
}
