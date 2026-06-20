/** Prompt templates for Creator Media OS AI. */

export function summaryPrompt({ title, description, transcript, channelName, views, duration }) {
  const system = {
    role: "system",
    content:
      "You are a YouTube content strategist. Analyze the video and respond ONLY with a valid JSON object. No markdown, no extra text.",
  }
  const user = {
    role: "user",
    content: `Analyze this YouTube video and return JSON with EXACTLY these keys:
{
  "one_line_summary": string,
  "detailed_summary": string,
  "key_points": string[],
  "viral_reason": string,
  "target_audience": string,
  "content_angle": string,
  "shorts_ideas": [{ "title": string, "desc": string }],
  "title_suggestions": string[],
  "hashtags": string[]
}

VIDEO DATA:
Title: ${title || "N/A"}
Channel: ${channelName || "N/A"}
Views: ${views ?? "N/A"}
Duration: ${duration || "N/A"}
Description: ${(description || "N/A").slice(0, 1500)}
${transcript ? `Transcript (excerpt): ${transcript.slice(0, 4000)}` : ""}

Give 4-5 key_points, 4 shorts_ideas, 4 title_suggestions, 6 hashtags. Be specific and useful.`,
  }
  return [system, user]
}

export function competitorPrompt({ channelName, videos }) {
  const list = (videos || [])
    .map((v) => `- "${v.title}" — ${v.views} views (${v.duration || "?"})`)
    .join("\n")
  return [
    { role: "system", content: "You are a YouTube growth analyst. Respond ONLY with a valid JSON object. No markdown." },
    {
      role: "user",
      content: `Analyze this competitor channel and return JSON with EXACTLY these keys:
{
  "top_patterns": string[],
  "best_performing_topics": string[],
  "title_patterns": string[],
  "content_gaps": string[],
  "shorts_ideas": string[],
  "recommendations": string[]
}

CHANNEL: ${channelName}
RECENT VIDEOS (title — views):
${list}

Give 3-5 items per array. Be specific and actionable.`,
    },
  ]
}

export function scriptPrompt({ topic, summary, duration = 30, tone = "energetic", language = "English" }) {
  const system = {
    role: "system",
    content:
      "You are a short-form video scriptwriter. Respond ONLY with a valid JSON object. No markdown.",
  }
  const user = {
    role: "user",
    content: `Write a ${duration}-second ${tone} short-form video script in ${language}. Return JSON with EXACTLY these keys:
{
  "title": string,
  "hook": string,
  "script": string,
  "voiceover_text": string,
  "on_screen_text": string[],
  "caption_lines": string[],
  "visual_suggestions": string[],
  "music_mood": string,
  "effects": string[],
  "hashtags": string[],
  "cta": string
}

TOPIC: ${topic}
${summary ? `CONTEXT: ${summary.slice(0, 1500)}` : ""}`,
  }
  return [system, user]
}
