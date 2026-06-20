"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)

    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.replace("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out..." : "Sign out"}
    </button>
  )
}
