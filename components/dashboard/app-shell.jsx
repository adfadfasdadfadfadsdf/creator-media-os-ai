"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"

export function AppShell({ user, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Restore collapsed preference
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "1")
    } catch (e) {}
  }, [])

  function toggleCollapse() {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem("sidebar-collapsed", next ? "1" : "0")
      } catch (e) {}
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar user={user} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
