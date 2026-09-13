import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-aims-navy/10 text-aims-navy border-0",
        secondary:
          "bg-aims-green/10 text-aims-green border-0",
        destructive:
          "bg-red-50 border-red-200 text-red-700",
        outline:
          "text-slate-700 border-2 border-slate-200",
        success:
          "bg-emerald-50 text-emerald-700",
        warning:
          "bg-amber-50 text-amber-700",
        gold: "bg-aims-gold/15 text-amber-700 border-0",
        indigo:
          "bg-indigo-50 text-indigo-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
