import React, { useState } from "react";
import { motion } from "framer-motion";
import { User } from "@/lib/store";
import { StandingBadge } from "./StandingBadge";
import { cn } from "@/lib/utils";
import { Shield, RotateCcw } from "lucide-react";

interface IDCardProps {
  user: User;
  expanded: boolean;
  onExpand?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function IDCard({ user, expanded, onExpand, size = "md", className }: IDCardProps) {
  const [flipped, setFlipped] = useState(false);

  const getStyleClasses = () => {
    switch (user.cardStyle) {
      case "obsidian":
        return "bg-black border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]";
      case "steel":
        return "bg-[#0c0d0e] border-zinc-600/60 shadow-[0_0_20px_rgba(113,113,122,0.08)]";
      case "ice":
        return "bg-[#020810] border-cyan-800/40 shadow-[0_0_25px_rgba(6,182,212,0.08)]";
      case "graphite":
        return "bg-[#0e0e0f] border-zinc-700/50";
      case "gold":
        return "bg-[#0a0500] border-amber-800/50 shadow-[0_0_30px_rgba(245,158,11,0.10)]";
      default:
        return "bg-zinc-950 border-zinc-800/60";
    }
  };

  const getAccentClass = () => {
    switch (user.cardStyle) {
      case "obsidian": return "text-emerald-400";
      case "steel": return "text-zinc-300";
      case "ice": return "text-cyan-400";
      case "gold": return "text-amber-400";
      case "graphite": return "text-zinc-400";
      default: return "text-zinc-400";
    }
  };

  const getAccentBorder = () => {
    switch (user.cardStyle) {
      case "obsidian": return "border-emerald-800/30";
      case "steel": return "border-zinc-600/30";
      case "ice": return "border-cyan-800/30";
      case "gold": return "border-amber-800/30";
      default: return "border-zinc-700/30";
    }
  };

  const cardHeightClass = size === "sm" ? "h-40" : expanded ? "min-h-[260px]" : "h-64";
  const isCommand = user.standing === "Command";

  const frontFace = (
    <div className="flex flex-col h-full justify-between" style={{ backfaceVisibility: "hidden" }}>
      <div className="flex justify-between items-start">
        <div>
          <Shield className={cn("w-5 h-5 mb-3", getAccentClass())} />
          <div className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 mb-1">Operative</div>
          <div className={cn("text-xl font-bold tracking-wider uppercase", isCommand ? "text-amber-300" : "text-zinc-100")}>
            {user.alias}
          </div>
        </div>
        <StandingBadge standing={user.standing} grade={user.grade} />
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className={cn("py-4 space-y-4 border-y my-4 flex-1", getAccentBorder())}
        >
          {user.bio && (
            <div>
              <div className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 mb-1.5">Status</div>
              <div className="text-sm text-zinc-300 leading-relaxed">{user.bio}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 mb-1">Access Role</div>
              <div className="text-sm text-zinc-300">{user.role}</div>
            </div>
            <div>
              <div className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 mb-1">Join Date</div>
              <div className="text-sm text-zinc-300">{user.joinDate}</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-end mt-auto">
        <div>
          <div className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 mb-1">Identification</div>
          <div className="text-xs font-mono tracking-widest text-zinc-500">{user.id}</div>
        </div>
        <div className="text-right">
          <div className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 mb-1">Presence</div>
          <div className="text-xs text-zinc-400 flex items-center justify-end gap-1.5">
            {user.presence}
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", user.presence.includes("ACTIVE") ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
          </div>
        </div>
      </div>
    </div>
  );

  const backFace = (
    <div
      className="flex flex-col h-full justify-between absolute inset-0 p-5"
      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
    >
      <div>
        <div className={cn("text-[8px] uppercase tracking-[0.4em] mb-4 pb-3 border-b", getAccentClass(), getAccentBorder())}>
          RSR Network — Credential Reverse
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Credential Class</div>
            <div className={cn("text-xs font-medium uppercase tracking-wider", getAccentClass())}>{user.cardStyle}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Access Class</div>
            <div className="text-xs text-zinc-300 uppercase">{user.accessClass}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Standing</div>
            <div className="text-xs text-zinc-300 uppercase">{user.standing}{user.grade ? ` · ${user.grade}` : ""}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Role</div>
            <div className="text-xs text-zinc-300 capitalize">{user.role}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Issued</div>
            <div className="text-xs text-zinc-400 font-mono">{user.joinDate}</div>
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">Network</div>
            <div className="text-xs text-zinc-400 font-mono">RSR-CLASSIFIED</div>
          </div>
        </div>
        {user.bio && (
          <div className={cn("mt-5 pt-4 border-t", getAccentBorder())}>
            <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1.5">Assignment</div>
            <div className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{user.bio}</div>
          </div>
        )}
      </div>
      <div className={cn("text-[8px] font-mono tracking-widest text-zinc-700 border-t pt-3 mt-4", getAccentBorder())}>
        {user.id} · AUTHENTICATED · NETWORK PROVISION ACTIVE
      </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Card with perspective applied */}
      <div style={{ perspective: 1200 }} className={cn("relative w-full", cardHeightClass)}>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20, rotateX: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            rotateY: flipped ? 180 : 0,
          }}
          whileHover={onExpand && !flipped ? { scale: 1.012, rotateY: 3, rotateX: -3 } : {}}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          onClick={onExpand}
          className={cn(
            "relative w-full h-full cursor-pointer overflow-hidden border p-5",
            getStyleClasses(),
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_1px,transparent_1px)] bg-[size:18px_18px]" />
          {frontFace}
          {backFace}
        </motion.div>
      </div>

      {/* Flip control — separate row, never overlaps card content */}
      <div className="flex justify-end items-center pr-0.5">
        <button
          onClick={() => setFlipped(f => !f)}
          className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest text-zinc-700 hover:text-zinc-400 transition-colors px-3 py-1.5 border border-white/[0.04] hover:border-white/[0.10] bg-black/30"
          title={flipped ? "Show front" : "Show credential reverse"}
        >
          <RotateCcw className="w-2.5 h-2.5" />
          {flipped ? "Front" : "Flip"}
        </button>
      </div>
    </div>
  );
}
