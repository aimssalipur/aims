import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
  {
    variants: {
      variant: {
        default:
          "bg-aims-navy text-primary-foreground hover:bg-aims-navy/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        primary:
          "bg-aims-navy text-white hover:bg-aims-navy/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        secondary:
          "bg-aims-green text-white hover:bg-aims-green/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        outline:
          "border-2 border-aims-navy/20 text-aims-navy hover:border-aims-navy hover:bg-aims-navy/5",
        ghost:
          "hover:bg-aims-navy/10 text-aims-navy",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90 shadow-md hover:shadow-lg",
        link: "text-aims-navy underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
