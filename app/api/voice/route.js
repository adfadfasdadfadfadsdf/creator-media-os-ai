import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const voiceovers = await prisma.voiceover.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json({ voiceovers })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const { text, voice, language, scriptId } = await request.json()
    if (!text || !text.trim()) {
      return NextResponse.json({ message: "Enter some text." }, { status: 400 })
    }
    // Rough duration estimate: ~15 chars/sec of speech
    const duration = Math.max(1, Math.round(text.length / 15))
    const voiceover = await prisma.voiceover.create({
      data: {
        workspaceId: session.workspaceId,
        scriptId: scriptId || null,
        text: text.trim(),
        voice: voice || null,
        language: language || null,
        duration,
      },
    })
    return NextResponse.json({ voiceover }, { status: 201 })
  } catch (e) {
    console.error("Voice save error:", e)
    return NextResponse.json({ message: "Could not save voiceover." }, { status: 500 })
  }
}
