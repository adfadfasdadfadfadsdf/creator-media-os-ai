import { execFile } from "child_process"
import { promisify } from "util"
import ffmpegPath from "ffmpeg-static"
import { fullPath, ensureKeyDir, fileSize } from "@/lib/storage"

const run = promisify(execFile)

const FONT = "C\\:/Windows/Fonts/arialbd.ttf"

/** Build drawtext filters that burn a wrapped, centered caption near the bottom. */
function captionFilters(caption) {
  const clean = caption
    .toUpperCase()
    .replace(/[^A-Z0-9 ?!.,'\-]/g, "")
    .replace(/'/g, "")
    .trim()
  if (!clean) return []

  // Word-wrap to ~16 chars per line, max 3 lines
  const words = clean.split(/\s+/)
  const lines = []
  let cur = ""
  for (const w of words) {
    if ((cur + " " + w).trim().length > 16) {
      if (cur) lines.push(cur.trim())
      cur = w
    } else {
      cur = (cur + " " + w).trim()
    }
  }
  if (cur) lines.push(cur)
  const shown = lines.slice(0, 3)

  const lineH = 96
  const baseY = 1920 - 260 - (shown.length - 1) * lineH
  return shown.map(
    (ln, i) =>
      `drawtext=fontfile='${FONT}':text='${ln}':fontcolor=white:fontsize=74:borderw=7:bordercolor=black@0.9:x=(w-text_w)/2:y=${baseY + i * lineH}`
  )
}

/**
 * Render a 9:16 vertical short from a source video.
 * Scales + center-crops to 1080x1920, optional trim, optional caption, H.264 MP4.
 * Returns { outputKey, sizeBytes }.
 */
export async function renderVerticalShort({ sourceKey, start, end, caption, logoKey }) {
  const workspaceId = sourceKey.split("/")[0]
  const outputKey = `${workspaceId}/short-${Date.now()}.mp4`
  await ensureKeyDir(outputKey)

  const input = fullPath(sourceKey)
  const output = fullPath(outputKey)

  // Build the video filter chain (scale/crop + optional burned caption)
  let vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"
  if (caption && caption.trim()) vf += "," + captionFilters(caption).join(",")

  const args = []
  if (start != null && start >= 0) args.push("-ss", String(start))
  args.push("-i", input)

  const chains = [`[0:v]${vf}[base]`]
  let mapLabel = "[base]"
  if (logoKey) {
    args.push("-i", fullPath(logoKey)) // second input = logo image
    chains.push("[1:v]scale=180:-1[lg]")
    chains.push("[base][lg]overlay=W-w-40:40[vout]")
    mapLabel = "[vout]"
  }

  if (end != null && end > (start || 0)) args.push("-t", String(end - (start || 0)))
  args.push(
    "-filter_complex", chains.join(";"),
    "-map", mapLabel,
    "-map", "0:a?",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-y",
    output
  )

  await run(ffmpegPath, args, { maxBuffer: 1024 * 1024 * 64, timeout: 5 * 60 * 1000 })
  const sizeBytes = await fileSize(outputKey)
  return { outputKey, sizeBytes }
}
