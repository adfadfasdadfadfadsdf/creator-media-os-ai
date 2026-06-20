"use client"

import { useEffect, useState } from "react"
import {
  Swords,
  Plus,
  Users,
  Eye,
  Video,
  Trash2,
  TrendingUp,
  Lightbulb,
  Target,
  Type,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Modal } from "@/components/ui/modal"

const insightMeta = [
  { key: "top_patterns", label: "What's working", icon: TrendingUp, color: "#8b5cf6" },
  { key: "best_performing_topics", label: "Best topics", icon: Target, color: "#10b981" },
  { key: "title_patterns", label: "Title patterns", icon: Type, color: "#3b82f6" },
  { key: "content_gaps", label: "Content gaps", icon: Lightbulb, color: "#f59e0b" },
  { key: "shorts_ideas", label: "Shorts ideas", icon: Sparkles, color: "#ec4899" },
  { key: "recommendations", label: "Recommendations", icon: TrendingUp, color: "#06b6d4" },
]

export default function CompetitorsPage() {
  const [list, setList] = useState(null)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [adding, setAdding] = useState(false)
  const [expanded, setExpanded] = useState(null)

  async function load() {
    try {
      const res = await fetch("/api/competitors")
      setList((await res.json()).competitors || [])
    } catch { setList([]) }
  }
  useEffect(() => { load() }, [])

  async function add() {
    if (!input.trim()) return toast.error("Enter a channel URL, @handle or name")
    setAdding(true)
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed")
      toast.success(`${json.competitor.channelName} added`)
      setList((prev) => [json.competitor, ...(prev || [])])
      setExpanded(json.competitor.id)
      setOpen(false)
      setInput("")
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAdding(false)
    }
  }

  async function remove(id, name) {
    setList((prev) => prev.filter((c) => c.id !== id))
    await fetch(`/api/competitors/${id}`, { method: "DELETE" })
    toast.success(`${name} removed`)
  }

  return (
    <>
      <PageHeader title="Competitors" description="Track rival channels — real stats and AI insights on what's working.">
        <ActionButton onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Competitor</ActionButton>
      </PageHeader>

      {list === null ? (
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Swords className="h-7 w-7" /></span>
            <p className="font-bold text-foreground">No competitors tracked</p>
            <p className="max-w-xs text-sm text-muted-foreground">Add a YouTube channel to see its recent videos and AI growth insights.</p>
            <ActionButton onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Competitor</ActionButton>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  {c.info?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.info.thumbnail} alt={c.channelName} className="h-12 w-12 rounded-full" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white"><Swords className="h-5 w-5" /></span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-bold text-foreground">{c.channelName}</p>
                    <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.info?.subscribers || "—"} subs</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{c.info?.totalViews || "—"} views</span>
                      <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" />{c.info?.videoCount || "—"} videos</span>
                    </div>
                  </div>
                  <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                    <ChevronDown className={"h-4 w-4 transition-transform " + (expanded === c.id ? "rotate-180" : "")} />
                  </button>
                  <button onClick={() => remove(c.id, c.channelName)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>

                {expanded === c.id && (
                  <div className="mt-5 animate-fade-in space-y-5">
                    {/* Recent videos */}
                    <div>
                      <p className="mb-2 text-sm font-bold text-foreground">Recent videos</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {c.videos.slice(0, 6).map((v) => (
                          <a key={v.videoId} href={`https://youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-lg border border-border p-2 transition hover:bg-accent/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={v.thumbnail} alt="" className="h-10 w-16 rounded object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-foreground">{v.title}</p>
                              <p className="text-[11px] text-muted-foreground">{v.viewsLabel} views</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* AI insights */}
                    {c.insights ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {insightMeta.map(({ key, label, icon: Icon, color }) =>
                          c.insights[key]?.length ? (
                            <div key={key} className="rounded-xl border border-border bg-muted/30 p-4">
                              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                                <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: `${color}1f`, color }}><Icon className="h-3.5 w-3.5" /></span>
                                {label}
                              </div>
                              <ul className="space-y-1.5">
                                {c.insights[key].map((x, i) => <li key={i} className="text-xs leading-relaxed text-muted-foreground">• {x}</li>)}
                              </ul>
                            </div>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">AI insights unavailable for this channel.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal
        open={open}
        onClose={() => !adding && setOpen(false)}
        title="Add a competitor"
        description="Paste a YouTube channel URL, @handle, or name."
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => setOpen(false)} disabled={adding}>Cancel</ActionButton>
            <ActionButton onClick={add} loading={adding}>{!adding && <Sparkles className="h-4 w-4" />}{adding ? "Analyzing..." : "Add & Analyze"}</ActionButton>
          </>
        }
      >
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="e.g. @MrBeast or youtube.com/@mkbhd"
          className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        {adding && <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="h-4 w-4 animate-pulse text-primary" /> Fetching channel & running AI analysis...</p>}
      </Modal>
    </>
  )
}
