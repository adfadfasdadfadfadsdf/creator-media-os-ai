"use client"

import { useId, useState } from "react"
import { cn } from "@/lib/utils"

/* ----------------------------- Sparkline ---------------------------- */

export function Sparkline({ data, color = "#8b5cf6", area = true, className }) {
  const id = useId().replace(/:/g, "")
  const w = 100
  const h = 36
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 6) - 3
    return [x, y]
  })

  const line = pts.map((p) => p.join(",")).join(" ")
  const areaPts = `0,${h} ${line} ${w},${h}`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full", className)}
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <polygon points={areaPts} fill={`url(#spark-${id})`} />}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* ----------------------------- AreaChart ---------------------------- */

export function AreaChart({ data, color = "#8b5cf6", yTicks = ["2K", "1.5K", "1K", "500", "0"] }) {
  const id = useId().replace(/:/g, "")
  const max = Math.max(...data.map((d) => d.value)) * 1.1
  const peak = data.reduce((a, b, i) => (b.value > data[a].value ? i : a), 0)
  const [active, setActive] = useState(peak)

  const coords = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.value / max) * 100,
    ...d,
  }))

  const line = coords.map((c) => `${c.x},${c.y}`).join(" ")
  const areaPts = `0,100 ${line} 100,100`
  const a = coords[active]

  return (
    <div className="flex gap-3">
      {/* Y axis */}
      <div className="flex flex-col justify-between py-1 text-[11px] font-medium text-muted-foreground">
        {yTicks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative h-44 w-full">
          {/* gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {yTicks.map((t) => (
              <div key={t} className="h-px w-full bg-border/60" />
            ))}
          </div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPts} fill={`url(#area-${id})`} />
            <polyline
              points={line}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* points + hover targets */}
          {coords.map((c, i) => (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <span
                className={cn(
                  "block rounded-full border-2 bg-background transition-all",
                  i === active ? "h-3.5 w-3.5 border-primary shadow-[0_0_0_4px_rgba(139,92,246,.25)]" : "h-2 w-2 border-transparent"
                )}
                style={i === active ? { borderColor: color } : undefined}
              />
            </button>
          ))}

          {/* tooltip */}
          {a && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-1.5 text-center shadow-soft-lg"
              style={{ left: `${a.x}%`, top: `${a.y - 6}%` }}
            >
              <p className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">{a.label}</p>
              <p className="text-sm font-bold text-foreground">{a.value.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Views</p>
            </div>
          )}
        </div>

        {/* X axis */}
        <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
          {data.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
