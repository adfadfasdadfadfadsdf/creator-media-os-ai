import { cn } from "@/lib/utils"

const variants = {
  default: "border-transparent bg-primary/10 text-primary",
  secondary: "border-transparent bg-muted text-muted-foreground",
  success: "border-transparent bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  warning: "border-transparent bg-amber-500/12 text-amber-600 dark:text-amber-400",
  danger: "border-transparent bg-red-500/12 text-red-600 dark:text-red-400",
  outline: "border-border text-foreground",
}

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
