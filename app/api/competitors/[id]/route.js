import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function DELETE(_req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.competitor.deleteMany({ where: { id, workspaceId: session.workspaceId } })
  return NextResponse.json({ ok: true })
}
