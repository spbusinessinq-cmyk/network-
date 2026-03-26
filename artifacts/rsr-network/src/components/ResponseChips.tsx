import React from "react";
import { cn } from "@/lib/utils";

interface ResponseChipsProps {
  options: string[];
  selected?: string[];
  onSelect?: (option: string) => void;
  className?: string;
}

export function ResponseChips({ options, selected = [], onSelect, className }: ResponseChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onSelect?.(opt)}
            className={cn(
              "text-[9px] uppercase tracking-wider px-2 py-1 rounded-none border transition-colors",
              isSelected 
                ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-200"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
