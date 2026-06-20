"use client"

import { useEffect, useState } from "react"
import {
  Images,
  Clapperboard,
  Youtube,
  Clock,
  Sparkles,
  HardDrive,
  Upload,
  Link2,
  TrendingUp,
  Wand2,
  Mic,
  Play,
  FolderKanban,
  FileText,
  Activity,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkline, AreaChart } from "@/components/ui/charts"

/* ------------------------------- static meta ------------------------------ */

const quickActions = [
  { label: "Upload Video", sub: "Upload & Analyze", icon: Upload, grad: "from-violet-500 to-purple-600", href: "/media" },
  { label: "Analyze URL", sub: "YouTube URL", icon: Link2, grad: "from-rose-500 to-red-600", href: "/youtube" },
  { label: "Find Trends", sub: "AI-Powered", icon: TrendingUp, grad: "from-emerald-500 to-teal-600", href: "/analytics" },
  { label: "Generate Short", sub: "AI Shorts", icon: Wand2, grad: "from-fuchsia-500 to-pink-600", href: "/shorts/editor" },
  { label: "Create Voiceover", sub: "AI Voice", icon: Mic, grad: "from-blue-500 to-indigo-600", href: "/ai-voice" },
]

const statMeta = [
  { key: "mediaAssets", label: "Total Media Assets", icon: Images, color: "#8b5cf6", spark: [20, 30, 25, 40, 35, 50, 45, 60, 55, 70] },
  { key: "generatedShorts", label: "Generated Shorts", icon: Clapperboard, color: "#ec4899", spark: [30, 35, 28, 40, 38, 52, 48, 58, 50, 64] },
  { key: "publishedVideos", label: "Published Videos", icon: Youtube, color: "#ef4444", spark: [40, 38, 42, 35, 45, 40, 48, 44, 52, 50] },
  { key: "pendingJobs", label: "Pending Jobs", icon: Clock, color: "#f59e0b", spark: [30, 45, 40, 55, 48, 60, 50, 42, 38, 34] },
  { key: "aiTokens", label: "AI Tokens Used", icon: Sparkles, color: "#3b82f6", spark: [20, 28, 24, 36, 32, 44, 40, 56, 52, 68] },
  { key: "storageUsed", label: "Storage Used", icon: HardDrive, color: "#10b981", spark: [25, 30, 35, 32, 42, 45, 50, 55, 60, 66] },
]

const actionMeta = {
  "youtube.analyze-url": { text: "Analyzed a YouTube video", icon: Youtube, color: "bg-red-500/15 text-red-500" },
  "ai.summarize": { text: "Summarized a video", icon: Sparkles, color: "bg-violet-500/15 text-violet-500" },
  "ai.generate-script": { text: "Generated a script", icon: FileText, color: "bg-blue-500/15 text-blue-500" },
}

const chartData = [
  { label: "Mon", value: 760 }, { label: "Tue", value: 900 }, { label: "Wed", value: 1180 },
  { label: "Thu", value: 1020 }, { label: "Fri", value: 1678 }, { label: "Sat", value: 1320 }, { label: "Sun", value: 1420 },
]

const overviewStats = [
  { label: "Views", value: "10.4K", delta: "12.5%" },
  { label: "Watch Time", value: "3.2K hrs", delta: "8.1%" },
  { label: "Engagement", value: "8.6%", delta: "15.3%" },
]

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
  return new Date(d).toLocaleDateString()
}

/* ----------------------------- skeletons ---------------------------- */

function StatSkeleton() {
  return (
    <Card><CardContent className="p-5">
      <div className="flex justify-between"><Skeleton className="h-10 w-10 rounded-lg" /><Skeleton className="h-4 w-10" /></div>
      <Skeleton className="mt-4 h-3.5 w-24" /><Skeleton className="mt-2 h-7 w-16" /><Skeleton className="mt-4 h-9 w-full" />
    </CardContent></Card>
  )
}

/* ------------------------------ component --------------------------- */

export function DashboardContent({ name = "Creator" }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ stats: {}, projects: [], activity: [] }))
  }, [])

  const loading = !data

  return (
    <>
      <PageHeader
        title={`Welcome back, ${name}! 👋`}
        description="Here's everything happening across your content engine."
      />

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {quickActions.map(({ label, sub, icon: Icon, grad, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft-lg"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-foreground">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{sub}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Top Stats (real) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
          : statMeta.map(({ key, label, icon: Icon, color, spark }) => (
              <Card key={key} className="group">
                <CardContent className="p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}1f`, color }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold tracking-[-.03em] text-foreground">
                    {data.stats?.[key] ?? 0}
                  </p>
                  <div className="mt-3"><Sparkline data={spark} color={color} /></div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Projects · Analytics · Activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Recent Projects (real) */}
        <div className="xl:col-span-4">
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold tracking-[-.02em] text-foreground">Recent Projects</h2>
                <Link href="/projects" className="text-sm font-semibold text-primary hover:underline">View all</Link>
              </div>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
              ) : data.projects.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No projects yet.</p>
              ) : (
                <div className="space-y-1">
                  {data.projects.map((p) => (
                    <Link key={p.id} href="/projects" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                        <FolderKanban className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</p>
                      </div>
                      {p.platform && <Badge variant="secondary">{p.platform}</Badge>}
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/projects" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10">
                + New Project
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Overview (demo) */}
        <div className="xl:col-span-5">
          <Card className="h-full">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold tracking-[-.02em] text-foreground">Analytics Overview</h2>
                <span className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  This Week <ChevronDown className="h-3.5 w-3.5" />
                </span>
              </div>
              <AreaChart data={chartData} color="#8b5cf6" />
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
                {overviewStats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 font-display text-lg font-extrabold text-foreground">{s.value}</p>
                    <p className="mt-0.5 text-xs font-semibold text-emerald-500">↑ {s.delta}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">Connect a YouTube channel for live analytics.</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed (real) */}
        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardContent className="p-5">
              <h2 className="mb-4 font-display text-lg font-bold tracking-[-.02em] text-foreground">Activity Feed</h2>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
              ) : data.activity.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No activity yet. Try the YouTube Analyzer!</p>
              ) : (
                <div className="space-y-1">
                  {data.activity.map((a, i) => {
                    const meta = actionMeta[a.action] || { text: a.action, icon: Activity, color: "bg-muted text-muted-foreground" }
                    const Icon = meta.icon
                    return (
                      <div key={i} className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug text-foreground">{meta.text}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(a.createdAt)} · {a.tokens} tok</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
