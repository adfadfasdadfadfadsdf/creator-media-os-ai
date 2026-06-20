import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { readFile } from "@/lib/storage"

export async function GET(_req, { params }) {
  const session = await getSession()
  if (!session) return new Response("Unauthorized", { status: 401 })
  const { id } = await params

  const asset = await prisma.mediaAsset.findFirst({
    where: { id, workspaceId: session.workspaceId },
  })
  if (!asset?.storageKey) return new Response("Not found", { status: 404 })

  try {
    const buffer = await readFile(asset.storageKey)
    return new Response(buffer, {
      headers: {
        "Content-Type": asset.mimeType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch {
    return new Response("File missing", { status: 404 })
  }
}
