import React, { useState } from "react";
import { useStore, Case } from "@/lib/store";
import { FolderOpen, MapPin, Tag, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CasesPage() {
  const { cases, signals, users } = useStore();
  const [activeCaseId, setActiveCaseId] = useState<number | null>(cases[0]?.id || null);

  const activeCase = cases.find(c => c.id === activeCaseId);
  
  const getStatusColor = (status: Case['status']) => {
    switch(status) {
      case "ACTIVE": return "text-emerald-400 border-emerald-900 bg-emerald-950/30";
      case "MONITORING": return "text-amber-400 border-amber-900 bg-amber-950/30";
      case "ESCALATED": return "text-red-400 border-red-900 bg-red-950/30";
      case "ARCHIVED": return "text-zinc-500 border-zinc-800 bg-zinc-900/50";
      default: return "text-zinc-300 border-zinc-700 bg-zinc-800";
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Case List */}
      <div className="w-full lg:w-80 border-r border-zinc-800 bg-zinc-950/40 flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-100 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-emerald-500" /> Active Dossiers
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {cases.map((c) => {
              const isActive = c.id === activeCaseId;
              const lead = users.find(u => u.id === c.lead);
              return (
                <div 
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`p-4 border cursor-pointer transition-colors ${
                    isActive 
                      ? "border-emerald-900/50 bg-emerald-950/10" 
                      : "border-zinc-800 bg-black hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-sm font-medium line-clamp-1 ${isActive ? "text-emerald-400" : "text-zinc-300"}`}>
                      {c.name}
                    </h3>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                    Lead: {lead?.alias || c.lead}
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className={`rounded-none text-[9px] px-1.5 py-0 ${getStatusColor(c.status)}`}>
                      {c.status}
                    </Badge>
                    <span className="text-[10px] text-zinc-600 font-mono">{c.linkedSignals.length} SIGS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Case Detail */}
      <div className="flex-1 bg-black/20 flex flex-col overflow-hidden">
        {activeCase ? (
          <>
            <div className="p-8 border-b border-zinc-800 bg-zinc-950/80">
               <div className="flex items-start justify-between mb-4">
                 <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                      DOSSIER #{activeCase.id.toString().padStart(4, '0')}
                      <span className="h-px w-8 bg-zinc-800 block" />
                      <Badge variant="outline" className={`rounded-none text-[9px] px-2 py-0 ${getStatusColor(activeCase.status)}`}>
                        {activeCase.status}
                      </Badge>
                    </div>
                    <h1 className="text-2xl text-zinc-100 font-medium tracking-wide">{activeCase.name}</h1>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Lead Investigator</div>
                    <div className="text-sm text-zinc-300">{users.find(u => u.id === activeCase.lead)?.alias}</div>
                 </div>
               </div>
               <p className="text-zinc-400 text-sm max-w-3xl leading-relaxed">{activeCase.summary}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
              
              <div className="flex-1 space-y-8">
                <section>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Linked Signals ({activeCase.linkedSignals.length})
                  </h3>
                  <div className="space-y-3">
                    {activeCase.linkedSignals.map(sigId => {
                      const sig = signals.find(s => s.id === sigId);
                      if (!sig) return null;
                      return (
                        <div key={sig.id} className="border border-zinc-800 bg-zinc-950/50 p-4">
                          <div className="text-sm text-zinc-200 mb-2">{sig.title}</div>
                          <div className="flex gap-4 text-[10px] uppercase text-zinc-500 tracking-widest">
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3"/> {sig.category}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {sig.location}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="w-full lg:w-80 space-y-8">
                <section>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
                    Case Notes
                  </h3>
                  <ul className="space-y-3">
                    {activeCase.notes.map((n, i) => (
                      <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1.5 w-1 h-1 bg-emerald-500 rounded-full shrink-0"/>
                        {n}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600 uppercase tracking-widest text-sm">
            Select a dossier
          </div>
        )}
      </div>
    </div>
  );
}
