"use client"

import { useState } from "react"
import {
  Youtube,
  Search,
  Eye,
  ThumbsUp,
  MessageSquare,
  Play,
  Sparkles,
  FileText,
  ListChecks,
  Flame,
  Wand2,
  Hash,
  Copy,
  Check,
  Plus,
  Users,
  Clock,
  Link2,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendsPanel } from "@/components/youtube/trends-panel"

function SectionTitle({ icon: Icon, color, children }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1f`, color }}>
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="font-display text-lg font-bold tracking-[-.02em] text-foreground">{children}</h2>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text)
        setCopied(true)
        toast.success("Copied")
        setTimeout(() => setCopied(false), 1500)
      }}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

function ResultSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row">
          <Skeleton className="aspect-video w-full rounded-xl sm:w-72" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-3">
              <Skeleton className="h-14 w-24 rounded-xl" />
              <Skeleton className="h-14 w-24 rounded-xl" />
              <Skeleton className="h-14 w-24 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card><CardContent className="space-y-3 p-5"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></CardContent></Card>
    </div>
  )
}

export default function YouTubePage() {
  const [tab, setTab] = useState("analyzer")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [data, setData] = useState(null)

  async function analyze(targetUrl) {
    const u = typeof targetUrl === "string" ? targetUrl : url
    if (!u.trim()) return toast.error("Paste a YouTube URL first")
    setLoading(true)
    setData(null)
    setPreview(null)
    try {
      const res = await fetch("/api/youtube/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Analysis failed")
      setPreview(json.preview)
      setData(json.summary)
      toast.success(json.cached ? "Loaded from cache" : "Analysis complete")
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const stats = preview
    ? [
        { label: "Views", value: preview.views || "—", icon: Eye },
        { label: "Likes", value: preview.likes || "—", icon: ThumbsUp },
        { label: "Comments", value: preview.comments || "—", icon: MessageSquare },
      ]
    : []

  function analyzeFromTrends(targetUrl) {
    setTab("analyzer")
    setUrl(targetUrl)
    analyze(targetUrl)
  }

  return (
    <>
      <PageHeader title="YouTube" description="Discover trends and analyze any video with AI — summary, viral factors, shorts & titles." />

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1">
        {[
          { id: "analyzer", label: "URL Analyzer", icon: Link2 },
          { id: "trends", label: "Trend Finder", icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
              (tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "trends" && <TrendsPanel onAnalyze={analyzeFromTrends} />}

      {tab === "analyzer" && (
      <>
      {/* Input */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Youtube className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="https://youtube.com/watch?v=..."
                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <ActionButton size="lg" loading={loading} onClick={analyze} className="sm:w-auto">
              {!loading && <Search className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze"}
            </ActionButton>
          </div>
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span className="animate-pulse">Fetching video & running AI analysis...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && <ResultSkeleton />}

      {data && preview && (
        <div className="mt-6 animate-fade-in space-y-8">
          {/* 1. Video Preview */}
          <Card>
            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row">
              <div className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-72">
                {preview.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview.thumbnailUrl} alt={preview.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-600 to-pink-600">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                )}
                <Badge variant="danger" className="absolute left-2 top-2 backdrop-blur">
                  <Youtube className="h-3 w-3" /> YouTube
                </Badge>
                {preview.duration && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {preview.duration}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-extrabold leading-tight tracking-[-.02em] text-foreground">
                  {preview.title}
                </h2>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {preview.channelName}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {stats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-border bg-muted/40 p-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="mt-1.5 font-display text-lg font-extrabold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                {preview.source === "oembed" && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> Add a YouTube API key for views, likes & comments.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. AI Analysis */}
          <section>
            <SectionTitle icon={Sparkles} color="#8b5cf6">AI Analysis <span className="ml-1 text-xs font-normal text-muted-foreground">· {data.model}</span></SectionTitle>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">One-line summary</p>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{data.oneLine}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-foreground">
                    <FileText className="h-4 w-4 text-muted-foreground" /> Detailed summary
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.detailed}</p>
                  {data.targetAudience && (
                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Target audience</p>
                        <p className="mt-0.5 text-foreground">{data.targetAudience}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Content angle</p>
                        <p className="mt-0.5 text-foreground">{data.contentAngle}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <ListChecks className="h-4 w-4 text-blue-500" /> Key points
                    </div>
                    <ul className="mt-3 space-y-2.5">
                      {data.keyPoints.map((k, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[11px] font-bold text-blue-500">{i + 1}</span>
                          {k}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Flame className="h-4 w-4 text-amber-500" /> Why it works
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.viralReason}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* 3. Shorts Ideas */}
          {data.shortsIdeas?.length > 0 && (
            <section>
              <SectionTitle icon={Wand2} color="#ec4899">Shorts Ideas</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data.shortsIdeas.map((s, i) => (
                  <Card key={i} className="group">
                    <CardContent className="flex h-full flex-col p-5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/15 text-sm font-bold text-pink-500">{i + 1}</span>
                      <h3 className="mt-4 font-display text-base font-bold text-foreground">{s.title}</h3>
                      <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.desc}</p>
                      <button
                        onClick={() => toast.success(`Generating: ${s.title}`)}
                        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-xs font-bold text-accent-foreground opacity-0 transition group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" /> Generate Short
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* 4. Titles + Hashtags */}
          <section>
            <SectionTitle icon={Hash} color="#10b981">Titles &amp; Hashtags</SectionTitle>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm font-bold text-foreground">Generated titles</p>
                  <div className="mt-3 space-y-2">
                    {data.titleSuggestions.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-primary/30">
                        <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{t}</p>
                        <CopyButton text={t} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Hashtags</p>
                    <CopyButton text={data.hashtags.join(" ")} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.hashtags.map((h) => (
                      <button
                        key={h}
                        onClick={() => { navigator.clipboard?.writeText(h); toast.success(`Copied ${h}`) }}
                        className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      )}
      </>
      )}
    </>
  )
}
