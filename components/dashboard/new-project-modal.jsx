"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { ActionButton } from "@/components/ui/action-button"
import { Modal } from "@/components/ui/modal"

const niches = ["Tech", "Gaming", "Education", "Finance", "Entertainment", "News", "Comedy", "Food", "Travel", "Motivation", "Fitness", "Business"]
const platforms = ["YouTube", "Shorts", "Instagram Reels", "TikTok"]

const inputCls =
  "mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

export function NewProjectModal({ label = "New Project", size = "md", onCreated }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", niche: "", platform: "" })

  async function create() {
    if (!form.name.trim()) return toast.error("Please name your project")
    setSaving(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Failed")
      toast.success(`Project “${json.project.name}” created`)
      onCreated?.(json.project)
      setForm({ name: "", niche: "", platform: "" })
      setOpen(false)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ActionButton size={size} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {label}
      </ActionButton>

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        title="Create a new project"
        description="Spin up a fresh workspace for your next piece of content."
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </ActionButton>
            <ActionButton onClick={create} loading={saving}>
              Create project
            </ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Project name</span>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="e.g. Summer YouTube Series"
              className={inputCls}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Niche</span>
              <select value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} className={inputCls}>
                <option value="">Select…</option>
                {niches.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Platform</span>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={inputCls}>
                <option value="">Select…</option>
                {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        </div>
      </Modal>
    </>
  )
}
