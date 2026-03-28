import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hoverEffect?: "glow" | "lift" | "none";
}

export const FloatingCard = React.forwardRef<HTMLDivElement, FloatingCardProps>(
  ({ className, children, hoverEffect = "glow", ...props }, ref) => {
    
    const hoverVariants = {
      glow: {
        y: -6,
        boxShadow: "0 16px 36px rgba(0,0,0,0.35)",
      },
      lift: {
        y: -8,
        boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
      },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverVariants[hoverEffect]}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "bg-forest-card border border-border-forest-light rounded p-10",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FloatingCard.displayName = "FloatingCard";
