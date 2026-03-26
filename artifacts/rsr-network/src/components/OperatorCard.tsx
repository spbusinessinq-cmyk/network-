import React from "react";
import { User } from "@/lib/store";
import { StandingBadge } from "./StandingBadge";
import { PresenceDot } from "./PresenceDot";

interface OperatorCardProps {
  user: User;
  onClick?: () => void;
}

export function OperatorCard({ user, onClick }: OperatorCardProps) {
  const isCommand = user.standing === "Command";
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 border transition-colors flex items-start gap-3 group cursor-pointer ${
        isCommand 
          ? "border-amber-900/30 bg-amber-950/10 hover:bg-amber-900/20" 
          : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
      }`}
    >
      <div className="mt-1">
        <PresenceDot status={user.presence.includes("ACTIVE") || user.presence === "Online" ? "online" : "away"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium truncate ${isCommand ? "text-amber-500" : "text-zinc-200 group-hover:text-zinc-100"}`}>
            {user.alias}
          </span>
          <StandingBadge standing={user.standing} grade={user.grade} className="ml-2 shrink-0" />
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">
            {user.accessClass} <span className="mx-1">•</span> {user.cardStyle.toUpperCase()}
          </div>
          <div className={`text-[9px] font-mono tracking-wider ${isCommand ? "text-amber-700" : "text-zinc-600"}`}>
            {user.id}
          </div>
        </div>
        
        <div className={`text-[10px] mt-2 truncate ${isCommand ? "text-amber-400/70" : "text-zinc-500"}`}>
          <span className="uppercase">{user.role}</span> <span className="mx-1 opacity-50">|</span> {user.presence}
        </div>
      </div>
    </div>
  );
}
