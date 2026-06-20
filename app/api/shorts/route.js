import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const shorts = await prisma.short.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json({
    shorts: shorts.map((s) => ({
      id: s.id,
      title: s.title,
      outputUrl: s.outputUrl,
      aspectRatio: s.aspectRatio,
      status: s.status,
      duration: s.duration,
      createdAt: s.createdAt,
    })),
  })
}
