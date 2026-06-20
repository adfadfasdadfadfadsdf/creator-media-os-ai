import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
  return String(n)
}

function fmtBytes(b) {
  const n = Number(b || 0)
  if (n >= 1e9) return (n / 1e9).toFixed(1) + " GB"
  if (n >= 1e6) return (n / 1e6).toFixed(1) + " MB"
  if (n >= 1e3) return (n / 1e3).toFixed(1) + " KB"
  return n + " B"
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  const ws = session.workspaceId
  const where = { workspaceId: ws }

  const [
    mediaCount,
    shortsCount,
    publishedCount,
    pendingRender,
    pendingPublish,
    tokensAgg,
    storageAgg,
    projects,
    activityLogs,
  ] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.short.count({ where }),
    prisma.publishJob.count({ where: { ...where, status: "PUBLISHED" } }),
    prisma.renderJob.count({ where: { ...where, status: { in: ["PENDING", "PROCESSING"] } } }),
    prisma.publishJob.count({ where: { ...where, status: { in: ["DRAFT", "SCHEDULED", "PUBLISHING"] } } }),
    prisma.usageLog.aggregate({ where, _sum: { inputTokens: true, outputTokens: true } }),
    prisma.mediaAsset.aggregate({ where, _sum: { size: true } }),
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { shorts: true, scripts: true } } },
    }),
    prisma.usageLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 6 }),
  ])

  const totalTokens = (tokensAgg._sum.inputTokens || 0) + (tokensAgg._sum.outputTokens || 0)

  return NextResponse.json({
    stats: {
      mediaAssets: fmt(mediaCount),
      generatedShorts: fmt(shortsCount),
      publishedVideos: fmt(publishedCount),
      pendingJobs: pendingRender + pendingPublish,
      aiTokens: fmt(totalTokens),
      storageUsed: fmtBytes(storageAgg._sum.size),
    },
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      niche: p.niche,
      platform: p.platform,
      status: p.status,
      createdAt: p.createdAt,
    })),
    activity: activityLogs.map((a) => ({
      action: a.action,
      model: a.model,
      tokens: (a.inputTokens || 0) + (a.outputTokens || 0),
      createdAt: a.createdAt,
    })),
  })
}
