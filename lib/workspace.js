import { prisma } from "@/lib/prisma"

/**
 * Returns the user's active workspace id, creating a default one
 * (with OWNER membership + FREE billing plan) if none exists yet.
 */
export async function ensureWorkspace(user) {
  const existing = await prisma.workspace.findFirst({
    where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  })
  if (existing) return existing.id

  const workspace = await prisma.workspace.create({
    data: {
      name: `${user.name.split(" ")[0]}'s Workspace`,
      ownerId: user.id,
      plan: "FREE",
      members: { create: { userId: user.id, role: "OWNER" } },
      billingPlans: { create: { planName: "FREE" } },
    },
    select: { id: true },
  })
  return workspace.id
}
