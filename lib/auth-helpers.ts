import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabase } from "./supabase-server"

export async function checkAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  if (!token) {
    redirect("/admin/login")
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("token", token)
    .gte("expires_at", new Date().toISOString())
    .single()

  if (!session) {
    redirect("/admin/login")
  }

  return true
}
