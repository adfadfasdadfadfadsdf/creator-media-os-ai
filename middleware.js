import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const protectedRoutes = ["/dashboard"]
const authRoutes = ["/login", "/register"]
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("nexus_session")?.value
  let authenticated = false

  if (token) {
    try {
      await jwtVerify(token, secret)
      authenticated = true
    } catch {
      authenticated = false
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (authRoutes.includes(pathname) && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
