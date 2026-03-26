import React from "react";
import { useStore } from "@/lib/store";
import { IDCard } from "@/components/IDCard";

export default function ProfilePage() {
  const { currentUserId, users, signals, cases } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);

  if (!currentUser) return null;

  const userSignals = signals.filter(s => s.submittedBy === currentUser.id);
  const leadCases = cases.filter(c => c.lead === currentUser.id);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-[0.1em] text-zinc-100 uppercase mb-2">Operator Dossier</h1>
      </div>

      <IDCard user={currentUser} expanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-zinc-800 bg-zinc-950/50 p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
            Signal Contributions
          </h3>
          <div className="text-3xl font-light text-emerald-400 mb-4">{userSignals.length}</div>
          <div className="space-y-3">
            {userSignals.slice(0, 3).map(sig => (
              <div key={sig.id} className="text-sm text-zinc-300 truncate pb-2 border-b border-zinc-800/50 last:border-0">
                {sig.title}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950/50 p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
            Active Leadership
          </h3>
          <div className="text-3xl font-light text-amber-400 mb-4">{leadCases.length}</div>
          <div className="space-y-3">
            {leadCases.map(c => (
              <div key={c.id} className="text-sm text-zinc-300 truncate pb-2 border-b border-zinc-800/50 last:border-0">
                {c.name}
              </div>
            ))}
            {leadCases.length === 0 && <div className="text-zinc-600 italic text-sm">No cases currently leading.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
