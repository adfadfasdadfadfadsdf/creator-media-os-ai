import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { chatJSON } from "@/lib/openrouter"
import { competitorPrompt } from "@/lib/prompts"
import { resolveChannelId, getChannelInfo, getChannelRecentVideos, compactNumber } from "@/lib/youtube"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const rows = await prisma.competitor.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ competitors: rows.map(shape) })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const key = process.env.YOUTUBE_API_KEY
  if (!key) return NextResponse.json({ message: "YouTube API key required for competitor tracking." }, { status: 400 })

  try {
    const { input } = await request.json()
    if (!input?.trim()) return NextResponse.json({ message: "Enter a channel URL, @handle or name." }, { status: 400 })

    const channelId = await resolveChannelId(input, key)
    if (!channelId) return NextResponse.json({ message: "Channel not found." }, { status: 404 })

    const info = await getChannelInfo(channelId, key)
    if (!info?.uploads) return NextResponse.json({ message: "Could not read this channel." }, { status: 404 })

    const videos = await getChannelRecentVideos(info.uploads, key, 10)

    // AI insights
    let insights = null
    try {
      const { data } = await chatJSON(competitorPrompt({ channelName: info.name, videos }), {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "competitor.analyze",
        temperature: 0.6,
        maxTokens: 1500,
      })
      insights = data
    } catch (e) {
      console.error("competitor AI failed:", e.message)
    }

    const saved = await prisma.competitor.create({
      data: {
        workspaceId: session.workspaceId,
        channelId,
        channelName: info.name,
        lastSyncAt: new Date(),
        insights: insights || undefined,
        videosJson: { info: { ...info, uploads: undefined }, videos },
      },
    })

    return NextResponse.json({ competitor: shape(saved) }, { status: 201 })
  } catch (e) {
    console.error("competitor add error:", e)
    return NextResponse.json({ message: "Could not add competitor." }, { status: 500 })
  }
}

function shape(c) {
  const v = c.videosJson || {}
  return {
    id: c.id,
    channelId: c.channelId,
    channelName: c.channelName,
    lastSyncAt: c.lastSyncAt,
    info: v.info ? { ...v.info, subscribers: compactNumber(v.info.subscribers), totalViews: compactNumber(v.info.totalViews) } : null,
    videos: (v.videos || []).map((x) => ({ ...x, viewsLabel: compactNumber(x.views) })),
    insights: c.insights || null,
  }
}
