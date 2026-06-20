import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const type = new URL(request.url).searchParams.get("type")
  const where = { workspaceId: session.workspaceId }
  if (type && type !== "all") where.type = type.toUpperCase()

  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json({
    assets: assets.map((a) => ({
      id: a.id,
      type: a.type,
      fileName: a.fileName,
      mimeType: a.mimeType,
      size: a.size ? Number(a.size) : 0,
      fileUrl: `/api/media/file/${a.id}`,
      createdAt: a.createdAt,
    })),
  })
}
