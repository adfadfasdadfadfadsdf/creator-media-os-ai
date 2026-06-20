import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export const COOKIE_NAME = "nexus_session"

export async function createToken(user, workspaceId = null) {
  return new SignJWT({ email: user.email, name: user.name, workspaceId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
}
