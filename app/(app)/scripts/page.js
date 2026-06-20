"use client"

import { useEffect, useState } from "react"
import {
  FileText,
  Sparkles,
  MoreVertical,
  Clock,
  Wand2,
  Mic,
  Hash,
  Music2,
  Megaphone,
  Type,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Modal } from "@/components/ui/modal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const tones = ["Energetic", "News style", "Funny", "Educational", "Storytelling", "Cinematic", "Motivational", "Professional", "Casual"]
const durations = [15, 30, 45, 60]
const languages = ["English", "Hindi", "Hinglish"]

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

export default function ScriptsPage() {
  const [scripts, setScripts] = useState(null)
  const [genOpen, setGenOpen] = useState(false)
  const [view, setView] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({ topic: "", duration: 30, tone: "Energetic", language: "English" })

  async function load() {
    try {
      const res = await fetch("/api/scripts")
      const json = await res.json()
      setScripts(json.scripts || [])
    } catch {
      setScripts([])
    }
  }
  useEffect(() => { load() }, [])

  async function generate() {
    if (!form.topic.trim()) return toast.error("Enter a topic")
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed")
      toast.success("Script generated")
      setGenOpen(false)
      setScripts((prev) => [json.script, ...(prev || [])])
      setView(json.script)
      setForm((f) => ({ ...f, topic: "" }))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  function timeAgo(d) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return "just now"
    if (s < 3600) return `${Math.floor(s / 60)} min ago`
    if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
    return new Date(d).toLocaleDateString()
  }

  return (
    <>
      <PageHeader title="Scripts" description="Generate short-form video scripts with AI — hook, voiceover, captions & more.">
        <ActionButton onClick={() => setGenOpen(true)}>
          <Sparkles className="h-4 w-4" /> Generate with AI
        </ActionButton>
      </PageHeader>

      {scripts === null ? (
        <Card><CardContent className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</CardContent></Card>
      ) : scripts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wand2 className="h-7 w-7" />
            </span>
            <p className="font-bold text-foreground">No scripts yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">Generate your first AI script — pick a topic, tone and duration.</p>
            <ActionButton onClick={() => setGenOpen(true)}><Sparkles className="h-4 w-4" /> Generate with AI</ActionButton>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Tone</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {scripts.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => setView(s)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="flex items-center gap-2 font-semibold text-foreground">
                          {s.title || "Untitled"}
                          <Badge variant="default" className="gap-1"><Sparkles className="h-3 w-3" /> AI</Badge>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{s.tone}</TableCell>
                    <TableCell className="text-muted-foreground">{s.duration}s</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {timeAgo(s.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><MoreVertical className="h-4 w-4" /></button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Generate modal */}
      <Modal
        open={genOpen}
        onClose={() => !generating && setGenOpen(false)}
        title="Generate a script with AI"
        description="Describe your topic — AI writes a full short-form script."
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => setGenOpen(false)} disabled={generating}>Cancel</ActionButton>
            <ActionButton onClick={generate} loading={generating}>
              {!generating && <Sparkles className="h-4 w-4" />}{generating ? "Writing..." : "Generate"}
            </ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Topic / idea">
            <textarea
              autoFocus
              rows={2}
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. 3 editing tricks that make videos look pro"
              className={inputCls + " h-auto py-2.5"}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Duration">
              <select value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className={inputCls}>
                {durations.map((d) => <option key={d} value={d}>{d}s</option>)}
              </select>
            </Field>
            <Field label="Tone">
              <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className={inputCls}>
                {tones.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inputCls}>
                {languages.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Modal>

      {/* View script modal */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.title || "Script"} className="max-w-2xl">
        {view && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto scrollbar-thin pr-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{view.tone}</Badge>
              <Badge variant="secondary">{view.duration}s</Badge>
              <Badge variant="secondary">{view.language}</Badge>
              {view.musicMood && <Badge variant="default"><Music2 className="h-3 w-3" /> {view.musicMood}</Badge>}
            </div>

            <Block icon={Megaphone} color="#8b5cf6" label="Hook">{view.hook}</Block>
            <Block icon={FileText} color="#3b82f6" label="Script">{view.script}</Block>
            <Block icon={Mic} color="#ec4899" label="Voiceover">{view.voiceoverText}</Block>

            {view.onScreenText?.length > 0 && (
              <Block icon={Type} color="#10b981" label="On-screen text">
                <ul className="list-disc space-y-1 pl-5">{view.onScreenText.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </Block>
            )}
            {view.cta && <Block icon={Megaphone} color="#f59e0b" label="CTA">{view.cta}</Block>}
            {view.hashtags?.length > 0 && (
              <Block icon={Hash} color="#10b981" label="Hashtags">
                <div className="flex flex-wrap gap-1.5">
                  {view.hashtags.map((h) => <span key={h} className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">{h}</span>)}
                </div>
              </Block>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

function Block({ icon: Icon, color, label, children }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: `${color}1f`, color }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}
