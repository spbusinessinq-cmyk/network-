import React from "react";
import { useParams, useLocation } from "wouter";
import { useStore, STANDING_DOCTRINE, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { IDCard } from "@/components/IDCard";
import { StandingBadge } from "@/components/StandingBadge";
import { PresenceDot } from "@/components/PresenceDot";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DossierPage() {
  const params = useParams<{ userId: string }>();
  const [, navigate] = useLocation();
  const { users, signals, cases, currentUserId } = useStore();

  const userId = params.userId;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full gap-4">
        <div className="text-zinc-600 text-xs uppercase tracking-widest font-mono">Operator not found</div>
        <button
          onClick={() => navigate("/operators")}
          className="text-xs text-sky-400 hover:text-sky-300 uppercase tracking-widest flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Roster
        </button>
      </div>
    );
  }

  const isCommand = user.standing === "Command";
  const isOnline = user.presence.includes("ACTIVE") || user.presence === "Online";
  const doctrine = STANDING_DOCTRINE[user.standing];
  const credDoctrine = CREDENTIAL_DOCTRINE[user.cardStyle];
  const userSignals = signals.filter(s => s.submittedBy === user.id);
  const leadCases = cases.filter(c => c.lead === user.id);
  const isSelf = user.id === currentUserId;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header Strip */}
      <div className={cn(
        "border-b border-zinc-800 px-8 py-6 bg-zinc-950/60",
        isCommand ? "border-t-2 border-t-amber-500/30" : "border-t-2 border-t-sky-500/20"
      )}>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/operators")}
            className="flex items-center gap-2 text-[10px] text-zinc-500 hover:text-sky-400 uppercase tracking-[0.2em] mb-5 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Personnel Roster
          </button>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <PresenceDot status={isOnline ? "online" : "away"} />
                <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-mono">
                  {isSelf ? "Your Dossier" : "Operator Dossier"}
                </span>
              </div>
              <h1 className={cn("text-3xl font-semibold tracking-[0.08em] uppercase mb-1", isCommand ? "text-amber-400" : "text-zinc-100")}>
                {user.alias}
              </h1>
              <div className="text-[10px] font-mono text-zinc-600 tracking-widest mb-3">{user.id}</div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StandingBadge standing={user.standing} grade={user.grade} />
                <span className="text-[9px] uppercase tracking-widest border border-zinc-800 bg-zinc-900/60 text-zinc-500 px-2 py-0.5">{user.cardStyle}</span>
                <span className="text-[9px] uppercase tracking-widest border border-zinc-800 bg-zinc-900/60 text-zinc-500 px-2 py-0.5">{user.accessClass} ACCESS</span>
              </div>
              {user.statusLine && (
                <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-sky-700/40 pl-3 max-w-lg">
                  {user.statusLine}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-12 gap-8">

          {/* Left: ID Card + Credential */}
          <div className="col-span-12 lg:col-span-5 space-y-5">
            <IDCard user={user} expanded={true} size="lg" />

            <div className="border border-zinc-800 bg-zinc-950/50 p-5 border-l-2 border-l-sky-700/40">
              <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-2 pb-2 border-b border-zinc-800">
                Credential Class: {credDoctrine.name}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{credDoctrine.description}</p>
            </div>
          </div>

          {/* Right: Info Panels */}
          <div className="col-span-12 lg:col-span-7 space-y-5">

            {/* Operational Record */}
            <div className="border border-zinc-800 bg-zinc-950/50 p-5">
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-300 font-semibold border-b border-zinc-800 pb-2 mb-5">Operational Record</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Role</div>
                  <div className="text-sm text-zinc-300 capitalize">{user.role}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Join Date</div>
                  <div className="text-sm text-zinc-300">{user.joinDate}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Review Status</div>
                  <div className="text-sm text-zinc-300">{user.reviewStatus}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Contributions</div>
                  <div className="text-sm text-zinc-300">{user.contributionCount}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Bio / Assignment</div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{user.bio || "—"}</div>
                </div>
              </div>
            </div>

            {/* Standing Doctrine */}
            <div className="border border-zinc-800 bg-zinc-950/50 p-5">
              <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-300 font-semibold border-b border-zinc-800 pb-2 mb-5">Standing Doctrine</h3>
              <div className="space-y-3">
                <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">{doctrine.description}</p>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <div>
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Trust Level</div>
                    <div className="text-xs text-zinc-400">{doctrine.trust}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Network Access</div>
                    <div className="text-xs text-zinc-400">{doctrine.access}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-zinc-950/50 p-4">
                <div className="flex justify-between items-baseline border-b border-zinc-800 pb-2 mb-3">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">Signals</div>
                  <span className="text-[10px] text-zinc-600 font-mono">{userSignals.length}</span>
                </div>
                {userSignals.length === 0 ? (
                  <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider">None filed</div>
                ) : (
                  <div className="space-y-2">
                    {userSignals.slice(0, 4).map(sig => (
                      <div key={sig.id} className="text-xs text-zinc-400 line-clamp-1 border-b border-zinc-800/30 pb-1 last:border-0 last:pb-0">{sig.title}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border border-zinc-800 bg-zinc-950/50 p-4">
                <div className="flex justify-between items-baseline border-b border-zinc-800 pb-2 mb-3">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">Cases Led</div>
                  <span className="text-[10px] text-zinc-600 font-mono">{leadCases.length}</span>
                </div>
                {leadCases.length === 0 ? (
                  <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider">None assigned</div>
                ) : (
                  <div className="space-y-2">
                    {leadCases.slice(0, 4).map(c => (
                      <div key={c.id} className="text-xs text-zinc-400 line-clamp-1 border-b border-zinc-800/30 pb-1 last:border-0 last:pb-0">{c.name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
