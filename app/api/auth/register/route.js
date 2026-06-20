import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createToken, sessionCookie } from "@/lib/auth"
import { ensureWorkspace } from "@/lib/workspace"
import { registerSchema } from "@/lib/validations"

export async function POST(request) {
  try {
    const parsed = registerSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid details" },
        { status: 400 }
      )
    }

    const { name, password } = parsed.data
    const email = parsed.data.email.toLowerCase()
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      )
    }

    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12) },
    })
    const workspaceId = await ensureWorkspace(user)
    const token = await createToken(user, workspaceId)
    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email }, workspaceId },
      { status: 201 }
    )
    response.cookies.set(sessionCookie.name, token, sessionCookie.options)
    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { message: "Unable to create your account right now.", debug: String(error?.message || error).slice(0, 400) },
      { status: 500 }
    )
  }
}
