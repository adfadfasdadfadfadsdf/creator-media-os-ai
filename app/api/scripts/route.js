import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const scripts = await prisma.shortScript.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json({ scripts })
}
