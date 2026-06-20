"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const DropdownContext = createContext(null)

/**
 * Lightweight dropdown menu (no Radix). Closes on outside click and Escape.
 */
export function Dropdown({ children, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className={cn("relative", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({ children, className }) {
  const { open, setOpen } = useContext(DropdownContext)
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      className={className}
    >
      {children}
    </button>
  )
}

export function DropdownContent({ children, align = "end", className }) {
  const { open } = useContext(DropdownContext)
  if (!open) return null
  return (
    <div
      role="menu"
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] origin-top overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-soft-lg animate-scale-in",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownItem({ children, className, icon: Icon, ...props }) {
  const { setOpen } = useContext(DropdownContext)
  return (
    <button
      role="menuitem"
      onClick={(e) => {
        props.onClick?.(e)
        setOpen(false)
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      {children}
    </button>
  )
}

export function DropdownLabel({ children, className }) {
  return (
    <div className={cn("px-3 py-2 text-xs font-semibold text-muted-foreground", className)}>
      {children}
    </div>
  )
}

export function DropdownSeparator({ className }) {
  return <div className={cn("my-1 h-px bg-border", className)} />
}
