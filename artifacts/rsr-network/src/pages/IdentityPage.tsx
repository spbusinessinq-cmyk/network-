import React, { useState } from "react";
import { useStore, STANDING_DOCTRINE, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { IDCard } from "@/components/IDCard";
import { CheckSquare, Square, ShieldAlert, ShieldCheck } from "lucide-react";
import { StandingBadge } from "@/components/StandingBadge";
import { PresenceDot } from "@/components/PresenceDot";
import { cn } from "@/lib/utils";

export default function IdentityPage() {
  const { currentUserId, users } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const [expanded, setExpanded] = useState(false);

  if (!currentUser) return null;

  const doctrine = STANDING_DOCTRINE[currentUser.standing];
  const credDoctrine = CREDENTIAL_DOCTRINE[currentUser.cardStyle];
  const isCommand = currentUser.standing === "Command";
  const isOnline = currentUser.presence.includes("ACTIVE") || currentUser.presence === "Online";

  const renderAdvancementChecklist = () => {
    if (currentUser.standing === "Command") {
      return (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-amber-500/80">
            <ShieldCheck className="w-4 h-4" />
            <span>Highest authority level established</span>
          </div>
        </div>
      );
    }

    if (currentUser.standing === "Analyst") {
      return (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verification authority active</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <ShieldAlert className="w-4 h-4 text-sky-500" />
            <span>Command review and assignment required for further progression</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 text-zinc-400">
          <CheckSquare className="w-4 h-4 text-emerald-500" />
          <span>Profile configuration completed</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          {currentUser.bio && currentUser.bio !== "Awaiting classification." ? (
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          ) : (
            <Square className="w-4 h-4 text-zinc-600" />
          )}
          <span>Status and bio configured</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          {currentUser.contributionCount >= 5 ? (
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          ) : (
            <Square className="w-4 h-4 text-zinc-600" />
          )}
          <span>Submit 5 verified signals ({Math.min(currentUser.contributionCount, 5)}/5)</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400">
          {currentUser.contributionCount > 0 ? (
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          ) : (
            <Square className="w-4 h-4 text-zinc-600" />
          )}
          <span>Network Room and case participation</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* HEADER STRIP */}
      <div className={cn(
        "border-b border-zinc-800 bg-zinc-950/70 px-8 py-5 shrink-0",
        isCommand ? "border-t-2 border-t-amber-500/30" : "border-t-2 border-t-sky-500/20"
      )}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <PresenceDot status={isOnline ? "online" : "away"} />
              <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-mono">Identity Hub</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className={cn("text-2xl font-semibold tracking-[0.08em] uppercase", isCommand ? "text-amber-400" : "text-zinc-100")}>
                {currentUser.alias}
              </h1>
              <span className="text-xs font-mono text-zinc-600 tracking-widest">{currentUser.id}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">{currentUser.statusLine || currentUser.bio || "No status set."}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StandingBadge standing={currentUser.standing} grade={currentUser.grade} className="text-[10px] px-3 py-1 h-auto" />
            <span className="text-[9px] uppercase tracking-widest border border-zinc-800 text-zinc-500 px-2 py-0.5 hidden sm:block">{currentUser.accessClass}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT — scrollable */}
      <div className="flex-1 overflow-y-auto rsr-scroll">
        <div className="p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-12 gap-8">

            {/* LEFT: ID Card + Credential Class */}
            <div className="col-span-12 lg:col-span-5 space-y-5">
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 mb-3">Credential Card</div>
                <IDCard
                  user={currentUser}
                  expanded={expanded}
                  onExpand={() => setExpanded(!expanded)}
                  size="lg"
                />
                <p className="text-center text-[9px] text-zinc-700 mt-2 tracking-widest uppercase">
                  {expanded ? "Click to collapse" : "Click to expand"}
                </p>
              </div>

              <div className="border border-zinc-800 bg-zinc-950/50 p-5 border-l-2 border-l-sky-700/40">
                <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-2 pb-2 border-b border-zinc-800">
                  Credential Class: {credDoctrine.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{credDoctrine.description}</p>
              </div>
            </div>

            {/* RIGHT: Status + Access + Advancement */}
            <div className="col-span-12 lg:col-span-7 space-y-5">

              {/* Standing Block */}
              <div className="border border-zinc-800 bg-zinc-950/50 p-6">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-800 pb-3 mb-5">Standing & Doctrine</h3>

                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2">Current Standing</div>
                      <StandingBadge standing={currentUser.standing} grade={currentUser.grade} className="text-[10px] px-3 py-1 h-auto" />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Promotion Status</div>
                      <div className="text-xs text-zinc-300">{currentUser.promotionStatus}</div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">
                    {doctrine.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/50">
                    <div>
                      <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Trust Level</div>
                      <div className="text-xs text-zinc-400">{doctrine.trust}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Review Status</div>
                      <div className="text-xs text-zinc-300">{currentUser.reviewStatus}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Scope */}
              <div className="border border-zinc-800 bg-zinc-950/50 p-6">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-800 pb-3 mb-5">Access Scope</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Access Class</div>
                    <div className={`text-sm font-medium ${isCommand ? "text-amber-400" : "text-sky-400"}`}>
                      {currentUser.accessClass}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Contributions</div>
                    <div className="text-sm text-zinc-300">{currentUser.contributionCount}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Network Provisions</div>
                    <div className="text-xs text-zinc-400 leading-relaxed">{doctrine.access}</div>
                  </div>
                </div>
              </div>

              {/* Advancement */}
              <div className="border border-zinc-800 bg-zinc-950/50 p-6">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-800 pb-3 mb-5">Advancement</h3>
                {renderAdvancementChecklist()}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
