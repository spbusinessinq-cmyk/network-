import React from "react";
import { Badge } from "@/components/ui/badge";

interface StandingBadgeProps {
  standing: string;
  grade?: string | null;
  className?: string;
}

export function StandingBadge({ standing, grade, className = "" }: StandingBadgeProps) {
  let colorClasses = "";
  
  switch (standing) {
    case "Observer":
      colorClasses = "border-zinc-800 bg-zinc-950 text-zinc-400";
      break;
    case "Scout":
      colorClasses = "border-slate-500/50 bg-slate-800/30 text-slate-300";
      break;
    case "Operator":
      colorClasses = "border-rose-900/50 bg-rose-950/30 text-rose-300";
      break;
    case "Analyst":
      colorClasses = "border-zinc-200/50 bg-zinc-100/10 text-zinc-100";
      break;
    case "Command":
      colorClasses = "border-amber-500/50 bg-amber-950/40 text-amber-400";
      break;
    default:
      colorClasses = "border-zinc-800 bg-zinc-900 text-zinc-400";
  }

  let displayText = standing;
  if (standing === "Command") {
    displayText = "COMMAND";
  } else if (grade) {
    displayText = `${standing} ${grade}`;
  }

  return (
    <Badge variant="outline" className={`rounded-none px-2 py-0 h-5 text-[10px] uppercase tracking-wider font-medium ${colorClasses} ${className}`}>
      {displayText}
    </Badge>
  );
}
