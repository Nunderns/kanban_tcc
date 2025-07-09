import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-gray-100 dark:bg-gray-800",
  {
    variants: {
      variant: {
        default: "h-4 w-full",
        circle: "rounded-full",
        text: "h-4 w-full",
        title: "h-6 w-3/4",
        subtitle: "h-4 w-1/2",
        button: "h-10 w-24",
        card: "h-32 w-full rounded-lg",
        avatar: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(skeletonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
