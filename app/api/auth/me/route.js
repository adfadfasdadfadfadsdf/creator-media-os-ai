import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"

export async function GET() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!token) throw new Error("Missing session")
    const user = await verifyToken(token)
    return NextResponse.json({
      user: { id: user.sub, name: user.name, email: user.email },
    })
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
