import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

function modelList() {
  const def = process.env.OPENROUTER_DEFAULT_MODEL || "meta-llama/llama-3.3-70b-instruct:free"
  const fallbacks = (process.env.OPENROUTER_FALLBACK_MODELS || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
  return [def, ...fallbacks]
}

/**
 * Resolve which API key to use:
 * 1. Explicit key (passed in) — BYOK
 * 2. Active workspace/user OpenRouter key from DB
 * 3. Platform key from env
 */
export async function resolveApiKey({ apiKey, workspaceId, userId } = {}) {
  if (apiKey) return apiKey
  if (workspaceId || userId) {
    const row = await prisma.apiKey.findFirst({
      where: {
        provider: "openrouter",
        isActive: true,
        OR: [workspaceId ? { workspaceId } : undefined, userId ? { userId } : undefined].filter(Boolean),
      },
      orderBy: { createdAt: "desc" },
    })
    if (row?.encryptedKey) {
      const dec = decrypt(row.encryptedKey)
      if (dec) return dec
    }
  }
  return process.env.OPENROUTER_API_KEY || null
}

async function callModel(model, messages, { apiKey, temperature, maxTokens, json, timeoutMs }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs ?? 45000)
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://creator-media-os.local",
        "X-Title": "Creator Media OS AI",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 1200,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    })
  } catch (e) {
    const err = new Error(e.name === "AbortError" ? `Model ${model} timed out` : e.message)
    err.status = 503
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    const err = new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`)
    err.status = res.status
    throw err
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content ?? ""
  if (!text) {
    const err = new Error(`Model ${model} returned empty response`)
    err.status = 502
    throw err
  }
  return { text, model, usage: data?.usage || {} }
}

/**
 * Chat with automatic model fallback + one retry on transient errors.
 * Logs usage to the database when workspaceId is provided.
 */
export async function chat(messages, opts = {}) {
  const { workspaceId, userId, action = "chat", json = false } = opts
  const key = await resolveApiKey(opts)
  if (!key) throw new Error("No OpenRouter API key configured")

  const models = opts.models || modelList()
  let lastErr

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await callModel(model, messages, { ...opts, apiKey: key, json })
        // If a parser is provided (JSON mode), validate here so a model that
        // returns non-JSON is treated as a failure and we fall through to the next.
        if (opts.parse) {
          result.parsed = opts.parse(result.text)
        }
        if (workspaceId) {
          await prisma.usageLog
            .create({
              data: {
                workspaceId,
                userId: userId || null,
                action,
                provider: "openrouter",
                model: result.model,
                inputTokens: result.usage?.prompt_tokens || 0,
                outputTokens: result.usage?.completion_tokens || 0,
                creditsUsed: 0,
              },
            })
            .catch(() => {})
        }
        return result
      } catch (e) {
        lastErr = e
        // Retry only on rate-limit / server errors; otherwise move to next model
        if (e.status && e.status !== 429 && e.status < 500) break
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
      }
    }
  }
  throw lastErr || new Error("All models failed")
}

/** Best-effort JSON parsing for LLM output: strips fences, extracts the object,
 *  removes trailing commas, and repairs truncated JSON by closing open brackets. */
function parseLoose(text) {
  if (!text) throw new Error("Empty AI response")
  let s = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()

  const start = s.indexOf("{")
  if (start > 0) s = s.slice(start)

  const tryParse = (str) => {
    try {
      return JSON.parse(str)
    } catch {
      return undefined
    }
  }

  let out = tryParse(s)
  if (out !== undefined) return out

  // Remove trailing commas
  out = tryParse(s.replace(/,(\s*[}\]])/g, "$1"))
  if (out !== undefined) return out

  // Repair truncation: cut to last complete value, then close open brackets/quotes
  let depth = 0, inStr = false, esc = false, lastSafe = -1
  const stack = []
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === "\\") esc = true
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === "{" || c === "[") { stack.push(c === "{" ? "}" : "]"); depth++ }
    else if (c === "}" || c === "]") { stack.pop(); depth--; if (depth === 0) lastSafe = i }
    else if (c === "," && depth === 1) lastSafe = i - 1
  }
  let repaired = lastSafe > 0 ? s.slice(0, lastSafe + 1) : s
  // close any still-open structures
  let d2 = 0, inStr2 = false, esc2 = false
  const close = []
  for (let i = 0; i < repaired.length; i++) {
    const c = repaired[i]
    if (inStr2) { if (esc2) esc2 = false; else if (c === "\\") esc2 = true; else if (c === '"') inStr2 = false; continue }
    if (c === '"') inStr2 = true
    else if (c === "{") close.push("}")
    else if (c === "[") close.push("]")
    else if (c === "}" || c === "]") close.pop()
  }
  if (inStr2) repaired += '"'
  repaired += close.reverse().join("")
  out = tryParse(repaired.replace(/,(\s*[}\]])/g, "$1"))
  if (out !== undefined) return out

  throw new Error("Model did not return valid JSON")
}

/** Chat that expects a JSON object response. Validates JSON inside the model
 *  fallback loop, so non-JSON responses trigger the next model automatically. */
export async function chatJSON(messages, opts = {}) {
  const result = await chat(messages, {
    ...opts,
    maxTokens: opts.maxTokens ?? 2500,
    json: true,
    parse: parseLoose,
  })
  return { data: result.parsed, model: result.model, usage: result.usage }
}

/** Stable hash of a prompt — used for caching AI results. */
export function promptHash(input) {
  return crypto.createHash("sha256").update(typeof input === "string" ? input : JSON.stringify(input)).digest("hex")
}
