import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createToken, sessionCookie } from "@/lib/auth"
import { ensureWorkspace } from "@/lib/workspace"
import { loginSchema } from "@/lib/validations"

export async function POST(request) {
  try {
    const parsed = loginSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid details" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    })
    const passwordMatches = user
      ? await bcrypt.compare(parsed.data.password, user.password)
      : false

    if (!user || !passwordMatches) {
      return NextResponse.json({ message: "Email or password is incorrect." }, { status: 401 })
    }

    const workspaceId = await ensureWorkspace(user)
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      workspaceId,
    })
    response.cookies.set(sessionCookie.name, await createToken(user, workspaceId), sessionCookie.options)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Unable to sign you in right now." }, { status: 500 })
  }
}
