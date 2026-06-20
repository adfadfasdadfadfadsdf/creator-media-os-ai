"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Accessible modal dialog (no Radix). Locks scroll, closes on Escape / backdrop.
 */
export function Modal({ open, onClose, title, description, children, footer, className }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-soft-lg animate-scale-in",
          className
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {title && (
          <h2 className="font-display text-xl font-bold tracking-[-.02em]">{title}</h2>
        )}
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
