import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SignalDetailDrawer } from "@/components/SignalDetailDrawer";
import { Search, AlertTriangle } from "lucide-react";

export default function SignalsPage() {
  const { signals, addSignal, currentUserId } = useStore();
  const [selectedSignalId, setSelectedSignalId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Political",
    location: ""
  });

  const handleSubmit = () => {
    if (!form.title || !form.description || !currentUserId) return;
    addSignal({
      ...form,
      submittedBy: currentUserId,
      status: "UNVERIFIED",
      priority: false,
      caseId: null
    });
    setForm({ title: "", description: "", category: "Political", location: "" });
  };

  const filteredSignals = signals.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Intake Form */}
      <div className="w-full lg:w-[360px] border-r border-white/[0.04] bg-black/20 backdrop-blur-sm flex flex-col shrink-0">
        <div className="p-6 border-b border-white/[0.04]">
          <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-zinc-500 mb-1">Intake Node</h2>
          <p className="text-[11px] text-zinc-700">Structured signal submission</p>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto rsr-scroll">
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-zinc-700 mb-2">Signal Heading</label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-black/40 border-white/[0.06] text-zinc-300 rounded-none focus-visible:ring-0 h-9" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-zinc-700 mb-2">Detailed Observation</label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="bg-black/40 border-white/[0.06] text-zinc-300 rounded-none focus-visible:ring-0 min-h-[110px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-zinc-700 mb-2">Category</label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-black/40 border-white/[0.06] text-zinc-400 rounded-none h-9 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.07] text-zinc-300 rounded-none">
                  {["Political", "Economic", "Conflict", "Local", "Cyber", "Other"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-zinc-700 mb-2">Location Node</label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="bg-black/40 border-white/[0.06] text-zinc-300 rounded-none focus-visible:ring-0 h-9" />
            </div>
          </div>

          <Button onClick={handleSubmit} variant="ghost"
            className="w-full h-10 rounded-none border border-white/[0.07] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] tracking-widest uppercase text-[10px] mt-2">
            Commit Signal
          </Button>
        </div>
      </div>

      {/* Signal Feed */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/[0.04] bg-black/20 flex items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" />
            <Input placeholder="Search intake stream…" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-black/40 border-white/[0.06] text-zinc-300 rounded-none h-9 focus-visible:ring-0 placeholder:text-zinc-800" />
          </div>
          <div className="text-[9px] uppercase tracking-widest text-zinc-700 shrink-0">
            {filteredSignals.length} signals
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 rsr-scroll">
          <div className="space-y-2">
            {filteredSignals.map(signal => (
              <div
                key={signal.id}
                onClick={() => setSelectedSignalId(signal.id)}
                className="border border-white/[0.04] bg-black/15 hover:bg-white/[0.02] p-4 cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="text-zinc-400 text-sm group-hover:text-zinc-200 flex-1 leading-snug transition-colors">
                    {signal.title}
                  </h3>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge className="bg-transparent border-white/[0.05] text-zinc-700 rounded-none text-[9px] px-1.5">{signal.category}</Badge>
                    <Badge className={`rounded-none text-[9px] px-1.5 ${signal.status === 'VERIFIED' ? 'bg-emerald-950/20 text-emerald-700 border-emerald-900/30' : 'bg-transparent text-zinc-700 border-white/[0.05]'}`}>
                      {signal.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-700 line-clamp-2 mb-3 leading-relaxed">{signal.description}</p>
                <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-zinc-800">
                  <span>{signal.timestamp}</span>
                  <span>{signal.location}</span>
                  {signal.priority && (
                    <span className="text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Priority
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SignalDetailDrawer
        signalId={selectedSignalId}
        open={selectedSignalId !== null}
        onOpenChange={(open) => !open && setSelectedSignalId(null)}
      />
    </div>
  );
}
