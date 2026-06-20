import crypto from "crypto"

// 32-byte key from env (falls back to a hash of JWT_SECRET for dev convenience)
function getKey() {
  const hex = process.env.ENCRYPTION_KEY
  if (hex && hex.length === 64) return Buffer.from(hex, "hex")
  return crypto.createHash("sha256").update(process.env.JWT_SECRET || "dev-secret").digest()
}

/** Encrypt a string → "iv:tag:ciphertext" (all hex). */
export function encrypt(plain) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv)
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`
}

/** Decrypt "iv:tag:ciphertext" → original string. Returns null on failure. */
export function decrypt(payload) {
  try {
    const [ivHex, tagHex, dataHex] = String(payload).split(":")
    if (!ivHex || !tagHex || !dataHex) return null
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"))
    decipher.setAuthTag(Buffer.from(tagHex, "hex"))
    return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8")
  } catch {
    return null
  }
}

/** Mask a secret for display: keeps a short prefix + last 4 chars. */
export function maskKey(key) {
  if (!key) return ""
  if (key.length <= 12) return key.slice(0, 4) + "****"
  return key.slice(0, 10) + "..." + key.slice(-4)
}
