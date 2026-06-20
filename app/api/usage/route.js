import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const where = { workspaceId: session.workspaceId }
  const [count, agg, recent] = await Promise.all([
    prisma.usageLog.count({ where }),
    prisma.usageLog.aggregate({ where, _sum: { inputTokens: true, outputTokens: true, creditsUsed: true } }),
    prisma.usageLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 8 }),
  ])

  return NextResponse.json({
    totalCalls: count,
    inputTokens: agg._sum.inputTokens || 0,
    outputTokens: agg._sum.outputTokens || 0,
    creditsUsed: agg._sum.creditsUsed || 0,
    recent: recent.map((r) => ({
      action: r.action,
      model: r.model,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      createdAt: r.createdAt,
    })),
  })
}
