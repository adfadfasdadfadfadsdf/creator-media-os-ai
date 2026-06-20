import { LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-soft hover:opacity-90 focus-visible:ring-ring",
  secondary:
    "border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
  ghost:
    "text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-accent focus-visible:ring-ring",
  danger:
    "bg-red-500 text-white shadow-soft hover:bg-red-600 focus-visible:ring-red-400",
}

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-9 w-9",
}

/**
 * Flexible app button (distinct from the bold full-width auth Button).
 */
export function ActionButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
