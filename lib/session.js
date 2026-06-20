import { cookies } from "next/headers"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"
import { ensureWorkspace } from "@/lib/workspace"

/**
 * Returns the current session { userId, workspaceId, name, email } from the
 * auth cookie, or null if not authenticated. Backfills workspaceId for older
 * tokens issued before the workspace upgrade.
 */
export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const p = await verifyToken(token)
    let workspaceId = p.workspaceId
    if (!workspaceId) {
      workspaceId = await ensureWorkspace({ id: p.sub, name: p.name })
    }
    return { userId: p.sub, workspaceId, name: p.name, email: p.email }
  } catch {
    return null
  }
}
