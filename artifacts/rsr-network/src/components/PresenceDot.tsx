import React from "react";

interface PresenceDotProps {
  status?: string;
  className?: string;
}

export function PresenceDot({ status = "online", className = "" }: PresenceDotProps) {
  let color = "bg-emerald-500";
  if (status === "away") color = "bg-zinc-500";
  if (status === "offline") color = "bg-zinc-700";

  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      {status === "online" && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}></span>
    </span>
  );
}
