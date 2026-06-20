"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Zap,
  ArrowRight,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { navItems } from "./nav-config"

function initials(name) {
  if (!name) return "U"
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

export function Sidebar({ user, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const pathname = usePathname()

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            onClick={onCloseMobile}
            title={collapsed ? label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_hsl(var(--primary))]"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            <Icon className={cn("h-[18px] w-[18px] shrink-0")} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        )
      })}
    </nav>
  )

  const brand = (
    <div className={cn("flex h-16 items-center gap-2.5 px-5", collapsed && "justify-center px-0")}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_8px_24px_rgba(124,58,237,.4)]">
        <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.3} />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </div>
      {!collapsed && (
        <span className="font-display text-[19px] font-extrabold tracking-[-.04em] text-foreground">
          Creator<span className="text-primary">OS</span>
        </span>
      )}
    </div>
  )

  const upgradeCard = !collapsed && (
    <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-blue-500/10 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <Zap className="h-4 w-4" />
        </span>
        <p className="text-sm font-bold text-foreground">Upgrade to Pro</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Unlock unlimited AI scripts, analytics &amp; more.
      </p>
      <button className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90">
        Upgrade Now
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )

  const userBlock = (
    <div className={cn("border-t border-border p-3", collapsed && "flex justify-center")}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent",
          collapsed && "p-0 hover:bg-transparent"
        )}
      >
        <span className="relative shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">
            {initials(user?.name)}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
        </span>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{user?.name || "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <MoreVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out lg:flex",
          collapsed ? "w-[80px]" : "w-[268px]"
        )}
      >
        <div className="relative">
          {brand}
          <button
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
            className={cn(
              "absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground",
              collapsed && "right-0 left-0 mx-auto"
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 flex-1 overflow-y-auto scrollbar-thin">{nav}</div>
        {upgradeCard}
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          onClick={onCloseMobile}
          className={cn(
            "absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card shadow-soft-lg transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between pr-3">
            {brand}
            <button
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 flex-1 overflow-y-auto scrollbar-thin">{nav}</div>
          {upgradeCard}
          {userBlock}
        </aside>
      </div>
    </>
  )
}
