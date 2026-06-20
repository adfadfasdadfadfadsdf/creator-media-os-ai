import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { chat } from "@/lib/openrouter"

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const { topic } = await request.json()
    if (!topic || !topic.trim()) {
      return NextResponse.json({ message: "Provide a topic." }, { status: 400 })
    }

    const messages = [
      { role: "system", content: "You write punchy, scroll-stopping on-screen captions for vertical shorts. Reply with ONLY the caption text — max 6 words, uppercase, no quotes, no emojis." },
      { role: "user", content: `Topic: ${topic}\nWrite one viral caption.` },
    ]

    const { text } = await chat(messages, {
      workspaceId: session.workspaceId,
      userId: session.userId,
      action: "ai.caption",
      temperature: 0.9,
      maxTokens: 30,
    })

    const caption = text.trim().replace(/^["']|["']$/g, "").split("\n")[0].slice(0, 60)
    return NextResponse.json({ caption })
  } catch (e) {
    console.error("AI caption error:", e)
    return NextResponse.json({ message: "Could not generate caption." }, { status: 500 })
  }
}
