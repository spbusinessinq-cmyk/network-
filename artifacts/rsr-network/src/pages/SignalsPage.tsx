import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SignalDetailDrawer } from "@/components/SignalDetailDrawer";
import { Radar, Search, AlertTriangle } from "lucide-react";

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
      {/* Submission Form */}
      <div className="w-full lg:w-[400px] border-r border-zinc-800 bg-zinc-950/40 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-100 flex items-center gap-2 mb-2">
            <Radar className="w-4 h-4 text-emerald-500" /> Intake Node
          </h2>
          <p className="text-xs text-zinc-500">Structured signal submission</p>
        </div>
        
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Signal Heading</label>
            <Input 
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Detailed Observation</label>
            <Textarea 
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none min-h-[120px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Category</label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 rounded-none">
                  {["Political", "Economic", "Conflict", "Local", "Cyber", "Other"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Location Node</label>
              <Input 
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
                className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full h-12 rounded-none border border-emerald-900/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 tracking-widest uppercase mt-4"
          >
            Commit Signal
          </Button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 flex flex-col bg-black/20">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <Input 
                placeholder="Search intake stream..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 rounded-none h-10 w-full"
              />
            </div>
          </div>
          <div className="text-xs uppercase tracking-widest text-zinc-500 ml-4">
            Total Intake: {filteredSignals.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredSignals.map(signal => (
              <div 
                key={signal.id}
                onClick={() => setSelectedSignalId(signal.id)}
                className="border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 p-4 cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="text-zinc-200 font-medium group-hover:text-zinc-100 flex-1 leading-snug">
                    {signal.title}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <Badge className="bg-zinc-900 border-zinc-800 text-zinc-400 rounded-none">{signal.category}</Badge>
                    <Badge className={`rounded-none ${signal.status === 'VERIFIED' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                      {signal.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
                  {signal.description}
                </p>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-600">
                  <span>{signal.timestamp}</span>
                  <span>{signal.location}</span>
                  {signal.priority && (
                    <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> PRIORITY</span>
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
