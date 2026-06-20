"use client"

import { useEffect, useState } from "react"
import { MoreVertical, FolderKanban, Images, Clapperboard, FileText, Calendar } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { NewProjectModal } from "@/components/dashboard/new-project-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/ui/dropdown"

const grads = [
  "from-violet-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-sky-500 to-indigo-500",
  "from-fuchsia-500 to-purple-500",
]

const statusVariant = { active: "default", review: "warning", done: "success", planning: "secondary" }

export default function ProjectsPage() {
  const [projects, setProjects] = useState(null)

  async function load() {
    try {
      const res = await fetch("/api/projects")
      const json = await res.json()
      setProjects(json.projects || [])
    } catch {
      setProjects([])
    }
  }
  useEffect(() => { load() }, [])

  async function remove(id, name) {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    toast.success(`“${name}” deleted`)
  }

  function timeAgo(d) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return "just now"
    if (s < 3600) return `${Math.floor(s / 60)} min ago`
    if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
    return new Date(d).toLocaleDateString()
  }

  return (
    <>
      <PageHeader title="Projects" description="Organize your content production from idea to publish.">
        <NewProjectModal onCreated={(p) => setProjects((prev) => [p, ...(prev || [])])} />
      </PageHeader>

      {projects === null ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderKanban className="h-7 w-7" />
            </span>
            <p className="font-bold text-foreground">No projects yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">Create your first project to organize media, scripts and shorts.</p>
            <NewProjectModal label="Create your first project" onCreated={(p) => setProjects((prev) => [p, ...(prev || [])])} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => (
            <Card key={p.id} className="group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grads[i % grads.length]} text-white shadow-soft`}>
                    <FolderKanban className="h-5 w-5" />
                  </span>
                  <Dropdown>
                    <DropdownTrigger className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-accent hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownTrigger>
                    <DropdownContent>
                      <DropdownItem onClick={() => toast.message("Project detail coming soon")}>Open</DropdownItem>
                      <DropdownItem className="text-red-500 hover:text-red-600" onClick={() => remove(p.id, p.name)}>Delete</DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">{p.name}</h3>
                  <Badge variant={statusVariant[p.status] || "secondary"} className="capitalize">{p.status}</Badge>
                </div>
                <p className="mt-1 flex flex-wrap gap-1.5 text-sm text-muted-foreground">
                  {p.niche && <Badge variant="outline">{p.niche}</Badge>}
                  {p.platform && <Badge variant="outline">{p.platform}</Badge>}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Images className="h-3.5 w-3.5" />{p._count?.mediaAssets ?? 0}</span>
                  <span className="flex items-center gap-1.5"><Clapperboard className="h-3.5 w-3.5" />{p._count?.shorts ?? 0}</span>
                  <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />{p._count?.scripts ?? 0}</span>
                  <span className="ml-auto flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{timeAgo(p.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
