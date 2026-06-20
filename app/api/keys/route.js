import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { encrypt, decrypt, maskKey } from "@/lib/crypto"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const rows = await prisma.apiKey.findMany({
    where: { workspaceId: session.workspaceId },
    orderBy: { createdAt: "desc" },
  })
  const keys = rows.map((r) => ({
    id: r.id,
    provider: r.provider,
    isActive: r.isActive,
    masked: maskKey(decrypt(r.encryptedKey) || ""),
    createdAt: r.createdAt,
  }))
  return NextResponse.json({ keys })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  try {
    const { provider = "openrouter", key } = await request.json()
    if (!key || key.length < 12) {
      return NextResponse.json({ message: "Enter a valid API key." }, { status: 400 })
    }

    // Validate OpenRouter keys by hitting the auth endpoint
    if (provider === "openrouter") {
      const check = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { Authorization: `Bearer ${key}` },
      })
      if (!check.ok) {
        return NextResponse.json({ message: "This OpenRouter key is invalid." }, { status: 400 })
      }
    }

    // Deactivate previous keys for the same provider, then store the new one
    await prisma.apiKey.updateMany({
      where: { workspaceId: session.workspaceId, provider },
      data: { isActive: false },
    })
    const created = await prisma.apiKey.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        provider,
        encryptedKey: encrypt(key),
        isActive: true,
      },
    })

    return NextResponse.json({
      key: { id: created.id, provider, isActive: true, masked: maskKey(key), createdAt: created.createdAt },
    }, { status: 201 })
  } catch (e) {
    console.error("Add key error:", e)
    return NextResponse.json({ message: "Could not save the key." }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 })

  await prisma.apiKey.deleteMany({ where: { id, workspaceId: session.workspaceId } })
  return NextResponse.json({ ok: true })
}
