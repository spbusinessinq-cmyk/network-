import React from "react";
import { motion } from "framer-motion";
import { User } from "@/lib/store";
import { StandingBadge } from "./StandingBadge";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface IDCardProps {
  user: User;
  expanded: boolean;
  onExpand?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function IDCard({ user, expanded, onExpand, size = "md", className }: IDCardProps) {
  const getStyleClasses = () => {
    switch (user.cardStyle) {
      case "obsidian":
        return "bg-black border-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
      case "steel":
        return "bg-zinc-900 border-zinc-700 shadow-[0_0_15px_rgba(113,113,122,0.1)]";
      case "ice":
        return "bg-[#020810] border-cyan-900/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]";
      case "graphite":
        return "bg-[#111] border-zinc-800 shadow-none";
      case "gold":
        return "bg-[#0a0500] border-amber-900/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]";
      default:
        return "bg-zinc-950 border-zinc-800";
    }
  };

  const getAccentClass = () => {
    switch (user.cardStyle) {
      case "obsidian": return "text-emerald-500";
      case "steel": return "text-zinc-400";
      case "ice": return "text-cyan-500";
      case "gold": return "text-amber-500";
      case "graphite": return "text-zinc-500";
      default: return "text-zinc-500";
    }
  };

  const heightClass = size === "sm" ? "h-40" : expanded ? "h-[420px]" : "h-64";

  return (
    <motion.div
      layout
      onClick={onExpand}
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={onExpand ? { scale: 1.02, rotateY: 5, rotateX: -5 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative w-full cursor-pointer overflow-hidden border p-5 flex flex-col justify-between",
        getStyleClasses(),
        heightClass,
        className
      )}
      style={{ transformPerspective: 1000 }}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:16px_16px]" />
      
      {/* Top Section */}
      <div className="flex justify-between items-start z-10">
        <div>
          <Shield className={cn("w-6 h-6 mb-2", getAccentClass())} />
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Operative</div>
          <div className="text-xl font-bold tracking-wider text-zinc-100 uppercase">{user.alias}</div>
        </div>
        <StandingBadge standing={user.standing} />
      </div>

      {/* Middle Section (Expanded Only) */}
      {expanded && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="z-10 py-4 space-y-4 border-y border-zinc-800/50 my-4 flex-1"
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Status/Bio</div>
            <div className="text-sm text-zinc-300 leading-relaxed">{user.bio}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Access Role</div>
              <div className="text-sm text-zinc-300">{user.role}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Join Date</div>
              <div className="text-sm text-zinc-300">{user.joinDate}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Section */}
      <div className="flex justify-between items-end z-10 mt-auto">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Identification</div>
          <div className="text-sm font-mono tracking-widest text-zinc-400">{user.id}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Presence</div>
          <div className="text-xs text-zinc-300 flex items-center justify-end gap-2">
            {user.presence}
            <span className={cn("w-1.5 h-1.5 rounded-full", user.presence.includes("ACTIVE") ? "bg-emerald-500" : "bg-zinc-500")} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
