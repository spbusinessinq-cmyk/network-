import React, { useState } from "react";
import { useStore, Case, Signal, Standing } from "@/lib/store";
import { Shield, AlertTriangle, CheckCircle2, Archive, Plus, Flag, X, Trash2, UserCheck, UserX } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StandingBadge } from "@/components/StandingBadge";

export default function CommandPage() {
  const { currentUserId, users, signals, cases, updateSignal, updateUser, addCase, updateCase, deleteCase, deleteSignal, networkMessages, deleteNetworkMessage, updateUserOnServer, removeUserFromNetwork } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  
  const [activeTab, setActiveTab] = useState("signals");

  // --- SIGNALS STATE ---
  const [signalFilter, setSignalFilter] = useState<"ALL" | "UNVERIFIED" | "VERIFIED" | "ARCHIVED">("ALL");
  const filteredSignals = signals.filter(s => signalFilter === "ALL" || s.status === signalFilter);

  // --- CASES STATE ---
  const [viewState, setViewState] = useState<"LIST" | "EDIT">("LIST");
  const [editingCaseId, setEditingCaseId] = useState<number | "NEW" | null>(null);
  const [caseForm, setCaseForm] = useState<Partial<Case>>({});
  const [noteInput, setNoteInput] = useState("");
  const [caseSignalsState, setCaseSignalsState] = useState<number[]>([]);
  const [isSavingCase, setIsSavingCase] = useState(false);

  // --- CONFIRM DELETE STATE ---
  const [confirmDelete, setConfirmDelete] = useState<{ type: "case" | "signal" | "message"; id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      if (confirmDelete.type === "case") {
        await deleteCase(confirmDelete.id);
        showToast("Case record removed.");
      } else if (confirmDelete.type === "message") {
        await deleteNetworkMessage(confirmDelete.id);
        showToast("Transmission removed.");
      } else {
        await deleteSignal(confirmDelete.id);
        showToast("Signal removed.");
      }
      setConfirmDelete(null);
    } catch {
      showToast("Delete failed. Try again.", "err");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- PERSONNEL STATE ---
  // Managed inline

  if (currentUser?.standing !== "Command") {
    return (
      <div className="h-full flex items-center justify-center text-red-500 tracking-widest uppercase bg-red-950/10 p-8">
        <div className="border border-red-900 bg-red-950/30 p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">ACCESS DENIED</h2>
          <p className="text-xs text-red-400">Command clearance required for this sector.</p>
        </div>
      </div>
    );
  }

  const unverifiedCount = signals.filter(s => s.status === "UNVERIFIED").length;
  const priorityCount = signals.filter(s => s.priority).length;

  const handleEditCase = (c: Case | null) => {
    if (c) {
      setEditingCaseId(c.id);
      setCaseForm({
        name: c.name,
        summary: c.summary,
        status: c.status,
        lead: c.lead,
        notes: c.notes || [],
      });
      setCaseSignalsState(c.linkedSignals || []);
    } else {
      setEditingCaseId("NEW");
      setCaseForm({
        name: "",
        summary: "",
        status: "OPEN",
        lead: currentUser.id,
        notes: [],
      });
      setCaseSignalsState([]);
    }
    setViewState("EDIT");
  };

  const handleSaveCase = async () => {
    if (!caseForm.name || !caseForm.lead) return;
    setIsSavingCase(true);
    try {
      if (editingCaseId === "NEW") {
        await addCase({
          name: caseForm.name,
          summary: caseForm.summary || "",
          status: caseForm.status as any,
          lead: caseForm.lead,
          notes: caseForm.notes || [],
          linkedSignals: caseSignalsState,
        });
        // We cannot reliably update signals here without the newly created case ID unless we fetch it.
        // For now, new cases won't link signals instantly via API in this pass, or we just rely on store doing it.
      } else if (editingCaseId) {
        await updateCase(editingCaseId as number, {
          name: caseForm.name,
          summary: caseForm.summary,
          status: caseForm.status as any,
          lead: caseForm.lead,
          notes: caseForm.notes,
        });
        
        // Update signals case ID if needed
        for (const sigId of caseSignalsState) {
          const sig = signals.find(s => s.id === sigId);
          if (sig && sig.caseId !== editingCaseId) {
            await updateSignal(sigId, { caseId: editingCaseId as number });
          }
        }
      }
      setViewState("LIST");
      setEditingCaseId(null);
      showToast(editingCaseId === "NEW" ? "Case initialized." : "Case record updated.");
    } catch (e) {
      console.error(e);
      showToast("Save failed. Try again.", "err");
    } finally {
      setIsSavingCase(false);
    }
  };

  const toggleSignalLink = (sigId: number) => {
    setCaseSignalsState(prev => 
      prev.includes(sigId) ? prev.filter(id => id !== sigId) : [...prev, sigId]
    );
  };

  const getUserAlias = (id: string) => users.find(u => u.id === id)?.alias || "UNKNOWN";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "text-emerald-400 bg-emerald-950/30 border-emerald-900/50";
      case "UNVERIFIED": return "text-sky-400 bg-sky-950/30 border-sky-900/50";
      case "ARCHIVED": return "text-zinc-400 bg-zinc-900/50 border-zinc-800";
      default: return "text-zinc-400 bg-zinc-900/50 border-zinc-800";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full relative border-t-2 border-sky-500/25">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 border text-xs uppercase tracking-widest font-mono transition-all ${
          toast.kind === "ok" 
            ? "bg-emerald-950/90 border-emerald-800 text-emerald-400" 
            : "bg-red-950/90 border-red-800 text-red-400"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="border border-red-900/60 bg-zinc-950 p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-400">Confirm Removal</h3>
            </div>
            <p className="text-sm text-zinc-300 mb-2">
              You are about to permanently remove:
            </p>
            <div className="bg-black/50 border border-zinc-800 p-3 mb-6 font-mono text-xs text-zinc-300 uppercase tracking-wider">
              {confirmDelete.type === "case" ? "CASE" : confirmDelete.type === "signal" ? "SIGNAL" : "TRANSMISSION"}: {confirmDelete.name}
            </div>
            <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">
              This action cannot be undone. All associated data will be removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                className="rounded-none text-zinc-400 hover:text-zinc-200 uppercase tracking-widest text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-900/60 text-red-300 border border-red-800 hover:bg-red-800/60 rounded-none uppercase tracking-widest text-xs px-6"
              >
                {isDeleting ? "Removing..." : "Confirm Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-medium tracking-[0.1em] text-amber-500 uppercase mb-2 flex items-center gap-3">
          <Shield className="w-6 h-6" /> NETWORK COMMAND CONSOLE
        </h1>
        <p className="text-sm text-zinc-400 font-mono">AUTHORITY LEVEL UNRESTRICTED. OVERSIGHT ACTIVE.</p>
        <div className="flex gap-2 mt-3">
          <span className="text-[9px] uppercase tracking-widest border border-amber-900/60 bg-amber-950/30 text-amber-400 px-2 py-0.5">
            [{unverifiedCount} PENDING]
          </span>
          <span className="text-[9px] uppercase tracking-widest border border-red-900/60 bg-red-950/30 text-red-400 px-2 py-0.5">
            [{cases.filter(c => c.status === "ESCALATED").length} ESCALATED]
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-zinc-800 rounded-none w-full justify-start h-auto p-0 mb-8 gap-6 overflow-x-auto flex-nowrap hide-scrollbar">
          <TabsTrigger value="signals" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs whitespace-nowrap">
            Signals {unverifiedCount > 0 && <Badge className="ml-2 bg-sky-950 text-sky-400 border-sky-900 rounded-none">{unverifiedCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="cases" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs whitespace-nowrap">
            Cases
          </TabsTrigger>
          <TabsTrigger value="personnel" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs whitespace-nowrap">
            Personnel
          </TabsTrigger>
          <TabsTrigger value="messages" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs whitespace-nowrap">
            Messages {networkMessages.length > 0 && <Badge className="ml-2 bg-zinc-900 text-zinc-400 border-zinc-800 rounded-none">{networkMessages.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="priority" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs whitespace-nowrap">
            Priority Board {priorityCount > 0 && <Badge className="ml-2 bg-red-950 text-red-500 border-red-900 rounded-none">{priorityCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="intake" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-500 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs whitespace-nowrap">
            Intake {users.filter(u => u.standing === "Observer").length > 0 && <Badge className="ml-2 bg-amber-950/50 text-amber-500 border-amber-900/50 rounded-none">{users.filter(u => u.standing === "Observer").length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* --- SIGNALS TAB --- */}
        <TabsContent value="signals" className="space-y-4">
          <div className="flex gap-2 mb-6">
            {["ALL", "UNVERIFIED", "VERIFIED", "ARCHIVED"].map(filter => (
              <button
                key={filter}
                onClick={() => setSignalFilter(filter as any)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                  signalFilter === filter 
                    ? "border-sky-500/50 bg-sky-950/20 text-sky-400" 
                    : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredSignals.length === 0 && <div className="p-8 border border-zinc-800 bg-zinc-900/20 text-center text-zinc-500 text-xs uppercase tracking-widest">No signals match filter.</div>}
            
            {filteredSignals.map(sig => (
              <div key={sig.id} className="border border-zinc-800 bg-zinc-950/60 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-zinc-900/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border ${getStatusColor(sig.status)}`}>
                      {sig.status}
                    </span>
                    {sig.priority && (
                      <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-red-900/50 bg-red-950/30 text-red-400 flex items-center gap-1">
                        <Flag className="w-2.5 h-2.5" /> PRIORITY
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-200 font-medium truncate mb-1">{sig.title}</div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase">
                    <span>{sig.category}</span>
                    <span>•</span>
                    <span>{sig.location}</span>
                    <span>•</span>
                    <span>By: {getUserAlias(sig.submittedBy)}</span>
                    <span>•</span>
                    <span>{sig.timestamp}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 shrink-0">
                  {sig.status !== "VERIFIED" && (
                    <Button 
                      onClick={() => updateSignal(sig.id, { status: "VERIFIED" })}
                      className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/50 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1.5" /> Verify
                    </Button>
                  )}
                  {sig.status !== "ARCHIVED" && (
                    <Button 
                      onClick={() => updateSignal(sig.id, { status: "ARCHIVED" })}
                      className="bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider"
                    >
                      <Archive className="w-3 h-3 mr-1.5" /> Archive
                    </Button>
                  )}
                  <Button 
                    onClick={() => updateSignal(sig.id, { priority: !sig.priority })}
                    className={`border rounded-none text-[10px] h-8 px-3 uppercase tracking-wider ${
                      sig.priority 
                        ? "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800" 
                        : "bg-red-950/20 text-red-400 border-red-900/30 hover:bg-red-900/40"
                    }`}
                  >
                    <Flag className="w-3 h-3 mr-1.5" />
                    {sig.priority ? "Drop Priority" : "Flag Priority"}
                  </Button>
                  <Button 
                    onClick={() => setConfirmDelete({ type: "signal", id: sig.id, name: sig.title })}
                    className="bg-zinc-900/50 text-red-400 border border-red-900/40 hover:bg-red-950/40 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider"
                    title="Remove signal"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* --- CASES TAB --- */}
        <TabsContent value="cases" className="space-y-4">
          {viewState === "LIST" ? (
            <>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold border-b border-zinc-800/50 pb-2 mb-4">Case Control</h3>
                <Button 
                  onClick={() => handleEditCase(null)}
                  className="bg-sky-950/20 text-sky-400 border border-sky-900/50 hover:bg-sky-900/30 rounded-none text-[10px] h-8 uppercase tracking-widest"
                >
                  <Plus className="w-3 h-3 mr-1.5" /> New Case
                </Button>
              </div>
              
              <div className="space-y-2">
                {cases.length === 0 && <div className="p-8 border border-zinc-800 bg-zinc-900/20 text-center text-zinc-500 text-xs uppercase tracking-widest">No active cases.</div>}
                
                {cases.map(c => (
                  <div key={c.id} className="border border-zinc-800 bg-zinc-950/60 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-zinc-900/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-zinc-700 bg-zinc-800/50 text-zinc-300">
                          {c.status}
                        </span>
                        <span className="text-sm text-zinc-200 font-medium truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase">
                        <span>Lead: {getUserAlias(c.lead)}</span>
                        <span>•</span>
                        <span>Signals: {c.linkedSignals.length}</span>
                        <span>•</span>
                        <span>Notes: {c.notes.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        onClick={() => handleEditCase(c)}
                        className="bg-zinc-900/50 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 rounded-none text-[10px] h-8 px-4 uppercase tracking-wider"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={() => setConfirmDelete({ type: "case", id: c.id, name: c.name })}
                        className="bg-zinc-900/50 text-red-400 border border-red-900/40 hover:bg-red-950/40 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                <h3 className="text-sm text-sky-400 uppercase tracking-widest font-medium">
                  {editingCaseId === "NEW" ? "Initialize New Case" : "Modify Case Details"}
                </h3>
                <button onClick={() => setViewState("LIST")} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Case Title</label>
                    <Input 
                      value={caseForm.name || ""} 
                      onChange={e => setCaseForm({...caseForm, name: e.target.value})}
                      className="bg-black/50 border-zinc-800 rounded-none font-medium h-10"
                      placeholder="Operation designation..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Lead Operator</label>
                    <select 
                      value={caseForm.lead || ""}
                      onChange={e => setCaseForm({...caseForm, lead: e.target.value})}
                      className="w-full bg-black/50 border border-zinc-800 rounded-none text-sm p-2 h-10 text-zinc-200 outline-none focus:border-sky-500/50"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.alias} ({u.standing})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Status</label>
                    <select 
                      value={caseForm.status || "OPEN"}
                      onChange={e => setCaseForm({...caseForm, status: e.target.value as any})}
                      className="w-full bg-black/50 border border-zinc-800 rounded-none text-sm p-2 h-10 text-zinc-200 outline-none focus:border-sky-500/50"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MONITORING">MONITORING</option>
                      <option value="ESCALATED">ESCALATED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Summary / Objective</label>
                  <Textarea 
                    value={caseForm.summary || ""} 
                    onChange={e => setCaseForm({...caseForm, summary: e.target.value})}
                    className="bg-black/50 border-zinc-800 rounded-none resize-none min-h-[100px]"
                    placeholder="Case context and goals..."
                  />
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Case Notes</label>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      value={noteInput} 
                      onChange={e => setNoteInput(e.target.value)}
                      className="bg-black/50 border-zinc-800 rounded-none h-9 text-sm"
                      placeholder="Add observation..."
                      onKeyDown={e => {
                        if (e.key === 'Enter' && noteInput.trim()) {
                          e.preventDefault();
                          setCaseForm({ ...caseForm, notes: [...(caseForm.notes || []), noteInput.trim()] });
                          setNoteInput("");
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        if (noteInput.trim()) {
                          setCaseForm({ ...caseForm, notes: [...(caseForm.notes || []), noteInput.trim()] });
                          setNoteInput("");
                        }
                      }}
                      className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 rounded-none h-9 px-4"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {caseForm.notes?.map((n, i) => (
                      <div key={i} className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
                        <span>{n}</span>
                        <button 
                          onClick={() => setCaseForm({ ...caseForm, notes: caseForm.notes?.filter((_, idx) => idx !== i) })}
                          className="text-zinc-500 hover:text-red-400 ml-2"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {(!caseForm.notes || caseForm.notes.length === 0) && <span className="text-xs text-zinc-600 font-mono">No notes recorded.</span>}
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Link Signals</label>
                  <div className="max-h-64 overflow-y-auto border border-zinc-800 bg-black/30 p-2 space-y-1">
                    {signals.map(sig => (
                      <label key={sig.id} className={`flex items-start gap-3 p-2 cursor-pointer hover:bg-zinc-900/50 transition-colors ${caseSignalsState.includes(sig.id) ? 'bg-sky-950/10' : ''}`}>
                        <input 
                          type="checkbox" 
                          className="mt-1 accent-sky-500 bg-zinc-900 border-zinc-700"
                          checked={caseSignalsState.includes(sig.id)}
                          onChange={() => toggleSignalLink(sig.id)}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-zinc-300 truncate">{sig.title}</span>
                          <span className="text-[10px] text-zinc-500 font-mono uppercase">{sig.category} • By: {getUserAlias(sig.submittedBy)}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setViewState("LIST")}
                    className="rounded-none text-zinc-400 hover:text-zinc-200 uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveCase}
                    disabled={isSavingCase || !caseForm.name || !caseForm.lead}
                    className="bg-amber-600 text-black border border-amber-400/60 hover:bg-amber-500 rounded-none uppercase tracking-widest font-bold px-8"
                  >
                    {isSavingCase ? "Saving..." : "Save Case Record"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* --- PERSONNEL TAB --- */}
        <TabsContent value="personnel" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                <div key={u.id} className="border border-zinc-800 bg-zinc-950/60 p-5 flex flex-col justify-between h-full hover:border-zinc-700 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-zinc-200 font-medium text-lg uppercase tracking-wider">{u.alias}</div>
                        <div className="text-[10px] text-zinc-500 font-mono tracking-widest">{u.id}</div>
                      </div>
                      <StandingBadge standing={u.standing} grade={u.grade} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-widest mb-4">
                      <div className="bg-black/40 border border-zinc-800/50 p-2">
                        <span className="text-zinc-600 block mb-1">Class</span>
                        <span className="text-zinc-300">{u.cardStyle}</span>
                      </div>
                      <div className="bg-black/40 border border-zinc-800/50 p-2">
                        <span className="text-zinc-600 block mb-1">Access</span>
                        <span className="text-zinc-300">{u.accessClass}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-zinc-800 pt-4 mt-auto">
                    {u.standing === "Command" ? (
                      <div className="text-[10px] text-amber-500 font-mono text-center tracking-widest bg-amber-950/20 py-2 border border-amber-900/30">
                        FOUNDER ACCOUNT — PROTECTED
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1">Update Standing</label>
                          <div className="flex gap-2">
                            <select 
                              value={u.standing}
                              onChange={(e) => updateUser(u.id, { standing: e.target.value as Standing })}
                              className="flex-1 bg-black/50 border border-zinc-800 text-[10px] uppercase tracking-widest p-1.5 text-zinc-300 outline-none focus:border-sky-500/50"
                            >
                              <option value="Observer">Observer</option>
                              <option value="Scout">Scout</option>
                              <option value="Operator">Operator</option>
                              <option value="Analyst">Analyst</option>
                              <option value="Command">Command</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1">Presence Override</label>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => updateUser(u.id, { presence: "ACTIVE" })}
                              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[9px] uppercase tracking-widest py-1.5 text-emerald-400 border border-zinc-800 transition-colors"
                            >
                              Active
                            </button>
                            <button 
                              onClick={() => updateUser(u.id, { presence: "OFFLINE" })}
                              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[9px] uppercase tracking-widest py-1.5 text-zinc-400 border border-zinc-800 transition-colors"
                            >
                              Offline
                            </button>
                            <button 
                              onClick={() => updateUser(u.id, { presence: "IN CASE ROOM" })}
                              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-[9px] uppercase tracking-widest py-1.5 text-sky-400 border border-zinc-800 transition-colors"
                            >
                              Room
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </TabsContent>

        {/* --- MESSAGES TAB --- */}
        <TabsContent value="messages" className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold border-b border-zinc-800/50 pb-2 mb-4">
            NETWORK COMMUNICATIONS OVERSIGHT
          </h3>
          <p className="text-xs text-zinc-500 mb-6">
            Command review authority — all operator transmissions.
          </p>
          <div className="space-y-2">
            {[...networkMessages].reverse().map(msg => (
              <div key={msg.id} className="border border-zinc-800 bg-zinc-950/60 p-4 flex justify-between items-start gap-4 hover:bg-zinc-900/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-zinc-200 font-medium text-sm">{getUserAlias(msg.userId)}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{msg.userId}</span>
                  </div>
                  <div className="text-sm text-zinc-300">{msg.text}</div>
                  {msg.responses && msg.responses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.responses.map((r, i) => (
                        <span key={i} className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 uppercase tracking-wider">
                          RE: {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="text-[10px] text-zinc-600 font-mono">{msg.timestamp}</span>
                  <button
                    onClick={() => setConfirmDelete({ type: 'message', id: msg.id, name: msg.text.slice(0,50) })}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {networkMessages.length === 0 && (
              <div className="text-xs text-zinc-600 font-mono uppercase text-center p-8 border border-zinc-800 bg-zinc-950/40">
                No active transmissions.
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- PRIORITY BOARD TAB --- */}
        <TabsContent value="priority" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Priority Signals */}
            <div className="border border-zinc-800 bg-zinc-950/40 p-5">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-red-400 flex items-center gap-2 mb-4">
                <Flag className="w-4 h-4" /> Priority Signals
              </h3>
              <div className="space-y-3">
                {signals.filter(s => s.priority).map(sig => (
                  <div key={sig.id} className="bg-black/40 border border-zinc-800 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-zinc-200 font-medium">{sig.title}</div>
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border ${getStatusColor(sig.status)}`}>{sig.status}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-3">
                      By: {getUserAlias(sig.submittedBy)} • {sig.category} • Case: {sig.caseId ? cases.find(c => c.id === sig.caseId)?.name : 'None'}
                    </div>
                    <div className="flex gap-2">
                      {sig.status !== "VERIFIED" && (
                        <button 
                          onClick={() => updateSignal(sig.id, { status: "VERIFIED" })}
                          className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 font-bold"
                        >
                          → VERIFY SIGNAL
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {signals.filter(s => s.priority).length === 0 && (
                  <div className="text-xs text-zinc-600 font-mono uppercase">No priority signals active.</div>
                )}
              </div>
            </div>

            {/* Escalated/Stale Cases */}
            <div className="border border-zinc-800 bg-zinc-950/40 p-5">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-sky-400 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4" /> Case Triage
              </h3>
              <div className="space-y-3">
                {cases.filter(c => c.status === "ESCALATED" || c.status === "OPEN").map(c => (
                  <div key={c.id} className="bg-black/40 border border-zinc-800 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-zinc-200 font-medium">{c.name}</div>
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border ${c.status === 'ESCALATED' ? 'text-red-400 border-red-900/50 bg-red-950/30' : 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30'}`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-3">
                      Lead: {getUserAlias(c.lead)} • Signals: {c.linkedSignals.length}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingCaseId(c.id);
                          setCaseForm({ name: c.name, summary: c.summary, status: c.status, lead: c.lead, notes: c.notes });
                          setCaseSignalsState(c.linkedSignals);
                          setViewState("EDIT");
                          setActiveTab("cases");
                        }}
                        className="text-[10px] uppercase tracking-widest text-sky-400 hover:text-sky-300 font-bold"
                      >
                        → MANAGE CASE
                      </button>
                    </div>
                  </div>
                ))}
                {cases.filter(c => c.status === "ESCALATED" || c.status === "OPEN").length === 0 && (
                  <div className="text-xs text-zinc-600 font-mono uppercase">No cases require immediate triage.</div>
                )}
              </div>
            </div>

          </div>
        </TabsContent>

        {/* --- INTAKE TAB --- */}
        <TabsContent value="intake">
          <IntakePanel
            users={users}
            currentUserId={currentUserId!}
            onPromote={async (id, standing) => {
              try {
                await updateUserOnServer(id, { standing, reviewStatus: "Active", promotionStatus: "Not Eligible" });
                showToast(`Operator promoted to ${standing}.`);
              } catch {
                showToast("Promotion failed. Try again.", "err");
              }
            }}
            onRemove={async (id, alias) => {
              setConfirmDelete({ type: "signal", id: 0, name: `OPERATOR: ${alias}` });
              // Override to delete user instead
              // We'll use a direct remove below
            }}
            onRemoveDirect={async (id, alias) => {
              if (!window.confirm(`Remove operator "${alias}" from the network? This cannot be undone.`)) return;
              try {
                await removeUserFromNetwork(id);
                showToast(`Operator ${alias} removed.`);
              } catch {
                showToast("Removal failed.", "err");
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface IntakePanelProps {
  users: ReturnType<typeof useStore>["users"];
  currentUserId: string;
  onPromote: (id: string, standing: string) => Promise<void>;
  onRemove: (id: string, alias: string) => void;
  onRemoveDirect: (id: string, alias: string) => Promise<void>;
}

function IntakePanel({ users, currentUserId, onPromote, onRemoveDirect }: IntakePanelProps) {
  const observers = users.filter(u => u.standing === "Observer");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-300">Operator Intake</h2>
          <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">
            Observer-standing operators awaiting review and standing assignment.
          </p>
        </div>
        <Badge className="bg-amber-950/40 border-amber-900/50 text-amber-500 rounded-none text-[10px]">
          {observers.length} pending
        </Badge>
      </div>

      {observers.length === 0 ? (
        <div className="border border-white/[0.05] bg-black/20 p-10 text-center">
          <div className="text-zinc-700 text-xs uppercase tracking-widest">No operators in intake queue.</div>
          <div className="text-zinc-800 text-[10px] mt-2">All registered operators have been reviewed.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {observers.map(op => (
            <div key={op.id} className="border border-white/[0.06] bg-black/30 p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-base font-medium text-zinc-200 uppercase tracking-wider">{op.alias}</span>
                    <span className="text-[9px] uppercase tracking-widest border border-white/[0.06] text-zinc-600 px-2 py-0.5">Observer</span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-700 mb-2">{op.id}</div>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1.5 text-[10px]">
                    <div><span className="text-zinc-700 uppercase tracking-widest">Credential:</span> <span className="text-zinc-500">{op.cardStyle}</span></div>
                    <div><span className="text-zinc-700 uppercase tracking-widest">Joined:</span> <span className="text-zinc-500">{op.joinDate}</span></div>
                    <div><span className="text-zinc-700 uppercase tracking-widest">Access:</span> <span className="text-zinc-500">{op.accessClass}</span></div>
                  </div>
                  {op.bio && (
                    <div className="mt-3 text-[11px] text-zinc-600 leading-relaxed border-l border-white/[0.05] pl-3 italic">
                      {op.bio}
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                  <div className="flex gap-1">
                    {["Scout", "Operator", "Analyst"].map(tier => (
                      <button
                        key={tier}
                        disabled={promoting === op.id}
                        onClick={async () => {
                          setPromoting(op.id);
                          await onPromote(op.id, tier);
                          setPromoting(null);
                        }}
                        className="text-[9px] uppercase tracking-widest px-2.5 py-1.5 border border-white/[0.07] text-zinc-500 hover:border-emerald-800/60 hover:text-emerald-500 hover:bg-emerald-950/20 transition-colors disabled:opacity-40"
                      >
                        {promoting === op.id ? "…" : `→ ${tier}`}
                      </button>
                    ))}
                  </div>
                  {op.id !== currentUserId && (
                    <button
                      disabled={removing === op.id}
                      onClick={async () => {
                        setRemoving(op.id);
                        await onRemoveDirect(op.id, op.alias);
                        setRemoving(null);
                      }}
                      className="flex items-center gap-1 text-[9px] uppercase tracking-widest px-2.5 py-1.5 border border-white/[0.04] text-zinc-700 hover:border-red-900/50 hover:text-red-700 transition-colors disabled:opacity-40"
                    >
                      <UserX className="w-3 h-3" />
                      {removing === op.id ? "…" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-white/[0.04] pt-4 mt-6">
        <div className="text-[8px] text-zinc-800 uppercase tracking-widest">
          Promotion assigns standing immediately. Observers gain full operator privileges at Scout and above.
          Removal permanently deletes the operator record.
        </div>
      </div>
    </div>
  );
}
