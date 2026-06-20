"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Menu, Search, Bell, User, Settings, LogOut, CreditCard, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown"

function initials(name) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Navbar({ user, onOpenMobile }) {
  const router = useRouter()

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.replace("/login")
      router.refresh()
    } catch (e) {
      console.error("Logout failed:", e)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onOpenMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, media, scripts..."
          className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-16 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground md:flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <ThemeToggle />

        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
            3
          </span>
        </button>

        {/* Profile dropdown */}
        <Dropdown>
          <DropdownTrigger className="flex items-center gap-2.5 rounded-xl border border-transparent p-1 pr-2 transition-colors hover:border-border hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold text-white">
                {initials(user?.name)}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight text-foreground">
                {user?.name || "User"}
              </span>
              <span className="block text-xs leading-tight text-muted-foreground">Creator Plan</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>
              <span className="block font-bold text-foreground">{user?.name || "User"}</span>
              <span className="block font-normal">{user?.email || ""}</span>
            </DropdownLabel>
            <DropdownSeparator />
            <Link href="/settings">
              <DropdownItem icon={User}>Profile</DropdownItem>
            </Link>
            <Link href="/settings">
              <DropdownItem icon={CreditCard}>Billing</DropdownItem>
            </Link>
            <Link href="/settings">
              <DropdownItem icon={Settings}>Settings</DropdownItem>
            </Link>
            <DropdownSeparator />
            <DropdownItem icon={LogOut} onClick={logout} className="text-red-500 hover:text-red-600">
              Sign out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </header>
  )
}
