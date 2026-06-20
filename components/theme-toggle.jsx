"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
    try {
      localStorage.setItem("theme", next)
    } catch (e) {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      {/* Avoid hydration mismatch: render the icon only after mount */}
      {mounted &&
        (theme === "dark" ? (
          <Sun className="h-[18px] w-[18px] animate-scale-in" />
        ) : (
          <Moon className="h-[18px] w-[18px] animate-scale-in" />
        ))}
    </button>
  )
}
