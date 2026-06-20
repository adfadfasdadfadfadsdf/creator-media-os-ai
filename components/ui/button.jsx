import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Button({ children, className, loading, ...props }) {
  return (
    <button
      className={cn(
        "group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-white px-4 text-sm font-bold text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-[0_14px_35px_rgba(139,92,246,.25)] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:animate-shimmer group-hover:opacity-100" />
      <span className="relative flex items-center gap-2">
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {loading ? "Please wait..." : children}
      </span>
    </button>
  )
}
