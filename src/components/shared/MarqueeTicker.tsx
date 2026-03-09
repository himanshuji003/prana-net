import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface MarqueeTickerProps {
  items: string[];
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({
  items,
  className,
  speed = "normal",
}) => {
  const speedClass = {
    slow: "animate-[scrollLeft_45s_linear_infinite]",
    normal: "animate-[scrollLeft_30s_linear_infinite]",
    fast: "animate-[scrollLeft_15s_linear_infinite]",
  };

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden bg-forest-secondary py-3 border-y border-border-forest-light",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max space-x-8 items-center pl-8",
          speedClass[speed]
        )}
      >
        {/* Duplicate the items array a few times to ensure seamless infinite scroll */}
        {[...items, ...items, ...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-8 whitespace-nowrap"
          >
            <span className="font-data text-sm uppercase tracking-wider text-lime">
              {item}
            </span>
            <ArrowRight className="h-4 w-4 text-health-green" />
          </div>
        ))}
      </div>
    </div>
  );
};
