"use client"

import { useEffect, useState } from "react"
import { Eye, ThumbsUp, Play, Sparkles, KeyRound, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ActionButton } from "@/components/ui/action-button"

const countries = [
  { code: "IN", name: "India" }, { code: "US", name: "USA" }, { code: "GB", name: "UK" },
  { code: "CA", name: "Canada" }, { code: "AU", name: "Australia" }, { code: "DE", name: "Germany" },
  { code: "BR", name: "Brazil" }, { code: "JP", name: "Japan" },
]
const categories = ["All", "Tech", "Gaming", "Education", "Entertainment", "News", "Comedy", "Music", "Sports", "Travel", "Movies", "Howto"]

export function TrendsPanel({ onAnalyze }) {
  const [country, setCountry] = useState("IN")
  const [category, setCategory] = useState("All")
  const [loading, setLoading] = useState(false)
  const [needsKey, setNeedsKey] = useState(false)
  const [videos, setVideos] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/youtube/trending?country=${country}&category=${category}`)
      const json = await res.json()
      if (json.needsKey) { setNeedsKey(true); setVideos([]); return }
      if (!res.ok) throw new Error(json.message || "Failed")
      setNeedsKey(false)
      setVideos(json.videos || [])
    } catch (e) {
      toast.error(e.message)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, []) // eslint-disable-line

  const selectCls = "h-10 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls}>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <ActionButton onClick={load} loading={loading}>
          {!loading && <RefreshCw className="h-4 w-4" />} Find Trends
        </ActionButton>
      </div>

      {needsKey ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <KeyRound className="h-7 w-7" />
            </span>
            <p className="font-bold text-foreground">YouTube Data API key required</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Trend Finder fetches real trending videos via the official YouTube Data API. Add a free API key to enable it.
            </p>
            <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noreferrer">
              <ActionButton variant="secondary"><ExternalLink className="h-4 w-4" /> Get a free key</ActionButton>
            </a>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : videos?.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No trending videos found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos?.map((v, i) => (
            <Card key={v.videoId} className="group overflow-hidden">
              <div className="relative aspect-video overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.thumbnailUrl} alt={v.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white">#{i + 1}</span>
                {v.duration && <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">{v.duration}</span>}
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-foreground">{v.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{v.channelName}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{v.views}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{v.likes}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onAnalyze?.(v.url)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Analyze
                  </button>
                  <Link href={v.url} target="_blank" className="flex items-center justify-center rounded-lg border border-border px-2.5 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
