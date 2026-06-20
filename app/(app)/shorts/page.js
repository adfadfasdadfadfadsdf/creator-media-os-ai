"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Play, Plus, Wand2, Clapperboard, Video, Scissors, Sparkles, Download, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Modal } from "@/components/ui/modal"

const inputCls =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

const statusVariant = { READY: "success", PROCESSING: "warning", FAILED: "danger" }

export default function ShortsPage() {
  const [shorts, setShorts] = useState(null)
  const [open, setOpen] = useState(false)
  const [videos, setVideos] = useState([])
  const [images, setImages] = useState([])
  const [form, setForm] = useState({ mediaAssetId: "", start: "", end: "", title: "", caption: "", logoAssetId: "" })
  const [rendering, setRendering] = useState(false)
  const [aiCaption, setAiCaption] = useState(false)

  async function load() {
    try {
      const res = await fetch("/api/shorts")
      setShorts((await res.json()).shorts || [])
    } catch { setShorts([]) }
  }
  useEffect(() => { load() }, [])

  async function openModal() {
    setOpen(true)
    try {
      const [vr, ir] = await Promise.all([
        fetch("/api/media?type=video").then((r) => r.json()),
        fetch("/api/media?type=image").then((r) => r.json()),
      ])
      const v = vr.assets || []
      setVideos(v)
      setImages(ir.assets || [])
      if (v[0]) setForm((f) => ({ ...f, mediaAssetId: v[0].id }))
    } catch { setVideos([]) }
  }

  async function genCaption() {
    const topic = form.title || form.caption || "this video"
    setAiCaption(true)
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed")
      setForm((f) => ({ ...f, caption: json.caption }))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAiCaption(false)
    }
  }

  async function generate() {
    if (!form.mediaAssetId) return toast.error("Pick a video first")
    setRendering(true)
    try {
      const res = await fetch("/api/shorts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAssetId: form.mediaAssetId,
          start: form.start === "" ? undefined : Number(form.start),
          end: form.end === "" ? undefined : Number(form.end),
          title: form.title || undefined,
          caption: form.caption || undefined,
          logoAssetId: form.logoAssetId || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Render failed")
      toast.success("Short rendered!")
      setShorts((prev) => [json.short, ...(prev || [])])
      setOpen(false)
      setForm({ mediaAssetId: "", start: "", end: "", title: "", caption: "", logoAssetId: "" })
    } catch (e) {
      toast.error(e.message)
    } finally {
      setRendering(false)
    }
  }

  return (
    <>
      <PageHeader title="Shorts" description="Turn any uploaded video into a 9:16 vertical short with one click.">
        <Link href="/shorts/editor">
          <ActionButton variant="secondary"><Wand2 className="h-4 w-4" /> Open Editor</ActionButton>
        </Link>
        <ActionButton onClick={openModal}><Plus className="h-4 w-4" /> New Short</ActionButton>
      </PageHeader>

      {shorts === null ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="aspect-[9/16] w-full rounded-xl" />)}
        </div>
      ) : shorts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Clapperboard className="h-7 w-7" /></span>
            <p className="font-bold text-foreground">No shorts yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">Upload a video in Media, then generate a vertical short from it.</p>
            <ActionButton onClick={openModal}><Plus className="h-4 w-4" /> New Short</ActionButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shorts.map((s) => (
            <Card key={s.id} className="group overflow-hidden">
              <div className="relative aspect-[9/16] bg-slate-950">
                {s.outputUrl ? (
                  <video src={s.outputUrl} className="h-full w-full object-cover" controls preload="metadata" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Play className="h-10 w-10 text-white/60" /></div>
                )}
                <Badge variant={statusVariant[s.status] || "secondary"} className="absolute left-2 top-2 backdrop-blur">{s.status}</Badge>
              </div>
              <div className="flex items-center gap-2 p-3">
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{s.title}</p>
                <a href={s.outputUrl} download className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><Download className="h-4 w-4" /></a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generate modal */}
      <Modal
        open={open}
        onClose={() => !rendering && setOpen(false)}
        title="Generate a Short"
        description="Convert an uploaded video into a 9:16 vertical short."
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => setOpen(false)} disabled={rendering}>Cancel</ActionButton>
            <ActionButton onClick={generate} loading={rendering}>
              {!rendering && <Sparkles className="h-4 w-4" />}{rendering ? "Rendering..." : "Generate"}
            </ActionButton>
          </>
        }
      >
        {videos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Video className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold text-foreground">No videos uploaded</p>
            <p className="text-xs text-muted-foreground">Upload a video first to create a short.</p>
            <Link href="/media"><ActionButton variant="secondary" className="mt-3">Go to Media</ActionButton></Link>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Source video</span>
              <select value={form.mediaAssetId} onChange={(e) => setForm({ ...form, mediaAssetId: e.target.value })} className={inputCls}>
                {videos.map((v) => <option key={v.id} value={v.id}>{v.fileName}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Title (optional)</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My viral short" className={inputCls} />
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-sm font-semibold text-foreground">
                Caption on video (optional)
                <button
                  type="button"
                  onClick={genCaption}
                  disabled={aiCaption}
                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary transition hover:bg-primary/20 disabled:opacity-50"
                >
                  <Sparkles className={"h-3 w-3 " + (aiCaption ? "animate-pulse" : "")} /> {aiCaption ? "Writing..." : "AI caption"}
                </button>
              </span>
              <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="e.g. WAIT FOR IT" maxLength={60} className={inputCls} />
              <span className="mt-1 block text-xs text-muted-foreground">Burned onto the short, centered near the bottom.</span>
            </label>

            {images.length > 0 && (
              <label className="block">
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground"><ImageIcon className="h-3.5 w-3.5" /> Logo / watermark (optional)</span>
                <select value={form.logoAssetId} onChange={(e) => setForm({ ...form, logoAssetId: e.target.value })} className={inputCls}>
                  <option value="">None</option>
                  {images.map((img) => <option key={img.id} value={img.id}>{img.fileName}</option>)}
                </select>
                <span className="mt-1 block text-xs text-muted-foreground">Overlaid top-right of the short.</span>
              </label>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground"><Scissors className="h-3.5 w-3.5" /> Start (sec)</span>
                <input type="number" min="0" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} placeholder="0" className={inputCls} />
              </label>
              <label className="block">
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground"><Scissors className="h-3.5 w-3.5" /> End (sec)</span>
                <input type="number" min="0" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} placeholder="e.g. 30" className={inputCls} />
              </label>
            </div>
            {rendering && (
              <p className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" /> FFmpeg is rendering your vertical short — this can take a moment.
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
