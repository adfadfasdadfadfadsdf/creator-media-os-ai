"use client"

import { useEffect, useRef, useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Plus,
  GripVertical,
  Captions,
  Music2,
  ImageIcon,
  Sparkles,
  Volume2,
  Maximize2,
  Download,
  Undo2,
  Redo2,
  Check,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ActionButton } from "@/components/ui/action-button"
import { Badge } from "@/components/ui/badge"

/* --------------------------------- data --------------------------------- */

const clips = [
  { id: 1, name: "Hook — Intro", dur: "0:04", grad: "from-violet-600 to-fuchsia-600" },
  { id: 2, name: "Main point #1", dur: "0:08", grad: "from-blue-600 to-cyan-600" },
  { id: 3, name: "B-roll cutaway", dur: "0:05", grad: "from-emerald-600 to-teal-600" },
  { id: 4, name: "Main point #2", dur: "0:07", grad: "from-amber-500 to-orange-600" },
  { id: 5, name: "CTA — Outro", dur: "0:03", grad: "from-pink-600 to-rose-600" },
]

const templates = [
  { id: "bold", name: "Bold", grad: "from-violet-600 to-purple-700" },
  { id: "minimal", name: "Minimal", grad: "from-slate-600 to-slate-800" },
  { id: "hype", name: "Hype", grad: "from-pink-600 to-orange-600" },
  { id: "podcast", name: "Podcast", grad: "from-blue-600 to-indigo-700" },
  { id: "vlog", name: "Vlog", grad: "from-emerald-600 to-teal-700" },
  { id: "gaming", name: "Gaming", grad: "from-fuchsia-600 to-rose-700" },
]

const captionStyles = [
  { id: "pop", name: "Pop", className: "font-extrabold text-yellow-300 [text-shadow:0_2px_0_rgba(0,0,0,.6)]" },
  { id: "outline", name: "Outline", className: "font-extrabold text-white [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]" },
  { id: "karaoke", name: "Karaoke", className: "font-extrabold", custom: true },
  { id: "clean", name: "Clean", className: "font-semibold text-white" },
]

/* ------------------------------- component ------------------------------ */

export default function ShortsEditorPage() {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(28) // 0–100 (%)
  const [active, setActive] = useState(1)
  const [trim, setTrim] = useState({ start: 8, end: 92 })
  const [toggles, setToggles] = useState({ captions: true, music: true, logo: false })
  const [template, setTemplate] = useState("bold")
  const [caption, setCaption] = useState("pop")
  const timer = useRef(null)

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setTime((t) => {
          if (t >= trim.end) return trim.start
          return t + 0.6
        })
      }, 60)
    }
    return () => clearInterval(timer.current)
  }, [playing, trim])

  const activeCaption = captionStyles.find((c) => c.id === caption)

  return (
    <>
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/shorts"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-[-.03em] text-foreground">Shorts Editor</h1>
            <p className="text-xs text-muted-foreground">Untitled Short · 0:27 · 9:16</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <Undo2 className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <Redo2 className="h-4 w-4" />
          </button>
          <ActionButton variant="secondary" onClick={() => toast.success("Draft saved")}>
            Save draft
          </ActionButton>
          <ActionButton onClick={() => toast.success("Exporting your Short...")}>
            <Download className="h-4 w-4" /> Export
          </ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_300px]">
        {/* ----------------------------- LEFT: Clips ---------------------------- */}
        <aside className="rounded-2xl border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-foreground">Clips</h2>
            <Badge variant="secondary">{clips.length}</Badge>
          </div>
          <div className="space-y-2">
            {clips.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-xl border p-2 text-left transition-all",
                  active === c.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-muted-foreground/40"
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <span className={`flex h-12 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.grad}`}>
                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.dur}</span>
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => toast.success("Add a clip")}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" /> Add Clip
          </button>
        </aside>

        {/* --------------------------- CENTER: Preview --------------------------- */}
        <section className="flex flex-col gap-4">
          {/* Preview stage */}
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-slate-950 p-6">
            <div className="relative aspect-[9/16] h-[420px] max-h-[55vh] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-fuchsia-700 to-pink-700 shadow-2xl ring-1 ring-white/10">
              {/* logo */}
              {toggles.logo && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                  <Sparkles className="h-3 w-3" /> CreatorOS
                </div>
              )}
              {/* music indicator */}
              {toggles.music && (
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                  <Music2 className="h-3 w-3 animate-pulse" /> Lofi Beat
                </div>
              )}
              {/* center play */}
              <button
                onClick={() => setPlaying((p) => !p)}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-all",
                  playing ? "scale-0 opacity-0" : "scale-100 opacity-100 hover:scale-110"
                )}>
                  <Play className="h-7 w-7 fill-white text-white" />
                </span>
              </button>
              {/* captions */}
              {toggles.captions && (
                <div className="absolute inset-x-0 bottom-16 flex justify-center px-4">
                  {activeCaption?.custom ? (
                    <p className="text-center text-2xl font-extrabold">
                      <span className="rounded bg-primary px-1 text-white">This</span>{" "}
                      <span className="text-white">is how you</span>{" "}
                      <span className="text-white/60">grow</span>
                    </p>
                  ) : (
                    <p className={cn("text-center text-2xl", activeCaption?.className)}>
                      This is how you grow
                    </p>
                  )}
                </div>
              )}
              {/* progress bar */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                <div className="h-full bg-primary transition-[width] duration-75" style={{ width: `${time}%` }} />
              </div>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-1">
              <button onClick={() => setTime(trim.start)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={() => setTime(trim.end)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">
              0:{String(Math.floor(time * 0.27)).padStart(2, "0")} <span className="text-muted-foreground">/ 0:27</span>
            </span>
            <div className="flex items-center gap-1">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                <Volume2 className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Scissors className="h-4 w-4 text-primary" /> Timeline
              </div>
              <span className="text-xs text-muted-foreground">Trim {Math.round(trim.start * 0.27)}s – {Math.round(trim.end * 0.27)}s</span>
            </div>
            {/* ruler */}
            <div className="mb-1.5 flex justify-between px-1 text-[10px] text-muted-foreground">
              {["0s", "5s", "10s", "15s", "20s", "27s"].map((t) => <span key={t}>{t}</span>)}
            </div>
            {/* track */}
            <div className="relative h-16 select-none rounded-xl bg-background p-1.5">
              <div className="flex h-full gap-1">
                {clips.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-lg bg-gradient-to-br opacity-90 transition hover:opacity-100",
                      c.grad,
                      active === c.id && "ring-2 ring-white"
                    )}
                  />
                ))}
              </div>
              {/* trim shades */}
              <div className="absolute inset-y-1.5 left-1.5 rounded-l-lg bg-slate-950/70" style={{ width: `${trim.start}%` }} />
              <div className="absolute inset-y-1.5 right-1.5 rounded-r-lg bg-slate-950/70" style={{ width: `${100 - trim.end}%` }} />
              {/* trim handles */}
              <div className="absolute inset-y-0 w-1.5 cursor-ew-resize rounded-full bg-primary" style={{ left: `${trim.start}%` }} />
              <div className="absolute inset-y-0 w-1.5 cursor-ew-resize rounded-full bg-primary" style={{ left: `${trim.end}%` }} />
              {/* playhead */}
              <div className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,.8)]" style={{ left: `${time}%` }}>
                <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm bg-white" />
              </div>
            </div>
            {/* trim sliders */}
            <div className="mt-3 grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-muted-foreground">
                Trim start
                <input
                  type="range" min="0" max="50" value={trim.start}
                  onChange={(e) => setTrim((s) => ({ ...s, start: Math.min(Number(e.target.value), s.end - 5) }))}
                  className="mt-1 w-full accent-[hsl(var(--primary))]"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Trim end
                <input
                  type="range" min="50" max="100" value={trim.end}
                  onChange={(e) => setTrim((s) => ({ ...s, end: Math.max(Number(e.target.value), s.start + 5) }))}
                  className="mt-1 w-full accent-[hsl(var(--primary))]"
                />
              </label>
            </div>
          </div>
        </section>

        {/* --------------------------- RIGHT: Editor panel --------------------------- */}
        <aside className="space-y-4">
          {/* Toggles */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold text-foreground">Elements</h2>
            <div className="space-y-2">
              {[
                { key: "captions", label: "Add Captions", icon: Captions, color: "text-violet-500" },
                { key: "music", label: "Add Music", icon: Music2, color: "text-pink-500" },
                { key: "logo", label: "Add Logo", icon: ImageIcon, color: "text-blue-500" },
              ].map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                    <Icon className={cn("h-4 w-4", color)} /> {label}
                  </span>
                  <button
                    onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      toggles[key] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      toggles[key] ? "translate-x-[22px]" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold text-foreground">Template</h2>
            <div className="grid grid-cols-3 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 transition-all",
                    template === t.id ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <div className={`flex aspect-[9/14] items-end bg-gradient-to-br ${t.grad} p-1.5`}>
                    <span className="text-[10px] font-bold text-white">{t.name}</span>
                  </div>
                  {template === t.id && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Caption style preview */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-bold text-foreground">Caption Style</h2>
            <div className="grid grid-cols-2 gap-2">
              {captionStyles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCaption(c.id)}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 bg-slate-950 transition-all",
                    caption === c.id ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  {c.custom ? (
                    <span className="text-sm font-extrabold">
                      <span className="rounded bg-primary px-0.5 text-white">Aa</span>
                      <span className="text-white/60">Bb</span>
                    </span>
                  ) : (
                    <span className={cn("text-sm", c.className)}>Aa Bb</span>
                  )}
                  <span className="text-[10px] font-semibold text-muted-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
