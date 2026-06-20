import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { formatDuration, compactNumber } from "@/lib/youtube"

// Maps app niches → official YouTube category IDs (empty = all categories)
export const CATEGORY_IDS = {
  All: "",
  Tech: "28",
  Gaming: "20",
  Education: "27",
  Entertainment: "24",
  News: "25",
  Comedy: "23",
  Music: "10",
  Sports: "17",
  Travel: "19",
  Movies: "1",
  Autos: "2",
  Howto: "26",
}

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const key = process.env.YOUTUBE_API_KEY
  if (!key) {
    return NextResponse.json({ needsKey: true, message: "Add a YouTube Data API key to enable Trend Finder." }, { status: 200 })
  }

  const { searchParams } = new URL(request.url)
  const country = (searchParams.get("country") || "IN").toUpperCase()
  const category = searchParams.get("category") || "All"
  const categoryId = CATEGORY_IDS[category] ?? ""

  try {
    const params = new URLSearchParams({
      part: "snippet,statistics,contentDetails",
      chart: "mostPopular",
      regionCode: country,
      maxResults: "12",
      key,
    })
    if (categoryId) params.set("videoCategoryId", categoryId)

    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
    const json = await res.json()
    if (!res.ok) {
      return NextResponse.json({ message: json.error?.message || "YouTube API error" }, { status: 400 })
    }

    const videos = (json.items || []).map((it) => ({
      videoId: it.id,
      url: `https://youtube.com/watch?v=${it.id}`,
      title: it.snippet?.title,
      channelName: it.snippet?.channelTitle,
      thumbnailUrl: it.snippet?.thumbnails?.medium?.url,
      publishedAt: it.snippet?.publishedAt,
      views: compactNumber(Number(it.statistics?.viewCount) || 0),
      likes: compactNumber(Number(it.statistics?.likeCount) || 0),
      duration: formatDuration(it.contentDetails?.duration),
    }))

    // Save the search for history
    await prisma.trendSearch
      .create({ data: { workspaceId: session.workspaceId, userId: session.userId, country, category, resultsJson: videos } })
      .catch(() => {})

    return NextResponse.json({ country, category, videos })
  } catch (e) {
    console.error("trending error:", e)
    return NextResponse.json({ message: "Failed to fetch trends." }, { status: 500 })
  }
}
