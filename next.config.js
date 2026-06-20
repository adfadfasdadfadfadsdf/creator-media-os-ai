const path = require("path")

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Keep native/binary packages out of the webpack bundle so their
  // file paths (e.g. the ffmpeg binary) resolve correctly at runtime.
  serverExternalPackages: ["ffmpeg-static"],
}

module.exports = nextConfig
