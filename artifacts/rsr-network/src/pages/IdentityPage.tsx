import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { IDCard } from "@/components/IDCard";
import { CheckSquare } from "lucide-react";

export default function IdentityPage() {
  const { currentUserId, users } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const [expanded, setExpanded] = useState(false);

  if (!currentUser) return null;

  const tiers = ["Observer", "Scout", "Operator", "Analyst", "Command"];
  const currentTierIndex = tiers.indexOf(currentUser.standing);
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : "Max Rank";

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col gap-8">
      <div className="mb-4">
        <h1 className="text-2xl font-medium tracking-[0.1em] text-zinc-100 uppercase mb-2">Identity Hub</h1>
        <p className="text-sm text-zinc-500">Your digital credential and network standing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <IDCard 
            user={currentUser} 
            expanded={expanded} 
            onExpand={() => setExpanded(!expanded)} 
            size="lg"
          />
          <p className="text-center text-xs text-zinc-600 mt-4 tracking-widest uppercase">Click to expand details</p>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-6 border-b border-zinc-800 pb-3">Standing & Advancement</h3>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Current Tier</div>
                <div className="text-lg text-emerald-400">{currentUser.standing}</div>
              </div>
              <div className="h-px bg-zinc-800 flex-1 mx-6" />
              <div className="text-right">
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Next Tier</div>
                <div className="text-lg text-zinc-300">{nextTier}</div>
              </div>
            </div>

            {currentTierIndex < 4 && (
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Advancement Requirements</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <span>Basic orientation completed</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <div className="w-4 h-4 border border-zinc-700 rounded-sm shrink-0" />
                    <span>Submit 5 verified signals (2/5)</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <div className="w-4 h-4 border border-zinc-700 rounded-sm shrink-0" />
                    <span>Participate in an active case room</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
             <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-3">Active Provisions</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Network Read</div>
                  <div className="text-emerald-500 text-sm">AUTHORIZED</div>
                </div>
                <div className="p-3 bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Signal Write</div>
                  <div className="text-emerald-500 text-sm">AUTHORIZED</div>
                </div>
                <div className="p-3 bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Case Creation</div>
                  <div className="text-zinc-500 text-sm">RESTRICTED</div>
                </div>
                <div className="p-3 bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Command Control</div>
                  <div className="text-zinc-500 text-sm">RESTRICTED</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
