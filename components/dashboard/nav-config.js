import {
  LayoutDashboard,
  FolderKanban,
  Images,
  Youtube,
  Clapperboard,
  FileText,
  Mic,
  Swords,
  LineChart,
  Settings,
} from "lucide-react"

export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Media", href: "/media", icon: Images },
  { label: "YouTube", href: "/youtube", icon: Youtube },
  { label: "Shorts", href: "/shorts", icon: Clapperboard },
  { label: "Scripts", href: "/scripts", icon: FileText },
  { label: "AI Voice", href: "/ai-voice", icon: Mic },
  { label: "Competitors", href: "/competitors", icon: Swords },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "Settings", href: "/settings", icon: Settings },
]
