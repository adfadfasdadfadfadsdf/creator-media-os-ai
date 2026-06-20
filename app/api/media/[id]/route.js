import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { deleteFile } from "@/lib/storage"

export async function DELETE(_req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const asset = await prisma.mediaAsset.findFirst({
    where: { id, workspaceId: session.workspaceId },
  })
  if (!asset) return NextResponse.json({ message: "Not found" }, { status: 404 })

  if (asset.storageKey) await deleteFile(asset.storageKey)
  await prisma.mediaAsset.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
