import { Sparkles } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_8px_24px_rgba(124,58,237,.4)]">
        <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.3} />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </div>
      <span className="font-display text-[19px] font-extrabold tracking-[-.04em] text-white">
        Creator<span className="text-violet-400">OS</span>
      </span>
    </div>
  )
}
