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
      case "obsidian": return "bg-black border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.08)]";
      case "steel":    return "bg-[#0c0d0e] border-zinc-600/60 shadow-[0_0_20px_rgba(113,113,122,0.08)]";
      case "ice":      return "bg-[#020810] border-cyan-800/40 shadow-[0_0_25px_rgba(6,182,212,0.08)]";
      case "graphite": return "bg-[#0e0e0f] border-zinc-700/50";
      case "gold":     return "bg-[#0a0500] border-amber-800/50 shadow-[0_0_30px_rgba(245,158,11,0.10)]";
      default:         return "bg-zinc-950 border-zinc-800/60";
    }
  };

  const getAccentClass = () => {
    switch (user.cardStyle) {
      case "obsidian": return "text-emerald-400";
      case "steel":    return "text-zinc-300";
      case "ice":      return "text-cyan-400";
      case "gold":     return "text-amber-400";
      case "graphite": return "text-zinc-400";
      default:         return "text-zinc-400";
    }
  };

  const getAccentBorder = () => {
    switch (user.cardStyle) {
      case "obsidian": return "border-emerald-800/30";
      case "steel":    return "border-zinc-600/30";
      case "ice":      return "border-cyan-800/30";
      case "gold":     return "border-amber-800/30";
      default:         return "border-zinc-700/30";
    }
  };

  const cardHeightClass = size === "sm" ? "h-40" : expanded ? "min-h-[260px]" : "h-64";
  const isCommand = user.standing === "Command";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Perspective wrapper */}
      <div style={{ perspective: "1200px" }} className={cn("w-full", cardHeightClass)}>
        {/* Entrance animation wrapper — does NOT apply 3D transforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="w-full h-full"
        >
          {/* The flipping card — pure CSS */}
          <div
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              position: "relative",
              width: "100%",
              height: "100%",
              cursor: onExpand ? "pointer" : "default",
            }}
            onClick={onExpand}
          >
            {/* ── FRONT FACE ── */}
            <div
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                position: "absolute",
                inset: 0,
              }}
              className={cn("border p-5 overflow-hidden flex flex-col justify-between", getStyleClasses())}
            >
              <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_1px,transparent_1px)] bg-[size:18px_18px]" />

              {/* Top row */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <Shield className={cn("w-5 h-5 mb-3", getAccentClass())} />
                  <div className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 mb-1">Operative</div>
                  <div className={cn("text-xl font-bold tracking-wider uppercase", isCommand ? "text-amber-300" : "text-zinc-100")}>
                    {user.alias}
                  </div>
                </div>
                <StandingBadge standing={user.standing} grade={user.grade} />
              </div>

              {/* Expanded middle */}
              {expanded && (
                <div className={cn("z-10 py-4 space-y-4 border-y my-4 flex-1", getAccentBorder())}>
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
                </div>
              )}

              {/* Footer row */}
              <div className="flex justify-between items-end z-10 mt-auto">
                <div>
                  <div className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 mb-1">Identification</div>
                  <div className="text-xs font-mono tracking-widest text-zinc-500">{user.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 mb-1">Presence</div>
                  <div className="text-xs text-zinc-400 flex items-center justify-end gap-1.5">
                    {user.presence}
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                      user.presence.includes("ACTIVE") ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
                    )} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── BACK FACE ── */}
            <div
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                position: "absolute",
                inset: 0,
              }}
              className={cn("border p-5 overflow-hidden flex flex-col justify-between", getStyleClasses())}
            >
              <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_1px,transparent_1px)] bg-[size:18px_18px]" />

              <div className="z-10">
                <div className={cn("text-[8px] uppercase tracking-[0.4em] mb-4 pb-3 border-b", getAccentClass(), getAccentBorder())}>
                  RSR Network — Credential Reverse
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "Credential Class", value: user.cardStyle },
                    { label: "Access Class",     value: user.accessClass },
                    { label: "Standing",         value: `${user.standing}${user.grade ? ` · ${user.grade}` : ""}` },
                    { label: "Role",             value: user.role },
                    { label: "Issued",           value: user.joinDate },
                    { label: "Network",          value: "RSR-CLASSIFIED" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1">{label}</div>
                      <div className={cn("text-xs uppercase tracking-wide",
                        label === "Credential Class" ? getAccentClass() : "text-zinc-300"
                      )}>{value}</div>
                    </div>
                  ))}
                </div>
                {user.bio && (
                  <div className={cn("mt-5 pt-4 border-t", getAccentBorder())}>
                    <div className="text-[8px] uppercase tracking-widest text-zinc-600 mb-1.5">Assignment</div>
                    <div className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{user.bio}</div>
                  </div>
                )}
              </div>

              <div className={cn("z-10 text-[8px] font-mono tracking-widest text-zinc-700 border-t pt-3 mt-4", getAccentBorder())}>
                {user.id} · AUTHENTICATED · NETWORK PROVISION ACTIVE
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Flip control strip — always below the card, never overlapping */}
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
