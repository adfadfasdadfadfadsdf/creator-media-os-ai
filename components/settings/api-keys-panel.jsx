"use client"

import { useEffect, useState } from "react"
import { KeyRound, Trash2, Plus, Activity, Cpu, ArrowDownToLine, ArrowUpFromLine, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { ActionButton } from "@/components/ui/action-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function ApiKeysPanel() {
  const [keys, setKeys] = useState(null)
  const [usage, setUsage] = useState(null)
  const [keyInput, setKeyInput] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const [k, u] = await Promise.all([
      fetch("/api/keys").then((r) => r.json()),
      fetch("/api/usage").then((r) => r.json()),
    ])
    setKeys(k.keys || [])
    setUsage(u)
  }
  useEffect(() => { load() }, [])

  async function addKey() {
    if (!keyInput.trim()) return toast.error("Paste your OpenRouter key")
    setSaving(true)
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "openrouter", key: keyInput.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed")
      toast.success("API key saved & verified")
      setKeyInput("")
      setKeys((prev) => [json.key, ...(prev || []).filter((x) => x.provider !== "openrouter")])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeKey(id) {
    setKeys((prev) => prev.filter((k) => k.id !== id))
    await fetch(`/api/keys?id=${id}`, { method: "DELETE" })
    toast.success("Key removed")
  }

  const stats = [
    { label: "AI Calls", value: usage?.totalCalls ?? 0, icon: Activity, color: "#8b5cf6" },
    { label: "Input Tokens", value: (usage?.inputTokens ?? 0).toLocaleString(), icon: ArrowDownToLine, color: "#3b82f6" },
    { label: "Output Tokens", value: (usage?.outputTokens ?? 0).toLocaleString(), icon: ArrowUpFromLine, color: "#10b981" },
  ]

  return (
    <div className="space-y-6">
      {/* BYOK */}
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter API Key (BYOK)</CardTitle>
          <CardDescription>
            Add your own key to use your own rate limits & credits. We verify and encrypt it before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKey()}
              placeholder="sk-or-v1-..."
              className="h-11 flex-1 rounded-lg border border-border bg-background px-3.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <ActionButton onClick={addKey} loading={saving}>
              {!saving && <Plus className="h-4 w-4" />} Add Key
            </ActionButton>
          </div>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Get a free OpenRouter key <ExternalLink className="h-3 w-3" />
          </a>

          {/* Key list */}
          <div className="space-y-2">
            {keys === null ? (
              <Skeleton className="h-14 w-full rounded-xl" />
            ) : keys.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No key added — the platform’s shared free key is being used.
              </div>
            ) : (
              keys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
                      {k.masked}
                      {k.isActive && <Badge variant="success">Active</Badge>}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">{k.provider}</p>
                  </div>
                  <button
                    onClick={() => removeKey(k.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>AI Usage</CardTitle>
          <CardDescription>Tokens & calls consumed by this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-border bg-background p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1f`, color }}>
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 font-display text-xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {usage?.recent?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-foreground">Recent activity</p>
              <div className="space-y-1">
                {usage.recent.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-accent/40">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 font-medium text-foreground">{r.action}</span>
                    <span className="hidden text-xs text-muted-foreground sm:block">{r.model}</span>
                    <span className="text-xs text-muted-foreground">{r.inputTokens + r.outputTokens} tok</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
