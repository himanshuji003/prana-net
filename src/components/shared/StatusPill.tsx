import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";

export type StatusLevel = "good" | "moderate" | "unhealthy" | "hazardous" | "info" | "success" | "warning";

interface StatusPillProps {
  label: string;
  level: StatusLevel;
  className?: string;
  icon?: React.ReactNode;
}

const levelStyles: Record<StatusLevel, { bg: string; border: string; text: string }> = {
  good: { bg: "bg-health-green/15", border: "border-health-green", text: "text-health-green" },
  success: { bg: "bg-health-green/15", border: "border-health-green", text: "text-health-green" },
  moderate: { bg: "bg-health-amber/15", border: "border-health-amber", text: "text-health-amber" },
  warning: { bg: "bg-health-amber/15", border: "border-health-amber", text: "text-health-amber" },
  unhealthy: { bg: "bg-health-red/15", border: "border-health-red", text: "text-health-red" },
  hazardous: { bg: "bg-health-darkred/15", border: "border-health-darkred", text: "text-health-darkred" },
  info: { bg: "bg-accent-teal/15", border: "border-accent-teal", text: "text-accent-teal" },
};

export const StatusPill: React.FC<StatusPillProps> = ({ label, level, className, icon }) => {
  const styles = levelStyles[level];

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-2 rounded-[50px] border px-3.5 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.15em]",
        styles.bg,
        styles.border,
        styles.text,
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </div>
  );
};

// Advanced Counter for AQI values that increments when in view
interface AQIPillProps {
  label: string;
  value: number;
  level: StatusLevel;
  className?: string;
  unit?: string;
}

export const AQIPill: React.FC<AQIPillProps> = ({ label, value, level, unit, className }) => {
  const styles = levelStyles[level];
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      if (start === end) return;
      const totalDuration = 1000;
      const incrementTime = (totalDuration / end) * 2;

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      return () => clearInterval(timer);
    }
  }, [value, isInView]);

  return (
    <div
      className={cn(
        "inline-flex flex-col items-start justify-center rounded-[50px] border px-6 py-3",
        styles.bg,
        styles.border,
        className
      )}
      ref={ref}
    >
      <div className={cn("font-data font-bold text-3xl", styles.text)}>
        {count}
        {unit && <span className="ml-1 text-sm font-normal">{unit}</span>}
      </div>
      <div className="mt-1 font-sans text-[13px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </div>
    </div>
  );
};
