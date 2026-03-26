import React from "react";
import { User } from "@/lib/store";
import { StandingBadge } from "./StandingBadge";
import { PresenceDot } from "./PresenceDot";

interface OperatorCardProps {
  user: User;
  onClick?: () => void;
}

export function OperatorCard({ user, onClick }: OperatorCardProps) {
  return (
    <div 
      onClick={onClick}
      className="p-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 cursor-pointer transition-colors flex items-start gap-3 group"
    >
      <div className="mt-1">
        <PresenceDot status={user.presence.includes("ACTIVE") || user.presence === "Online" ? "online" : "away"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 truncate">{user.alias}</span>
          <StandingBadge standing={user.standing} className="ml-2 shrink-0" />
        </div>
        <div className="text-xs text-zinc-500 font-mono tracking-wider">{user.id}</div>
        <div className="text-[10px] uppercase text-zinc-600 mt-2 truncate">{user.role} &bull; {user.presence}</div>
      </div>
    </div>
  );
}
