import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { chatJSON, promptHash } from "@/lib/openrouter"
import { summaryPrompt } from "@/lib/prompts"
import { parseVideoId, fetchVideoMeta, formatDuration, compactNumber } from "@/lib/youtube"

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const { url } = await request.json()
    const videoId = parseVideoId(url)
    if (!videoId) return NextResponse.json({ message: "Enter a valid YouTube URL." }, { status: 400 })

    // 1) Fetch public metadata (Data API if key set, else oEmbed)
    let meta
    try {
      meta = await fetchVideoMeta(videoId)
    } catch {
      return NextResponse.json({ message: "Could not fetch this video (private or unavailable)." }, { status: 404 })
    }

    // 2) Persist the video record
    const video = await prisma.youtubeVideo.upsert({
      where: { id: `${session.workspaceId}_${videoId}` },
      create: {
        id: `${session.workspaceId}_${videoId}`,
        workspaceId: session.workspaceId,
        youtubeVideoId: videoId,
        url: `https://youtube.com/watch?v=${videoId}`,
        title: meta.title,
        description: meta.description || null,
        channelName: meta.channelName,
        thumbnailUrl: meta.thumbnailUrl,
        views: meta.views ? BigInt(meta.views) : null,
        likes: meta.likes ? BigInt(meta.likes) : null,
        comments: meta.comments ? BigInt(meta.comments) : null,
        duration: meta.duration || null,
        publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : null,
      },
      update: { title: meta.title, channelName: meta.channelName, thumbnailUrl: meta.thumbnailUrl },
    })

    const preview = {
      videoId,
      title: meta.title,
      channelName: meta.channelName,
      thumbnailUrl: meta.thumbnailUrl,
      views: compactNumber(meta.views),
      likes: compactNumber(meta.likes),
      comments: compactNumber(meta.comments),
      duration: formatDuration(meta.duration),
      source: meta.source, // "data-api" or "oembed"
    }

    // 3) AI analysis (with prompt cache)
    const messages = summaryPrompt({
      title: meta.title,
      description: meta.description,
      channelName: meta.channelName,
      views: meta.views,
      duration: formatDuration(meta.duration),
    })
    const hash = promptHash({ ws: session.workspaceId, content: messages[1].content })

    const cachedRow = await prisma.videoSummary.findFirst({
      where: { workspaceId: session.workspaceId, promptHash: hash },
    })

    let summary, cached = false
    if (cachedRow) {
      summary = shape(cachedRow)
      cached = true
    } else {
      const { data, model } = await chatJSON(messages, {
        workspaceId: session.workspaceId,
        userId: session.userId,
        action: "youtube.analyze-url",
        temperature: 0.6,
        maxTokens: 1600,
      })
      const saved = await prisma.videoSummary.create({
        data: {
          workspaceId: session.workspaceId,
          sourceType: "YOUTUBE_URL",
          sourceId: videoId,
          youtubeVideoId: video.id,
          summaryShort: str(data.one_line_summary),
          summaryDetailed: str(data.detailed_summary),
          keyPoints: arr(data.key_points),
          viralReason: str(data.viral_reason),
          targetAudience: str(data.target_audience),
          contentAngle: str(data.content_angle),
          shortsIdeas: data.shorts_ideas || [],
          titleSuggestions: arr(data.title_suggestions),
          hashtags: arr(data.hashtags),
          aiModel: model,
          promptHash: hash,
        },
      })
      summary = shape(saved)
    }

    return NextResponse.json({ preview, summary, cached })
  } catch (e) {
    console.error("analyze-url error:", e)
    return NextResponse.json({ message: e.message || "Analysis failed" }, { status: 500 })
  }
}

const str = (v) => (typeof v === "string" ? v : v == null ? "" : String(v))
const arr = (v) => (Array.isArray(v) ? v.map(String) : [])

function shape(s) {
  return {
    oneLine: s.summaryShort,
    detailed: s.summaryDetailed,
    keyPoints: s.keyPoints,
    viralReason: s.viralReason,
    targetAudience: s.targetAudience,
    contentAngle: s.contentAngle,
    shortsIdeas: s.shortsIdeas || [],
    titleSuggestions: s.titleSuggestions,
    hashtags: s.hashtags,
    model: s.aiModel,
  }
}
