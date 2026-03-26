import React from "react";
import { useStore, STANDING_DOCTRINE, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { IDCard } from "@/components/IDCard";
import { StandingBadge } from "@/components/StandingBadge";

export default function ProfilePage() {
  const { currentUserId, users, signals, cases } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);

  if (!currentUser) return null;

  const userSignals = signals.filter(s => s.submittedBy === currentUser.id);
  const leadCases = cases.filter(c => c.lead === currentUser.id);
  
  const doctrine = STANDING_DOCTRINE[currentUser.standing];
  const credDoctrine = CREDENTIAL_DOCTRINE[currentUser.cardStyle];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-[0.1em] text-zinc-100 uppercase mb-2">Operator Dossier</h1>
      </div>

      <IDCard user={currentUser} expanded={true} />

      {/* Operator Summary Block */}
      <div className="border border-zinc-800 bg-zinc-950/80 p-6 border-l-4 border-l-emerald-500/50">
        <p className="text-zinc-300 text-sm leading-relaxed">
          <span className="text-emerald-400 font-mono">{currentUser.id}</span> ({currentUser.alias}) is a{" "}
          <strong className="text-zinc-200">{currentUser.standing} {currentUser.grade || ""}</strong> operator with{" "}
          <strong className="text-zinc-200">{credDoctrine.name}</strong> credentials, currently serving in{" "}
          <span className="italic text-zinc-400">{currentUser.role.toLowerCase()}</span> capacity.{" "}
          {currentUser.statusLine} Standing review is <span className="text-zinc-300">{currentUser.reviewStatus.toLowerCase()}</span>.
        </p>
      </div>

      {/* Structured Info Grid */}
      <div className="border border-zinc-800 bg-zinc-950/50 p-6">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-3">Operational Record</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Alias / Callsign</div>
            <div className="text-sm text-zinc-200">{currentUser.alias}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">RSR ID</div>
            <div className="text-sm text-zinc-400 font-mono tracking-wider">{currentUser.id}</div>
          </div>
          
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Standing & Grade</div>
            <div className="flex items-center mt-1">
              <StandingBadge standing={currentUser.standing} grade={currentUser.grade} />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Access Class</div>
            <div className="text-sm text-zinc-200">{currentUser.accessClass}</div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Status Line</div>
            <div className="text-sm text-zinc-300">{currentUser.statusLine}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Presence</div>
            <div className="text-sm text-zinc-300 flex items-center gap-2">
              {currentUser.presence}
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser.presence.includes("ACTIVE") || currentUser.presence === "Online" ? "bg-emerald-500" : "bg-zinc-500"}`} />
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Promotion Status</div>
            <div className="text-sm text-zinc-300">{currentUser.promotionStatus}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Review Status</div>
            <div className="text-sm text-zinc-300">{currentUser.reviewStatus}</div>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Bio / Assignment</div>
            <div className="text-sm text-zinc-400">{currentUser.bio}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-zinc-800 bg-zinc-950/50 p-6 flex flex-col">
          <div className="flex justify-between items-baseline border-b border-zinc-800 pb-2 mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recent Signals</h3>
            <span className="text-xs text-zinc-500">Count: {currentUser.contributionCount}</span>
          </div>
          
          <div className="space-y-4 flex-1">
            {userSignals.length > 0 ? (
              userSignals.slice(0, 5).map(sig => (
                <div key={sig.id} className="pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                  <div className="text-sm text-zinc-200 line-clamp-1">{sig.title}</div>
                  <div className="text-[10px] text-zinc-500 flex justify-between mt-1">
                    <span>{sig.category} • {sig.timestamp}</span>
                    <span className={sig.status === "VERIFIED" ? "text-emerald-500" : "text-amber-500"}>
                      {sig.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 italic">No signals submitted yet.</div>
            )}
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950/50 p-6 flex flex-col">
          <div className="flex justify-between items-baseline border-b border-zinc-800 pb-2 mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Case Involvement</h3>
            <span className="text-xs text-zinc-500">Leading: {leadCases.length}</span>
          </div>
          
          <div className="space-y-4 flex-1">
            {leadCases.length > 0 ? (
              leadCases.map(c => (
                <div key={c.id} className="pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                  <div className="text-sm text-zinc-200 line-clamp-1">{c.name}</div>
                  <div className="text-[10px] text-zinc-500 flex justify-between mt-1">
                    <span>{c.linkedSignals.length} Signals</span>
                    <span className={c.status === "ACTIVE" ? "text-emerald-500" : "text-amber-500"}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 italic">Not leading any active cases.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
