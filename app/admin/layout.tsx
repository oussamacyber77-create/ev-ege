import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase-server"

export const metadata: Metadata = {
  icons: { icon: "/favicon-admin.svg" },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  if (!token) {
    redirect("/login")
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("token", token)
    .gte("expires_at", new Date().toISOString())
    .single()

  if (!session) {
    redirect("/login")
  }

  return <>{children}</>
}
