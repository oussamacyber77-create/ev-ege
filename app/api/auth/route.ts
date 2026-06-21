import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!password) {
    return NextResponse.json({ error: "كلمة السر مطلوبة" }, { status: 400 })
  }

  const { data: admin } = await supabase
    .from("admin")
    .select("password_hash")
    .single()

  if (!admin) {
    return NextResponse.json({ error: "لم يتم إعداد الداشبورد بعد" }, { status: 500 })
  }

  const valid = await bcrypt.compare(password, admin.password_hash)

  if (!valid) {
    return NextResponse.json({ error: "كلمة السر غير صحيحة" }, { status: 401 })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from("sessions")
    .insert({ token, expires_at: expiresAt.toISOString() })

  if (error) {
    return NextResponse.json({ error: "فشل إنشاء الجلسة" }, { status: 500 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return response
}

export async function DELETE() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  if (token) {
    await supabase.from("sessions").delete().eq("token", token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete("admin_token")

  return response
}
