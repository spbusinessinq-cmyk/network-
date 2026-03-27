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
          <div className="flex items-center gap-3 text-amber-600/80">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs text-zinc-500">Highest authority level established</span>
          </div>
        </div>
      );
    }
    if (currentUser.standing === "Analyst") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-zinc-500 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verification authority active</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-600 text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-700" />
            <span>Command review required for further progression</span>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {[
          { label: "Profile configuration completed", done: true },
          { label: "Status and bio configured", done: !!(currentUser.bio && currentUser.bio !== "Awaiting classification.") },
          { label: `Submit 5 verified signals (${Math.min(currentUser.contributionCount, 5)}/5)`, done: currentUser.contributionCount >= 5 },
          { label: "Network Room and case participation", done: currentUser.contributionCount > 0 },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-xs text-zinc-600">
            {item.done
              ? <CheckSquare className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              : <Square className="w-3.5 h-3.5 text-zinc-800 shrink-0" />}
            <span className={item.done ? "text-zinc-500" : "text-zinc-700"}>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Strip */}
      <div className={cn(
        "border-b px-8 py-5 shrink-0 bg-black/20 backdrop-blur-sm",
        isCommand ? "border-b-white/[0.04] border-t border-t-amber-600/20" : "border-b-white/[0.04]"
      )}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <PresenceDot status={isOnline ? "online" : "away"} />
              <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-700 font-mono">Identity Hub</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className={cn("text-xl font-medium tracking-[0.1em] uppercase", isCommand ? "text-amber-400" : "text-zinc-200")}>
                {currentUser.alias}
              </h1>
              <span className="text-[10px] font-mono text-zinc-700 tracking-widest">{currentUser.id}</span>
            </div>
            <p className="text-[11px] text-zinc-600 mt-1">{currentUser.statusLine || currentUser.bio || "No status set."}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StandingBadge standing={currentUser.standing} grade={currentUser.grade} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto rsr-scroll">
        <div className="p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-12 gap-8">

            {/* Left: ID Card + Credential */}
            <div className="col-span-12 lg:col-span-5 space-y-5">
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-700 mb-3">Credential Card</div>
                <IDCard user={currentUser} expanded={expanded} onExpand={() => setExpanded(!expanded)} size="lg" />
                <p className="text-center text-[9px] text-zinc-800 mt-2 tracking-widest uppercase">
                  {expanded ? "Click to collapse" : "Click to expand"}
                </p>
              </div>

              <div className="border border-white/[0.05] bg-black/20 p-5">
                <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-700 mb-2 pb-2 border-b border-white/[0.04]">
                  Credential Class: {credDoctrine.name}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{credDoctrine.description}</p>
              </div>
            </div>

            {/* Right: Standing + Access + Advancement */}
            <div className="col-span-12 lg:col-span-7 space-y-4">

              <div className="border border-white/[0.05] bg-black/20 p-6">
                <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 border-b border-white/[0.04] pb-2.5 mb-5">Standing & Doctrine</h3>
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">Current Standing</div>
                      <StandingBadge standing={currentUser.standing} grade={currentUser.grade} />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-1">Promotion Status</div>
                      <div className="text-xs text-zinc-500">{currentUser.promotionStatus}</div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{doctrine.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
                    <div>
                      <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-1">Trust Level</div>
                      <div className="text-xs text-zinc-500">{doctrine.trust}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-1">Review Status</div>
                      <div className="text-xs text-zinc-400">{currentUser.reviewStatus}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-white/[0.05] bg-black/20 p-6">
                <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 border-b border-white/[0.04] pb-2.5 mb-5">Access Scope</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-1">Access Class</div>
                    <div className={cn("text-sm font-medium", isCommand ? "text-amber-500" : "text-zinc-300")}>
                      {currentUser.accessClass}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-1">Contributions</div>
                    <div className="text-sm text-zinc-300">{currentUser.contributionCount}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-1">Network Provisions</div>
                    <div className="text-xs text-zinc-600 leading-relaxed">{doctrine.access}</div>
                  </div>
                </div>
              </div>

              <div className="border border-white/[0.05] bg-black/20 p-6">
                <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 border-b border-white/[0.04] pb-2.5 mb-5">Advancement</h3>
                {renderAdvancementChecklist()}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
