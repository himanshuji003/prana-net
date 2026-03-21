import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCTAProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "ghost" | "teal" | "gold" | "danger";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

export const AnimatedCTA = React.forwardRef<HTMLButtonElement, AnimatedCTAProps>(
  ({ className, variant = "primary", size = "default", children, type = "button", ...props }, ref) => {
    const variants = {
      primary: "bg-health-green text-forest-primary hover:brightness-110 border border-transparent",
      ghost:   "bg-transparent text-health-green border border-health-green hover:bg-health-green hover:text-forest-primary",
      teal:    "bg-accent-teal text-forest-primary hover:brightness-110 border border-transparent",
      gold:    "bg-accent-gold text-forest-primary hover:brightness-110 border border-transparent",
      danger:  "bg-health-red text-cream hover:brightness-110 border border-transparent",
    };

    const sizes = {
      default: "h-11 px-7 text-sm",
      sm:      "h-8 px-4 text-xs",
      lg:      "h-14 px-10 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className={cn(
          // square corners, tight tracking, clean focus
          "inline-flex items-center justify-center font-sans font-semibold uppercase tracking-[0.12em] transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-health-green",
          "disabled:pointer-events-none disabled:opacity-40",
          variants[variant],
          sizes[size],
          className
        )}
        type={type}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedCTA.displayName = "AnimatedCTA";
