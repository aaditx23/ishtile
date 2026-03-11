import * as React from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The duration of the animation in seconds
   * @default 30
   */
  duration?: number
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  ({ className, duration = 30, pauseOnHover = false, reverse = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("group flex overflow-hidden", className)}
        {...props}
      >
        <div
          className={cn(
            "flex shrink-0 justify-around gap-4 animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]"
          )}
          style={{
            animationDuration: `${duration}s`,
          }}
        >
          {children}
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "flex shrink-0 justify-around gap-4 animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]"
          )}
          style={{
            animationDuration: `${duration}s`,
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)

Marquee.displayName = "Marquee"

export { Marquee }
