"use client"

import { useEffect, useState } from "react"
import { User, Palette, Bell, CreditCard, KeyRound, Sun, Moon, Monitor, Check } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { ApiKeysPanel } from "@/components/settings/api-keys-panel"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api-keys", label: "API Keys", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
]

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        {...props}
      />
    </label>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={
        "relative h-6 w-11 rounded-full transition-colors " +
        (checked ? "bg-primary" : "bg-muted")
      }
    >
      <span
        className={
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
          (checked ? "translate-x-[22px]" : "translate-x-0.5")
        }
      />
    </button>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile")
  const [theme, setTheme] = useState("dark")
  const [notif, setNotif] = useState({ email: true, push: false, weekly: true })
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    let saved = "system"
    try {
      saved = localStorage.getItem("theme") || "system"
    } catch (e) {}
    setTheme(saved)
  }, [])

  function applyTheme(t) {
    setTheme(t)
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList.toggle("dark", isDark)
    try {
      if (t === "system") localStorage.removeItem("theme")
      else localStorage.setItem("theme", t)
    } catch (e) {}
  }

  const themeOptions = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ]

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, appearance and preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Tabs */}
        <nav className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors " +
                (tab === id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xl font-bold text-white">
                    CR
                  </span>
                  <ActionButton variant="secondary">Change avatar</ActionButton>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" defaultValue="Creator" />
                  <Field label="Username" defaultValue="@creator" />
                </div>
                <Field label="Email" type="email" defaultValue="creator@email.com" />
                <Field label="Bio" defaultValue="Full-time content creator & editor." />
                <div className="flex justify-end">
                  <ActionButton onClick={() => toast.success("Profile saved")}>Save changes</ActionButton>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how CreatorOS looks on your device.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {themeOptions.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => applyTheme(id)}
                      className={
                        "relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all " +
                        (theme === id
                          ? "border-primary bg-accent"
                          : "border-border hover:border-muted-foreground/40")
                      }
                    >
                      {theme === id && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                      <Icon className="h-6 w-6 text-foreground" />
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "api-keys" && <ApiKeysPanel />}

          {tab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what updates you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { key: "email", title: "Email notifications", desc: "Get notified about important account activity." },
                  { key: "push", title: "Push notifications", desc: "Receive alerts on your devices in real time." },
                  { key: "weekly", title: "Weekly digest", desc: "A summary of your channel's performance." },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between gap-4 rounded-xl py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.desc}</p>
                    </div>
                    <Toggle checked={notif[n.key]} onChange={(v) => setNotif((s) => ({ ...s, [n.key]: v }))} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === "billing" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Current plan <Badge variant="default">Pro</Badge>
                  </CardTitle>
                  <CardDescription>$19/month · renews on July 20, 2026</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <ActionButton variant="secondary">Manage subscription</ActionButton>
                  <ActionButton variant="outline">View invoices</ActionButton>
                </CardContent>
              </Card>

              <Card className="border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-500">Danger zone</CardTitle>
                  <CardDescription>Permanently delete your account and all data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActionButton variant="danger" onClick={() => setConfirm(true)}>
                    Delete account
                  </ActionButton>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete account?"
        description="This action is permanent and cannot be undone. All your projects, media and scripts will be removed."
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </ActionButton>
            <ActionButton
              variant="danger"
              onClick={() => {
                setConfirm(false)
                toast.success("Account scheduled for deletion")
              }}
            >
              Yes, delete
            </ActionButton>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Type your decision carefully — this removes everything tied to your workspace.
        </p>
      </Modal>
    </>
  )
}
