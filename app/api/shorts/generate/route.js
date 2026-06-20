import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { renderVerticalShort } from "@/lib/ffmpeg"

export const maxDuration = 300 // allow long render

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  let job
  try {
    const { mediaAssetId, start, end, title, caption, logoAssetId, projectId } = await request.json()

    const source = await prisma.mediaAsset.findFirst({
      where: { id: mediaAssetId, workspaceId: session.workspaceId, type: "VIDEO" },
    })
    if (!source?.storageKey) {
      return NextResponse.json({ message: "Pick an uploaded video to convert." }, { status: 400 })
    }

    // Optional logo/watermark (an uploaded image asset)
    let logoKey
    if (logoAssetId) {
      const logo = await prisma.mediaAsset.findFirst({
        where: { id: logoAssetId, workspaceId: session.workspaceId, type: "IMAGE" },
      })
      if (logo?.storageKey) logoKey = logo.storageKey
    }

    // Track the render job
    job = await prisma.renderJob.create({
      data: {
        workspaceId: session.workspaceId,
        projectId: projectId || null,
        jobType: "SHORT_RENDER",
        status: "PROCESSING",
        inputJson: { mediaAssetId, start, end },
      },
    })

    // Run FFmpeg
    const { outputKey, sizeBytes } = await renderVerticalShort({
      sourceKey: source.storageKey,
      start: start != null ? Number(start) : undefined,
      end: end != null ? Number(end) : undefined,
      caption: caption || undefined,
      logoKey,
    })

    // Save output as a media asset
    const asset = await prisma.mediaAsset.create({
      data: {
        workspaceId: session.workspaceId,
        projectId: projectId || null,
        uploadedBy: session.userId,
        type: "SHORT",
        fileName: (title || source.fileName.replace(/\.[^.]+$/, "")) + "-short.mp4",
        storageKey: outputKey,
        mimeType: "video/mp4",
        size: BigInt(sizeBytes),
        width: 1080,
        height: 1920,
        status: "READY",
      },
    })

    const short = await prisma.short.create({
      data: {
        workspaceId: session.workspaceId,
        projectId: projectId || null,
        sourceAssetId: source.id,
        title: title || source.fileName,
        outputUrl: `/api/media/file/${asset.id}`,
        aspectRatio: "9:16",
        status: "READY",
        renderJobId: job.id,
        duration: end != null && start != null ? Number(end) - Number(start) : null,
      },
    })

    await prisma.renderJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", outputJson: { shortId: short.id, assetId: asset.id } },
    })

    return NextResponse.json({
      short: {
        id: short.id,
        title: short.title,
        outputUrl: short.outputUrl,
        aspectRatio: short.aspectRatio,
        status: short.status,
        createdAt: short.createdAt,
      },
    }, { status: 201 })
  } catch (e) {
    console.error("Short render error:", e)
    if (job) {
      await prisma.renderJob.update({ where: { id: job.id }, data: { status: "FAILED", errorMessage: String(e.message).slice(0, 300) } }).catch(() => {})
    }
    return NextResponse.json({ message: "Render failed. Try a shorter clip or different video." }, { status: 500 })
  }
}
