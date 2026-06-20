import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { chatJSON } from "@/lib/openrouter"
import { scriptPrompt } from "@/lib/prompts"

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const input = await request.json()
    if (!input?.topic) {
      return NextResponse.json({ message: "Provide a topic." }, { status: 400 })
    }

    const { data, model } = await chatJSON(scriptPrompt(input), {
      workspaceId: session.workspaceId,
      userId: session.userId,
      action: "ai.generate-script",
      temperature: 0.8,
      maxTokens: 2800,
    })

    const saved = await prisma.shortScript.create({
      data: {
        workspaceId: session.workspaceId,
        projectId: input.projectId || null,
        title: str(data.title),
        hook: str(data.hook),
        script: str(data.script),
        voiceoverText: str(data.voiceover_text),
        captionsJson: data.caption_lines || [],
        onScreenText: arr(data.on_screen_text),
        hashtags: arr(data.hashtags),
        language: input.language || "en",
        tone: input.tone || "energetic",
        duration: Number(input.duration) || 30,
        musicMood: str(data.music_mood),
        effects: arr(data.effects),
        cta: str(data.cta),
      },
    })

    return NextResponse.json({ script: { ...saved, visualSuggestions: arr(data.visual_suggestions) }, model })
  } catch (e) {
    console.error("AI script error:", e)
    return NextResponse.json({ message: e.message || "AI request failed" }, { status: 500 })
  }
}

const str = (v) => (typeof v === "string" ? v : v == null ? "" : String(v))
const arr = (v) => (Array.isArray(v) ? v.map(String) : [])
