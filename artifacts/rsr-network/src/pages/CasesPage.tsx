import React, { useState } from "react";
import { useStore, Case } from "@/lib/store";
import { MapPin, Tag, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function CasesPage() {
  const { cases, signals, users } = useStore();
  const [activeCaseId, setActiveCaseId] = useState<number | null>(cases[0]?.id || null);
  const activeCase = cases.find(c => c.id === activeCaseId);

  const getStatusColor = (status: Case["status"]) => {
    switch (status) {
      case "ACTIVE": return "text-emerald-700 border-emerald-900/30 bg-emerald-950/15";
      case "MONITORING": return "text-amber-700 border-amber-900/30 bg-amber-950/15";
      case "ESCALATED": return "text-red-700 border-red-900/30 bg-red-950/15";
      case "ARCHIVED": return "text-zinc-700 border-white/[0.05] bg-transparent";
      default: return "text-zinc-500 border-white/[0.05] bg-transparent";
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Case List */}
      <div className="w-full lg:w-72 border-r border-white/[0.04] bg-black/20 backdrop-blur-sm flex flex-col shrink-0">
        <div className="p-5 border-b border-white/[0.04]">
          <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-zinc-500">Active Dossiers</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-px">
            {cases.map((c) => {
              const isActive = c.id === activeCaseId;
              const lead = users.find(u => u.id === c.lead);
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={cn(
                    "p-4 border cursor-pointer transition-colors",
                    isActive
                      ? "border-white/[0.07] bg-white/[0.03]"
                      : "border-white/[0.03] bg-transparent hover:bg-white/[0.02] hover:border-white/[0.05]"
                  )}
                >
                  <h3 className={cn("text-xs font-medium line-clamp-1 mb-1.5", isActive ? "text-zinc-200" : "text-zinc-500")}>
                    {c.name}
                  </h3>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-700 mb-2.5">
                    Lead: {lead?.alias || c.lead}
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className={cn("rounded-none text-[8px] px-1.5 py-0", getStatusColor(c.status))}>
                      {c.status}
                    </Badge>
                    <span className="text-[9px] text-zinc-800 font-mono">{c.linkedSignals.length} sigs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Case Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeCase ? (
          <>
            <div className="px-8 py-6 border-b border-white/[0.04] bg-black/20 shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[9px] text-zinc-700 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    Dossier #{activeCase.id.toString().padStart(4, "0")}
                    <Badge variant="outline" className={cn("rounded-none text-[8px] px-1.5 py-0", getStatusColor(activeCase.status))}>
                      {activeCase.status}
                    </Badge>
                  </div>
                  <h1 className="text-xl text-zinc-200 font-medium tracking-wide">{activeCase.name}</h1>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-zinc-700 uppercase tracking-widest mb-1">Lead Investigator</div>
                  <div className="text-xs text-zinc-400">{users.find(u => u.id === activeCase.lead)?.alias}</div>
                </div>
              </div>
              <p className="text-xs text-zinc-600 max-w-3xl leading-relaxed">{activeCase.summary}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8 rsr-scroll">
              <div className="flex-1 space-y-6">
                <section>
                  <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 border-b border-white/[0.04] pb-2 mb-4 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Linked Signals ({activeCase.linkedSignals.length})
                  </h3>
                  <div className="space-y-2">
                    {activeCase.linkedSignals.map(sigId => {
                      const sig = signals.find(s => s.id === sigId);
                      if (!sig) return null;
                      return (
                        <div key={sig.id} className="border border-white/[0.04] bg-black/15 p-4">
                          <div className="text-xs text-zinc-400 mb-2">{sig.title}</div>
                          <div className="flex gap-4 text-[9px] uppercase text-zinc-700 tracking-widest">
                            <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> {sig.category}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {sig.location}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="w-full lg:w-72 space-y-6">
                <section>
                  <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 border-b border-white/[0.04] pb-2 mb-4">
                    Case Notes
                  </h3>
                  <ul className="space-y-3">
                    {activeCase.notes.map((n, i) => (
                      <li key={i} className="text-xs text-zinc-600 flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 bg-zinc-700 rounded-full shrink-0" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-800 uppercase tracking-widest text-xs">
            Select a dossier
          </div>
        )}
      </div>
    </div>
  );
}
