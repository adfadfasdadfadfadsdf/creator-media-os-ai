import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/dashboard/app-shell"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"

export default async function AppLayout({ children }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) redirect("/login")

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    redirect("/login")
  }

  const user = { id: payload.sub, name: payload.name, email: payload.email }

  return <AppShell user={user}>{children}</AppShell>
}
