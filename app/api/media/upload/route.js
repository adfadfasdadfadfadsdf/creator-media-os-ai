import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { saveFile, assetTypeFromMime } from "@/lib/storage"

const MAX_BYTES = 100 * 1024 * 1024 // 100 MB (demo limit)

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const form = await request.formData()
    const file = form.get("file")
    const projectId = form.get("projectId") || null
    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "No file provided." }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: "File too large (max 100 MB)." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = await saveFile(session.workspaceId, file.name, buffer)
    const type = assetTypeFromMime(file.type)

    const asset = await prisma.mediaAsset.create({
      data: {
        workspaceId: session.workspaceId,
        projectId: projectId || null,
        uploadedBy: session.userId,
        type,
        fileName: file.name,
        storageKey: key,
        mimeType: file.type || null,
        size: BigInt(file.size),
        status: "READY",
      },
    })

    return NextResponse.json({ asset: shape(asset) }, { status: 201 })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ message: "Upload failed." }, { status: 500 })
  }
}

function shape(a) {
  return {
    id: a.id,
    type: a.type,
    fileName: a.fileName,
    mimeType: a.mimeType,
    size: a.size ? Number(a.size) : 0,
    fileUrl: `/api/media/file/${a.id}`,
    createdAt: a.createdAt,
  }
}
