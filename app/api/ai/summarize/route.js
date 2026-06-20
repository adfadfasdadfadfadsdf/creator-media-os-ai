import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { chatJSON, promptHash } from "@/lib/openrouter"
import { summaryPrompt } from "@/lib/prompts"

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const input = await request.json()
    if (!input?.title && !input?.transcript && !input?.description) {
      return NextResponse.json({ message: "Provide at least a title, description or transcript." }, { status: 400 })
    }

    const messages = summaryPrompt(input)
    const hash = promptHash({ ws: session.workspaceId, content: messages[1].content })

    // Prompt cache: return saved analysis if the same input was processed before
    const cached = await prisma.videoSummary.findFirst({
      where: { workspaceId: session.workspaceId, promptHash: hash },
    })
    if (cached) {
      return NextResponse.json({ cached: true, summary: shape(cached) })
    }

    const { data, model } = await chatJSON(messages, {
      workspaceId: session.workspaceId,
      userId: session.userId,
      action: "ai.summarize",
      temperature: 0.6,
      maxTokens: 1500,
    })

    const saved = await prisma.videoSummary.create({
      data: {
        workspaceId: session.workspaceId,
        sourceType: input.sourceType || "YOUTUBE_URL",
        sourceId: input.sourceId || input.url || input.title || "manual",
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

    return NextResponse.json({ cached: false, summary: shape(saved) })
  } catch (e) {
    console.error("AI summarize error:", e)
    return NextResponse.json({ message: e.message || "AI request failed" }, { status: 500 })
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
    shortsIdeas: s.shortsIdeas,
    titleSuggestions: s.titleSuggestions,
    hashtags: s.hashtags,
    model: s.aiModel,
  }
}
