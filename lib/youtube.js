/** YouTube helpers. Metadata via official Data API when a key is present,
 *  otherwise public oEmbed (title/channel/thumbnail, no key required). */

export function parseVideoId(url) {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

/** No-key public metadata via oEmbed. */
export async function fetchOEmbed(videoId) {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  )
  if (!res.ok) throw new Error("Video not found or is private")
  const d = await res.json()
  return {
    title: d.title,
    channelName: d.author_name,
    thumbnailUrl: d.thumbnail_url,
  }
}

/** Rich metadata (views/likes/description/duration) via YouTube Data API — needs key. */
export async function fetchDataApi(videoId) {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return null
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${key}`
  )
  if (!res.ok) return null
  const d = await res.json()
  const item = d.items?.[0]
  if (!item) return null
  return {
    title: item.snippet?.title,
    description: item.snippet?.description,
    channelName: item.snippet?.channelTitle,
    thumbnailUrl: item.snippet?.thumbnails?.high?.url,
    tags: item.snippet?.tags || [],
    publishedAt: item.snippet?.publishedAt,
    views: Number(item.statistics?.viewCount) || null,
    likes: Number(item.statistics?.likeCount) || null,
    comments: Number(item.statistics?.commentCount) || null,
    duration: item.contentDetails?.duration, // ISO 8601 e.g. PT8M42S
  }
}

/** Best available metadata: Data API if key present, else oEmbed. */
export async function fetchVideoMeta(videoId) {
  const rich = await fetchDataApi(videoId)
  if (rich) return { ...rich, source: "data-api" }
  const basic = await fetchOEmbed(videoId)
  return { ...basic, source: "oembed" }
}

/** Format ISO8601 duration (PT8M42S) → "8:42". */
export function formatDuration(iso) {
  if (!iso) return null
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return null
  const h = Number(m[1] || 0)
  const min = Number(m[2] || 0)
  const s = Number(m[3] || 0)
  const pad = (n) => String(n).padStart(2, "0")
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`
}

export function compactNumber(n) {
  if (n == null) return null
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
  return String(n)
}

/* ----------------------------- Channels ---------------------------------- */

const API = "https://www.googleapis.com/youtube/v3"

/** Resolve a channel id from a URL, @handle, channel id, or search term. */
export async function resolveChannelId(input, key) {
  const raw = (input || "").trim()
  // Direct channel id
  let m = raw.match(/(UC[\w-]{22})/)
  if (m) return m[1]

  // @handle (from URL or plain)
  m = raw.match(/@([\w.\-]+)/)
  if (m) {
    const res = await fetch(`${API}/channels?part=id&forHandle=@${m[1]}&key=${key}`)
    const d = await res.json()
    if (d.items?.[0]) return d.items[0].id
  }

  // Fallback: search by name
  const term = raw.replace(/https?:\/\/[^ ]*\//, "").replace(/[@/]/g, " ").trim()
  const res = await fetch(`${API}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(term)}&key=${key}`)
  const d = await res.json()
  return d.items?.[0]?.snippet?.channelId || d.items?.[0]?.id?.channelId || null
}

/** Channel info + uploads playlist id. */
export async function getChannelInfo(channelId, key) {
  const res = await fetch(`${API}/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${key}`)
  const d = await res.json()
  const it = d.items?.[0]
  if (!it) return null
  return {
    channelId,
    name: it.snippet?.title,
    thumbnail: it.snippet?.thumbnails?.default?.url,
    subscribers: Number(it.statistics?.subscriberCount) || null,
    totalViews: Number(it.statistics?.viewCount) || null,
    videoCount: Number(it.statistics?.videoCount) || null,
    uploads: it.contentDetails?.relatedPlaylists?.uploads,
  }
}

/** Recent videos for a channel (via uploads playlist). */
export async function getChannelRecentVideos(uploadsPlaylist, key, max = 10) {
  const pl = await fetch(`${API}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylist}&maxResults=${max}&key=${key}`)
  const pd = await pl.json()
  const ids = (pd.items || []).map((i) => i.contentDetails?.videoId).filter(Boolean)
  if (!ids.length) return []

  const vr = await fetch(`${API}/videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}&key=${key}`)
  const vd = await vr.json()
  return (vd.items || []).map((it) => ({
    videoId: it.id,
    title: it.snippet?.title,
    thumbnail: it.snippet?.thumbnails?.medium?.url,
    publishedAt: it.snippet?.publishedAt,
    views: Number(it.statistics?.viewCount) || 0,
    likes: Number(it.statistics?.likeCount) || 0,
    duration: formatDuration(it.contentDetails?.duration),
  }))
}
