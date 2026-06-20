import { cookies } from "next/headers"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export const metadata = { title: "Dashboard — CreatorOS" }

export default async function DashboardPage() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  let name = "Creator"
  try {
    if (token) name = (await verifyToken(token)).name?.split(" ")[0] || name
  } catch {}

  return <DashboardContent name={name} />
}
