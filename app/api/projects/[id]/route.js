import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

async function owned(id, workspaceId) {
  const p = await prisma.project.findFirst({ where: { id, workspaceId }, select: { id: true } })
  return !!p
}

export async function GET(_req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const project = await prisma.project.findFirst({
    where: { id, workspaceId: session.workspaceId },
    include: { _count: { select: { mediaAssets: true, shorts: true, scripts: true } } },
  })
  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json({ project })
}

export async function PUT(request, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  const { id } = await params
  if (!(await owned(id, session.workspaceId))) return NextResponse.json({ message: "Not found" }, { status: 404 })

  const body = await request.json()
  const data = {}
  for (const k of ["name", "niche", "platform", "language", "status"]) {
    if (body[k] !== undefined) data[k] = body[k]
  }
  const project = await prisma.project.update({ where: { id }, data })
  return NextResponse.json({ project })
}

export async function DELETE(_req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  const { id } = await params
  if (!(await owned(id, session.workspaceId))) return NextResponse.json({ message: "Not found" }, { status: 404 })

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
