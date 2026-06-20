"use client"

import { useEffect, useRef, useState } from "react"
import {
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  MoreVertical,
  Search,
  Eye,
  Download,
  Trash2,
  Grid3x3,
  List,
  UploadCloud,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown"

const typeMeta = {
  IMAGE: { icon: ImageIcon, tint: "from-violet-500/25 to-blue-500/25 text-violet-500", label: "Image" },
  VIDEO: { icon: Video, tint: "from-pink-500/25 to-rose-500/25 text-pink-500", label: "Video" },
  AUDIO: { icon: Music, tint: "from-emerald-500/25 to-teal-500/25 text-emerald-500", label: "Audio" },
  DOC: { icon: FileText, tint: "from-amber-500/25 to-orange-500/25 text-amber-500", label: "Doc" },
}

const typeFilters = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
  { key: "audio", label: "Audio" },
  { key: "doc", label: "Docs" },
]

function fmtSize(b) {
  if (!b) return "—"
  if (b >= 1e9) return (b / 1e9).toFixed(1) + " GB"
  if (b >= 1e6) return (b / 1e6).toFixed(1) + " MB"
  if (b >= 1e3) return (b / 1e3).toFixed(1) + " KB"
  return b + " B"
}

function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append("file", file)
    xhr.open("POST", "/api/media/upload")
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) resolve(json.asset)
        else reject(new Error(json.message || "Upload failed"))
      } catch {
        reject(new Error("Upload failed"))
      }
    }
    xhr.onerror = () => reject(new Error("Network error"))
    xhr.send(fd)
  })
}

export default function MediaPage() {
  const [assets, setAssets] = useState(null)
  const [type, setType] = useState("all")
  const [query, setQuery] = useState("")
  const [view, setView] = useState("grid")
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(null)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  async function load() {
    try {
      const res = await fetch("/api/media")
      const json = await res.json()
      setAssets(json.assets || [])
    } catch {
      setAssets([])
    }
  }
  useEffect(() => { load() }, [])

  async function handleFiles(list) {
    const files = Array.from(list || [])
    for (const file of files) {
      setUploading({ name: file.name, progress: 0 })
      try {
        const asset = await uploadWithProgress(file, (p) => setUploading({ name: file.name, progress: p }))
        setAssets((prev) => [asset, ...(prev || [])])
        toast.success(`${file.name} uploaded`)
      } catch (e) {
        toast.error(`${file.name}: ${e.message}`)
      }
    }
    setUploading(null)
  }

  async function remove(id, name) {
    setAssets((prev) => prev.filter((a) => a.id !== id))
    setPreview(null)
    await fetch(`/api/media/${id}`, { method: "DELETE" })
    toast.success(`${name} deleted`)
  }

  const filtered = (assets || []).filter((a) => {
    if (type !== "all" && a.type !== type.toUpperCase()) return false
    if (query && !a.fileName.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <>
      <PageHeader title="Media Library" description="Upload, organize and reuse your assets — videos, images, audio & docs.">
        <ActionButton onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload
        </ActionButton>
      </PageHeader>

      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      {/* Upload area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all",
          dragging ? "scale-[1.01] border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"
        )}
      >
        {uploading ? (
          <div className="mx-auto max-w-md text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <UploadCloud className="h-4 w-4 text-primary" /> {uploading.name}
              </span>
              <span className="font-bold text-primary">{uploading.progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${uploading.progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <UploadCloud className="h-6 w-6" />
            </span>
            <p className="text-sm font-bold text-foreground">
              Drag &amp; drop files here, or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">Video, audio, images & documents · up to 100 MB</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex rounded-xl border border-border bg-card p-1">
          {[["grid", Grid3x3], ["list", List]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)} className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Type chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {typeFilters.map((f) => (
          <button key={f.key} onClick={() => setType(f.key)} className={cn("rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors", type === f.key ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground")}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-muted-foreground">{filtered.length} items</span>
      </div>

      {/* Content */}
      {assets === null ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-52 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><UploadCloud className="h-6 w-6" /></span>
          <p className="font-semibold text-foreground">{assets.length === 0 ? "No files yet" : "No files match"}</p>
          <p className="text-sm text-muted-foreground">{assets.length === 0 ? "Drag & drop or click upload to add your first asset." : "Try a different search or filter."}</p>
        </div>
      ) : view === "grid" ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((file) => {
            const meta = typeMeta[file.type] || typeMeta.DOC
            const Icon = meta.icon
            const isImg = file.type === "IMAGE"
            return (
              <Card key={file.id} className="group overflow-hidden">
                <div className={cn("relative flex h-36 items-center justify-center bg-gradient-to-br", meta.tint)}>
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.fileUrl} alt={file.fileName} className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-10 w-10 transition-transform group-hover:scale-110" />
                  )}
                  <Badge variant="secondary" className="absolute left-2 top-2 backdrop-blur">{meta.label}</Badge>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/40 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                    <button onClick={() => setPreview(file)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-900 transition hover:scale-110"><Eye className="h-4 w-4" /></button>
                    <a href={file.fileUrl} download={file.fileName} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-900 transition hover:scale-110"><Download className="h-4 w-4" /></a>
                    <button onClick={() => remove(file.id, file.fileName)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white transition hover:scale-110"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{file.fileName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{fmtSize(file.size)}</p>
                  </div>
                  <Dropdown>
                    <DropdownTrigger className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><MoreVertical className="h-4 w-4" /></DropdownTrigger>
                    <DropdownContent>
                      <DropdownItem icon={Eye} onClick={() => setPreview(file)}>View</DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem icon={Trash2} onClick={() => remove(file.id, file.fileName)} className="text-red-500 hover:text-red-600">Delete</DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="mt-5 overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((file) => {
              const meta = typeMeta[file.type] || typeMeta.DOC
              const Icon = meta.icon
              return (
                <div key={file.id} className="group flex items-center gap-4 p-3 transition-colors hover:bg-accent/40">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", meta.tint)}><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                  <span className="hidden w-20 text-sm text-muted-foreground md:block">{fmtSize(file.size)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreview(file)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><Eye className="h-4 w-4" /></button>
                    <a href={file.fileUrl} download={file.fileName} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"><Download className="h-4 w-4" /></a>
                    <button onClick={() => remove(file.id, file.fileName)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Preview modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.fileName}
        description={preview ? `${typeMeta[preview.type]?.label} · ${fmtSize(preview.size)}` : ""}
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => remove(preview.id, preview.fileName)}><Trash2 className="h-4 w-4" /> Delete</ActionButton>
            <a href={preview?.fileUrl} download={preview?.fileName}><ActionButton><Download className="h-4 w-4" /> Download</ActionButton></a>
          </>
        }
      >
        {preview && (
          <div className="flex max-h-[55vh] items-center justify-center overflow-hidden rounded-xl bg-muted">
            {preview.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.fileUrl} alt={preview.fileName} className="max-h-[55vh] w-full object-contain" />
            ) : preview.type === "VIDEO" ? (
              <video src={preview.fileUrl} controls className="max-h-[55vh] w-full" />
            ) : preview.type === "AUDIO" ? (
              <audio src={preview.fileUrl} controls className="w-full p-6" />
            ) : (
              <div className="flex h-48 w-full items-center justify-center"><FileText className="h-16 w-16 text-muted-foreground" /></div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
