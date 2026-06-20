"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Play, Pause, Square, Save, Volume2, Clock, Info } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

export default function AiVoicePage() {
  const [text, setText] = useState("Hey creators! This is your AI voiceover — type any script and hear it instantly.")
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURI] = useState("")
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [saving, setSaving] = useState(false)
  const [list, setList] = useState(null)
  const [supported, setSupported] = useState(true)
  const utterRef = useRef(null)

  // Load browser voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false)
      return
    }
    const synth = window.speechSynthesis
    function loadVoices() {
      const v = synth.getVoices()
      if (v.length) {
        setVoices(v)
        setVoiceURI((prev) => prev || v.find((x) => /en|hi/i.test(x.lang))?.voiceURI || v[0].voiceURI)
      }
    }
    loadVoices()
    synth.onvoiceschanged = loadVoices
    return () => { synth.cancel() }
  }, [])

  async function loadList() {
    try {
      const res = await fetch("/api/voice")
      const json = await res.json()
      setList(json.voiceovers || [])
    } catch {
      setList([])
    }
  }
  useEffect(() => { loadList() }, [])

  function speak(content) {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(content)
    const v = voices.find((x) => x.voiceURI === voiceURI)
    if (v) u.voice = v
    u.rate = rate
    u.pitch = pitch
    u.onend = () => { setSpeaking(false); setPaused(false) }
    u.onerror = () => { setSpeaking(false); setPaused(false) }
    utterRef.current = u
    synth.speak(u)
    setSpeaking(true)
    setPaused(false)
  }

  function togglePlay() {
    const synth = window.speechSynthesis
    if (!text.trim()) return toast.error("Enter some text")
    if (speaking && !paused) { synth.pause(); setPaused(true); return }
    if (speaking && paused) { synth.resume(); setPaused(false); return }
    speak(text)
  }

  function stop() {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  async function save() {
    if (!text.trim()) return toast.error("Enter some text")
    setSaving(true)
    try {
      const v = voices.find((x) => x.voiceURI === voiceURI)
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: v?.name, language: v?.lang }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed")
      toast.success("Voiceover saved")
      setList((prev) => [json.voiceover, ...(prev || [])])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  function timeAgo(d) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return "just now"
    if (s < 3600) return `${Math.floor(s / 60)} min ago`
    if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
    return new Date(d).toLocaleDateString()
  }

  // Prioritise English + Hindi voices in the dropdown
  const sortedVoices = [...voices].sort((a, b) => {
    const score = (l) => (/^hi/i.test(l) ? 0 : /^en/i.test(l) ? 1 : 2)
    return score(a.lang) - score(b.lang)
  })

  return (
    <>
      <PageHeader title="Voice Studio" description="Turn any script into a natural voiceover — choose a voice, preview instantly, and save.">
        <ActionButton onClick={save} loading={saving} variant="secondary">
          {!saving && <Save className="h-4 w-4" />} Save
        </ActionButton>
      </PageHeader>

      {!supported && (
        <Card className="mb-5 border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-foreground">
            <Info className="h-5 w-5 text-amber-500" />
            Your browser doesn’t support speech preview. Try Chrome or Edge.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <label className="text-sm font-semibold text-foreground">Script text</label>
              <textarea
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or write your script here..."
                className={inputCls + " mt-1.5 resize-none"}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">{text.length} characters · ~{Math.max(1, Math.round(text.length / 15))}s</p>

              {/* Controls */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                >
                  {speaking && !paused ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                  {speaking && !paused ? "Pause" : paused ? "Resume" : "Play"}
                </button>
                <button
                  onClick={stop}
                  disabled={!speaking}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
                >
                  <Square className="h-4 w-4" />
                </button>
                {speaking && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Volume2 className="h-4 w-4 animate-pulse" /> {paused ? "Paused" : "Speaking..."}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Voice settings</CardTitle>
            <CardDescription>Pick a voice and tune the delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Voice</span>
              <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)} className={inputCls + " mt-1.5"}>
                {sortedVoices.length === 0 && <option>Loading voices…</option>}
                {sortedVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-sm font-semibold text-foreground">Speed <span className="text-muted-foreground">{rate.toFixed(1)}x</span></span>
              <input type="range" min="0.5" max="1.5" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-2 w-full accent-[hsl(var(--primary))]" />
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-sm font-semibold text-foreground">Pitch <span className="text-muted-foreground">{pitch.toFixed(1)}</span></span>
              <input type="range" min="0.5" max="1.5" step="0.1" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="mt-2 w-full accent-[hsl(var(--primary))]" />
            </label>

            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="mr-1 inline h-3 w-3" /> Preview uses your browser’s voices (free). Downloadable studio audio is coming with a TTS provider.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saved voiceovers */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Saved voiceovers</CardTitle>
          <CardDescription>Your generated voiceover scripts.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {list === null ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
          ) : list.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No voiceovers yet — write a script and hit Save.</p>
          ) : (
            <div className="space-y-1">
              {list.map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent/50">
                  <button onClick={() => speak(v.text)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition hover:scale-110">
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{v.text}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {timeAgo(v.createdAt)} · {v.duration}s
                    </p>
                  </div>
                  {v.voice && <Badge variant="secondary" className="hidden sm:inline-flex">{v.voice}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
