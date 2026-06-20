import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const projects = await prisma.project.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { mediaAssets: true, shorts: true, scripts: true } } },
  })
  return NextResponse.json({ projects })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const { name, niche, platform, language } = await request.json()
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ message: "Project name must be at least 2 characters." }, { status: 400 })
    }
    const project = await prisma.project.create({
      data: {
        workspaceId: session.workspaceId,
        name: name.trim(),
        niche: niche?.trim() || null,
        platform: platform?.trim() || null,
        language: language?.trim() || "en",
        status: "active",
      },
      include: { _count: { select: { mediaAssets: true, shorts: true, scripts: true } } },
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch (e) {
    console.error("Create project error:", e)
    return NextResponse.json({ message: "Could not create project." }, { status: 500 })
  }
}
