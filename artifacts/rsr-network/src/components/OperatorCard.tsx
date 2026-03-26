import React from "react";
import { User } from "@/lib/store";
import { StandingBadge } from "./StandingBadge";
import { PresenceDot } from "./PresenceDot";

interface OperatorCardProps {
  user: User;
  onClick?: () => void;
  compact?: boolean;
}

export function OperatorCard({ user, onClick, compact = false }: OperatorCardProps) {
  const isCommand = user.standing === "Command";
  const isOnline = user.presence.includes("ACTIVE") || user.presence === "Online";

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-2.5 px-2 py-2 cursor-pointer hover:bg-zinc-800/40 transition-colors group rounded-none"
      >
        <PresenceDot status={isOnline ? "online" : "away"} />
        <span className={`text-xs truncate flex-1 ${isCommand ? "text-amber-400" : "text-zinc-300 group-hover:text-zinc-100"}`}>
          {user.alias}
        </span>
        <StandingBadge standing={user.standing} grade={user.grade} className="shrink-0" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-3 border transition-colors flex items-start gap-3 group cursor-pointer ${
        isCommand
          ? "border-amber-900/25 bg-amber-950/8 hover:bg-amber-950/15"
          : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900/80 hover:border-sky-900/30"
      }`}
    >
      <div className="mt-1">
        <PresenceDot status={isOnline ? "online" : "away"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium truncate ${isCommand ? "text-amber-400" : "text-zinc-200 group-hover:text-sky-300"}`}>
            {user.alias}
          </span>
          <StandingBadge standing={user.standing} grade={user.grade} className="ml-2 shrink-0" />
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-[10px] uppercase text-zinc-600 tracking-wider">
            {user.accessClass} <span className="mx-1">·</span> {user.cardStyle.toUpperCase()}
          </div>
          <div className={`text-[9px] font-mono tracking-wider ${isCommand ? "text-amber-800" : "text-zinc-700"}`}>
            {user.id}
          </div>
        </div>
        <div className={`text-[10px] mt-2 truncate ${isCommand ? "text-amber-500/60" : "text-zinc-600"}`}>
          <span className="uppercase">{user.role}</span> <span className="mx-1 opacity-50">|</span> {user.presence}
        </div>
      </div>
    </div>
  );
}
