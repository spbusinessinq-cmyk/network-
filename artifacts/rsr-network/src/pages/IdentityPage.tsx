import React, { useState } from "react";
import { useStore, STANDING_DOCTRINE, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { IDCard } from "@/components/IDCard";
import { CheckSquare, Square, ShieldAlert, ShieldCheck } from "lucide-react";
import { StandingBadge } from "@/components/StandingBadge";

export default function IdentityPage() {
  const { currentUserId, users } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const [expanded, setExpanded] = useState(false);

  if (!currentUser) return null;

  const doctrine = STANDING_DOCTRINE[currentUser.standing];
  const credDoctrine = CREDENTIAL_DOCTRINE[currentUser.cardStyle];

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
            <ShieldAlert className="w-4 h-4 text-amber-500" />
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
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col gap-8">
      <div className="mb-4">
        <h1 className="text-2xl font-medium tracking-[0.1em] text-zinc-100 uppercase mb-2">Identity Hub</h1>
        <p className="text-sm text-zinc-500">Your digital credential and network standing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Section 1: Credential */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <IDCard 
            user={currentUser} 
            expanded={expanded} 
            onExpand={() => setExpanded(!expanded)} 
            size="lg"
          />
          <p className="text-center text-xs text-zinc-600 mt-4 tracking-widest uppercase">Click card to expand</p>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {/* Section 2: Standing & Advancement */}
          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-3">Standing & Advancement</h3>
            
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Current Standing</div>
                  <div className="flex items-center gap-3">
                    <StandingBadge standing={currentUser.standing} grade={currentUser.grade} className="text-sm px-3 py-1 h-auto" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Status</div>
                  <div className="text-sm text-zinc-300">{currentUser.promotionStatus}</div>
                </div>
              </div>
              <div className="text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-800 pl-4 py-1">
                {doctrine.description}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Advancement Checklist</div>
              {renderAdvancementChecklist()}
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between">
              <div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Review Status</div>
                <div className="text-xs text-zinc-300">{currentUser.reviewStatus}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Total Contributions</div>
                <div className="text-xs text-zinc-300">{currentUser.contributionCount}</div>
              </div>
            </div>
          </div>
          
          {/* Section 3: Credential Class Doctrine */}
          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-3">Credential Class: {credDoctrine.name}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {credDoctrine.description}
            </p>
          </div>
          
          {/* Section 4: Access Scope */}
          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
             <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-3">Access Scope</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Access Class</div>
                  <div className={`text-sm font-medium ${currentUser.accessClass === 'ELEVATED' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {currentUser.accessClass}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Network Provisions</div>
                  <div className="text-sm text-zinc-400">
                    {doctrine.access}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
