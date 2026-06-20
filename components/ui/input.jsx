import { cn } from "@/lib/utils"

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-white/10 bg-white/[.045] px-4 text-[15px] text-white outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-white/20 focus:border-violet-400/70 focus:bg-white/[.07] focus:ring-4 focus:ring-violet-500/10",
        error && "border-rose-400/60 focus:border-rose-400 focus:ring-rose-500/10",
        className
      )}
      {...props}
    />
  )
}
