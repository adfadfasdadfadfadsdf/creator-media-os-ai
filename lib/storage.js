import { promises as fs } from "fs"
import path from "path"

// Local filesystem storage. Same interface can later be swapped for
// Cloudflare R2 / S3 (saveFile/readFile/deleteFile) without touching routes.
const ROOT = path.join(process.cwd(), "storage", "uploads")

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

/** Save a buffer under a workspace-scoped key. Returns the storage key. */
export async function saveFile(workspaceId, fileName, buffer) {
  const safe = fileName.replace(/[^\w.\-]+/g, "_")
  const key = `${workspaceId}/${Date.now()}-${safe}`
  const full = path.join(ROOT, key)
  await ensureDir(path.dirname(full))
  await fs.writeFile(full, buffer)
  return key
}

export async function readFile(key) {
  return fs.readFile(path.join(ROOT, key))
}

/** Absolute filesystem path for a storage key (used by FFmpeg). */
export function fullPath(key) {
  return path.join(ROOT, key)
}

/** Ensure the directory for a key exists (for tools that write directly). */
export async function ensureKeyDir(key) {
  await ensureDir(path.dirname(path.join(ROOT, key)))
}

/** Size in bytes of a stored file. */
export async function fileSize(key) {
  const s = await fs.stat(path.join(ROOT, key))
  return s.size
}

export async function deleteFile(key) {
  try {
    await fs.unlink(path.join(ROOT, key))
  } catch {
    /* ignore missing */
  }
}

/** Map a mime type to our AssetType enum. */
export function assetTypeFromMime(mime = "") {
  if (mime.startsWith("image/")) return "IMAGE"
  if (mime.startsWith("video/")) return "VIDEO"
  if (mime.startsWith("audio/")) return "AUDIO"
  return "DOC"
}
