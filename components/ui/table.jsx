import { cn } from "@/lib/utils"

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("[&_tr]:border-b border-border", className)} {...props} />
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }) {
  return <td className={cn("px-4 py-3.5 align-middle", className)} {...props} />
}
