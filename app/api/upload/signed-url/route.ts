import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-server"

const ALLOWED_TYPES = ["image/png", "image/jpeg"]
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"]
const MAX_SIZE = 8 * 1024 * 1024

export async function POST(request: Request) {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  if (!token) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("token", token)
    .gte("expires_at", new Date().toISOString())
    .single()

  if (!session) {
    return NextResponse.json({ error: "الجلسة منتهية" }, { status: 401 })
  }

  const { fileName, contentType, contentLength } = await request.json()

  if (!fileName || !contentType) {
    return NextResponse.json({ error: "اسم الملف ونوعه مطلوبان" }, { status: 400 })
  }

  const ext = "." + fileName.split(".").pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: "فقط PNG و JPG مسموح بها" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "نوع الملف غير مسموح" }, { status: 400 })
  }

  if (contentLength > MAX_SIZE) {
    return NextResponse.json({ error: "الملف كبير جداً (الحد الأقصى 8MB)" }, { status: 400 })
  }

  const uuid = crypto.randomUUID()
  const filePath = `showcase/${uuid}${ext}`

  const { data, error } = await supabase.storage
    .from("work-images")
    .createSignedUploadUrl(filePath)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path: data.path,
    token: data.token,
    publicUrl: supabase.storage.from("work-images").getPublicUrl(filePath).data.publicUrl,
  })
}
