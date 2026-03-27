import React, { useState, useMemo } from "react";
import { useStore, Case, Signal, Standing, Room } from "@/lib/store";
import {
  Shield, AlertTriangle, CheckCircle2, Archive, Plus, Flag, X, Trash2,
  UserX, UserCheck, Pencil, Check, Ban, Lock, Hash, ChevronUp, ChevronDown, ShieldOff
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StandingBadge } from "@/components/StandingBadge";
import { cn } from "@/lib/utils";

export default function CommandPage() {
  const {
    currentUserId, users, signals, cases, rooms, updateSignal, updateUser,
    addCase, updateCase, deleteCase, deleteSignal, networkMessages, deleteNetworkMessage,
    updateUserOnServer, removeUserFromNetwork, createRoom, deleteRoom, renameRoom,
  } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);

  const [activeTab, setActiveTab] = useState("signals");

  // Signals
  const [signalFilter, setSignalFilter] = useState<"ALL" | "UNVERIFIED" | "VERIFIED" | "ARCHIVED">("ALL");
  const filteredSignals = signals.filter(s => signalFilter === "ALL" || s.status === signalFilter);

  // Cases
  const [viewState, setViewState] = useState<"LIST" | "EDIT">("LIST");
  const [editingCaseId, setEditingCaseId] = useState<number | "NEW" | null>(null);
  const [caseForm, setCaseForm] = useState<Partial<Case>>({});
  const [noteInput, setNoteInput] = useState("");
  const [caseSignalsState, setCaseSignalsState] = useState<number[]>([]);
  const [isSavingCase, setIsSavingCase] = useState(false);

  // Personnel editing state
  const [editingAlias, setEditingAlias] = useState<{ id: string; value: string } | null>(null);
  const [savingAlias, setSavingAlias] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [savingPromotion, setSavingPromotion] = useState<string | null>(null);

  // Confirm / Toast
  const [confirmDelete, setConfirmDelete] = useState<{ type: "case" | "signal" | "message"; id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  };

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
  const priorityCount   = signals.filter(s => s.priority).length;
  const underReviewCount = users.filter(u => u.promotionStatus === "Under Review").length;

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      if (confirmDelete.type === "case") { await deleteCase(confirmDelete.id); showToast("Case record removed."); }
      else if (confirmDelete.type === "message") { await deleteNetworkMessage(confirmDelete.id); showToast("Transmission removed."); }
      else { await deleteSignal(confirmDelete.id); showToast("Signal removed."); }
      setConfirmDelete(null);
    } catch {
      showToast("Delete failed. Try again.", "err");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditCase = (c: Case | null) => {
    if (c) {
      setEditingCaseId(c.id);
      setCaseForm({ name: c.name, summary: c.summary, status: c.status, lead: c.lead, notes: c.notes || [] });
      setCaseSignalsState(c.linkedSignals || []);
    } else {
      setEditingCaseId("NEW");
      setCaseForm({ name: "", summary: "", status: "OPEN", lead: currentUser.id, notes: [] });
      setCaseSignalsState([]);
    }
    setViewState("EDIT");
  };

  const handleSaveCase = async () => {
    if (!caseForm.name || !caseForm.lead) return;
    setIsSavingCase(true);
    try {
      if (editingCaseId === "NEW") {
        await addCase({ name: caseForm.name, summary: caseForm.summary || "", status: caseForm.status as any, lead: caseForm.lead, notes: caseForm.notes || [], linkedSignals: caseSignalsState });
      } else if (editingCaseId) {
        await updateCase(editingCaseId as number, { name: caseForm.name, summary: caseForm.summary, status: caseForm.status as any, lead: caseForm.lead, notes: caseForm.notes });
        for (const sigId of caseSignalsState) {
          const sig = signals.find(s => s.id === sigId);
          if (sig && sig.caseId !== editingCaseId) await updateSignal(sigId, { caseId: editingCaseId as number });
        }
      }
      setViewState("LIST"); setEditingCaseId(null);
      showToast(editingCaseId === "NEW" ? "Case initialized." : "Case record updated.");
    } catch {
      showToast("Save failed. Try again.", "err");
    } finally {
      setIsSavingCase(false);
    }
  };

  const toggleSignalLink = (sigId: number) =>
    setCaseSignalsState(prev => prev.includes(sigId) ? prev.filter(id => id !== sigId) : [...prev, sigId]);

  const getUserAlias = (id: string) => users.find(u => u.id === id)?.alias || "UNKNOWN";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":   return "text-emerald-400 bg-emerald-950/30 border-emerald-900/50";
      case "UNVERIFIED": return "text-sky-400 bg-sky-950/30 border-sky-900/50";
      case "ARCHIVED":   return "text-zinc-400 bg-zinc-900/50 border-zinc-800";
      default:           return "text-zinc-400 bg-zinc-900/50 border-zinc-800";
    }
  };

  const handleSaveAlias = async (userId: string) => {
    if (!editingAlias || editingAlias.id !== userId) return;
    const trimmed = editingAlias.value.trim();
    if (!trimmed) { setEditingAlias(null); return; }
    setSavingAlias(userId);
    try {
      await updateUserOnServer(userId, { alias: trimmed });
      showToast("Alias updated.");
    } catch {
      showToast("Alias update failed.", "err");
    } finally {
      setSavingAlias(null);
      setEditingAlias(null);
    }
  };

  const handleSetStatus = async (userId: string, status: "active" | "restricted" | "banned") => {
    setSavingStatus(userId);
    try {
      await updateUserOnServer(userId, { status });
      showToast(`Operator status set to ${status}.`);
    } catch {
      showToast("Status update failed.", "err");
    } finally {
      setSavingStatus(null);
    }
  };

  const handlePromotion = async (userId: string, decision: "approve" | "deny", currentStanding: string) => {
    setSavingPromotion(userId);
    const standingOrder: Standing[] = ["Observer", "Scout", "Operator", "Analyst", "Command"];
    try {
      if (decision === "approve") {
        const idx = standingOrder.indexOf(currentStanding as Standing);
        const nextStanding = standingOrder[Math.min(idx + 1, standingOrder.length - 2)]; // Never auto-promote to Command
        await updateUserOnServer(userId, { standing: nextStanding, promotionStatus: "Approved", reviewStatus: "Active" });
        showToast(`Promoted to ${nextStanding}.`);
      } else {
        await updateUserOnServer(userId, { promotionStatus: "Denied" });
        showToast("Promotion denied.");
      }
    } catch {
      showToast("Promotion action failed.", "err");
    } finally {
      setSavingPromotion(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full relative border-t-2 border-amber-900/20">

      {/* TOAST */}
      {toast && (
        <div className={cn(
          "fixed top-6 right-6 z-50 px-4 py-3 border text-xs uppercase tracking-widest font-mono",
          toast.kind === "ok" ? "bg-emerald-950/90 border-emerald-800 text-emerald-400" : "bg-red-950/90 border-red-800 text-red-400"
        )}>
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
            <p className="text-sm text-zinc-300 mb-2">Permanently remove:</p>
            <div className="bg-black/50 border border-zinc-800 p-3 mb-6 font-mono text-xs text-zinc-300 uppercase tracking-wider">
              {confirmDelete.type === "case" ? "CASE" : confirmDelete.type === "signal" ? "SIGNAL" : "TRANSMISSION"}: {confirmDelete.name}
            </div>
            <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)} disabled={isDeleting}
                className="rounded-none text-zinc-400 hover:text-zinc-200 uppercase tracking-widest text-xs">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} disabled={isDeleting}
                className="bg-red-900/60 text-red-300 border border-red-800 hover:bg-red-800/60 rounded-none uppercase tracking-widest text-xs px-6">
                {isDeleting ? "Removing..." : "Confirm Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-medium tracking-[0.1em] text-amber-500 uppercase mb-2 flex items-center gap-3">
          <Shield className="w-6 h-6" /> NETWORK COMMAND CONSOLE
        </h1>
        <p className="text-sm text-zinc-400 font-mono">AUTHORITY LEVEL UNRESTRICTED. OVERSIGHT ACTIVE.</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="text-[9px] uppercase tracking-widest border border-amber-900/60 bg-amber-950/30 text-amber-400 px-2 py-0.5">
            [{unverifiedCount} PENDING]
          </span>
          <span className="text-[9px] uppercase tracking-widest border border-red-900/60 bg-red-950/30 text-red-400 px-2 py-0.5">
            [{cases.filter(c => c.status === "ESCALATED").length} ESCALATED]
          </span>
          {underReviewCount > 0 && (
            <span className="text-[9px] uppercase tracking-widest border border-emerald-900/60 bg-emerald-950/30 text-emerald-400 px-2 py-0.5">
              [{underReviewCount} PROMOTION REQUESTS]
            </span>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-zinc-800 rounded-none w-full justify-start h-auto p-0 mb-8 gap-6 overflow-x-auto flex-nowrap hide-scrollbar">
          {[
            { value: "signals",   label: "Signals",       badge: unverifiedCount > 0 ? unverifiedCount : null, badgeClass: "bg-sky-950 text-sky-400 border-sky-900" },
            { value: "cases",     label: "Cases",         badge: null, badgeClass: "" },
            { value: "personnel", label: "Personnel",     badge: underReviewCount > 0 ? underReviewCount : null, badgeClass: "bg-emerald-950/60 text-emerald-400 border-emerald-900/50" },
            { value: "messages",  label: "Messages",      badge: networkMessages.length > 0 ? networkMessages.length : null, badgeClass: "bg-zinc-900 text-zinc-400 border-zinc-800" },
            { value: "priority",  label: "Priority Board", badge: priorityCount > 0 ? priorityCount : null, badgeClass: "bg-red-950 text-red-500 border-red-900" },
            { value: "intake",    label: "Intake",        badge: users.filter(u => u.standing === "Observer").length > 0 ? users.filter(u => u.standing === "Observer").length : null, badgeClass: "bg-amber-950/50 text-amber-500 border-amber-900/50" },
          { value: "channels",  label: "Channels",      badge: rooms.filter(r => r.type === "custom").length > 0 ? rooms.filter(r => r.type === "custom").length : null, badgeClass: "bg-zinc-900 text-zinc-400 border-zinc-800" },
          ].map(({ value, label, badge, badgeClass }) => (
            <TabsTrigger key={value} value={value}
              className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-500 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs whitespace-nowrap">
              {label}
              {badge !== null && <Badge className={cn("ml-2 rounded-none", badgeClass)}>{badge}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* SIGNALS */}
        <TabsContent value="signals" className="space-y-4">
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL", "UNVERIFIED", "VERIFIED", "ARCHIVED"].map(f => (
              <button key={f} onClick={() => setSignalFilter(f as any)}
                className={cn("px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors",
                  signalFilter === f ? "border-sky-500/50 bg-sky-950/20 text-sky-400" : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700")}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredSignals.length === 0 && <div className="p-8 border border-zinc-800 bg-zinc-900/20 text-center text-zinc-500 text-xs uppercase tracking-widest">No signals match filter.</div>}
            {filteredSignals.map(sig => (
              <div key={sig.id} className="border border-zinc-800 bg-zinc-950/60 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-zinc-900/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={cn("px-2 py-0.5 text-[9px] uppercase tracking-wider border", getStatusColor(sig.status))}>{sig.status}</span>
                    {sig.priority && <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-red-900/50 bg-red-950/30 text-red-400 flex items-center gap-1"><Flag className="w-2.5 h-2.5" /> PRIORITY</span>}
                  </div>
                  <div className="text-sm text-zinc-200 font-medium truncate mb-1">{sig.title}</div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase flex-wrap">
                    <span>{sig.category}</span><span>•</span><span>{sig.location}</span><span>•</span>
                    <span>By: {getUserAlias(sig.submittedBy)}</span><span>•</span><span>{sig.timestamp}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {sig.status !== "VERIFIED" && (
                    <Button onClick={() => updateSignal(sig.id, { status: "VERIFIED" })}
                      className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/50 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 mr-1.5" /> Verify
                    </Button>
                  )}
                  {sig.status !== "ARCHIVED" && (
                    <Button onClick={() => updateSignal(sig.id, { status: "ARCHIVED" })}
                      className="bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider">
                      <Archive className="w-3 h-3 mr-1.5" /> Archive
                    </Button>
                  )}
                  <Button onClick={() => updateSignal(sig.id, { priority: !sig.priority })}
                    className={cn("border rounded-none text-[10px] h-8 px-3 uppercase tracking-wider",
                      sig.priority ? "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800" : "bg-red-950/20 text-red-400 border-red-900/30 hover:bg-red-900/40")}>
                    <Flag className="w-3 h-3 mr-1.5" />{sig.priority ? "Drop Priority" : "Flag Priority"}
                  </Button>
                  <Button onClick={() => setConfirmDelete({ type: "signal", id: sig.id, name: sig.title })}
                    className="bg-zinc-900/50 text-red-400 border border-red-900/40 hover:bg-red-950/40 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* CASES */}
        <TabsContent value="cases" className="space-y-4">
          {viewState === "LIST" ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold">Case Control</h3>
                <Button onClick={() => handleEditCase(null)}
                  className="bg-sky-950/20 text-sky-400 border border-sky-900/50 hover:bg-sky-900/30 rounded-none text-[10px] h-8 uppercase tracking-widest">
                  <Plus className="w-3 h-3 mr-1.5" /> New Case
                </Button>
              </div>
              <div className="space-y-2">
                {cases.length === 0 && <div className="p-8 border border-zinc-800 bg-zinc-900/20 text-center text-zinc-500 text-xs uppercase tracking-widest">No active cases.</div>}
                {cases.map(c => (
                  <div key={c.id} className="border border-zinc-800 bg-zinc-950/60 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-zinc-900/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-zinc-700 bg-zinc-800/50 text-zinc-300">{c.status}</span>
                        <span className="text-sm text-zinc-200 font-medium truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase">
                        <span>Lead: {getUserAlias(c.lead)}</span><span>•</span>
                        <span>Signals: {c.linkedSignals.length}</span><span>•</span><span>Notes: {c.notes.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button onClick={() => handleEditCase(c)}
                        className="bg-zinc-900/50 text-zinc-300 border border-zinc-700 hover:bg-zinc-800 rounded-none text-[10px] h-8 px-4 uppercase tracking-wider">
                        Edit
                      </Button>
                      <Button onClick={() => setConfirmDelete({ type: "case", id: c.id, name: c.name })}
                        className="bg-zinc-900/50 text-red-400 border border-red-900/40 hover:bg-red-950/40 rounded-none text-[10px] h-8 px-3 uppercase tracking-wider">
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
                <h3 className="text-sm text-amber-500 uppercase tracking-widest font-medium">
                  {editingCaseId === "NEW" ? "Initialize New Case" : "Modify Case Details"}
                </h3>
                <button onClick={() => setViewState("LIST")} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Case Title</label>
                    <Input value={caseForm.name || ""} onChange={e => setCaseForm({...caseForm, name: e.target.value})}
                      className="bg-black/50 border-zinc-800 rounded-none font-medium h-10" placeholder="Operation designation..." />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Lead Operator</label>
                    <select value={caseForm.lead || ""} onChange={e => setCaseForm({...caseForm, lead: e.target.value})}
                      className="w-full bg-black/50 border border-zinc-800 rounded-none text-sm p-2 h-10 text-zinc-200 outline-none focus:border-amber-600/50">
                      {users.map(u => <option key={u.id} value={u.id}>{u.alias} ({u.standing})</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Status</label>
                  <select value={caseForm.status || "OPEN"} onChange={e => setCaseForm({...caseForm, status: e.target.value as any})}
                    className="w-full md:w-48 bg-black/50 border border-zinc-800 rounded-none text-sm p-2 h-10 text-zinc-200 outline-none focus:border-amber-600/50">
                    {["OPEN","ACTIVE","MONITORING","ESCALATED","ARCHIVED"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Summary / Objective</label>
                  <Textarea value={caseForm.summary || ""} onChange={e => setCaseForm({...caseForm, summary: e.target.value})}
                    className="bg-black/50 border-zinc-800 rounded-none resize-none min-h-[100px]" placeholder="Case context and goals..." />
                </div>
                <div className="border-t border-zinc-800 pt-6">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Case Notes</label>
                  <div className="flex gap-2 mb-4">
                    <Input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                      className="bg-black/50 border-zinc-800 rounded-none h-9 text-sm" placeholder="Add observation..."
                      onKeyDown={e => {
                        if (e.key === "Enter" && noteInput.trim()) {
                          e.preventDefault();
                          setCaseForm(p => ({ ...p, notes: [...(p.notes || []), noteInput.trim()] }));
                          setNoteInput("");
                        }
                      }}
                    />
                    <Button onClick={() => { if (noteInput.trim()) { setCaseForm(p => ({ ...p, notes: [...(p.notes || []), noteInput.trim()] })); setNoteInput(""); } }}
                      className="bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-none h-9 px-4 text-xs uppercase">Add</Button>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {caseForm.notes?.map((note, i) => (
                      <div key={i} className="flex items-start gap-2 bg-black/30 border border-zinc-800 p-2">
                        <span className="text-xs text-zinc-400 flex-1">{note}</span>
                        <button onClick={() => setCaseForm(p => ({ ...p, notes: p.notes?.filter((_, j) => j !== i) }))} className="text-zinc-700 hover:text-red-500 shrink-0"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {(!caseForm.notes || caseForm.notes.length === 0) && <span className="text-xs text-zinc-600 font-mono">No notes recorded.</span>}
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-6">
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Link Signals</label>
                  <div className="max-h-64 overflow-y-auto border border-zinc-800 bg-black/30 p-2 space-y-1">
                    {signals.map(sig => (
                      <label key={sig.id} className={cn("flex items-start gap-3 p-2 cursor-pointer hover:bg-zinc-900/50 transition-colors", caseSignalsState.includes(sig.id) && "bg-sky-950/10")}>
                        <input type="checkbox" className="mt-1 accent-sky-500 bg-zinc-900 border-zinc-700" checked={caseSignalsState.includes(sig.id)} onChange={() => toggleSignalLink(sig.id)} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-zinc-300 truncate">{sig.title}</span>
                          <span className="text-[10px] text-zinc-500 font-mono uppercase">{sig.category} • By: {getUserAlias(sig.submittedBy)}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setViewState("LIST")}
                    className="rounded-none text-zinc-400 hover:text-zinc-200 uppercase tracking-widest text-xs">Cancel</Button>
                  <Button onClick={handleSaveCase} disabled={isSavingCase || !caseForm.name || !caseForm.lead}
                    className="bg-amber-600 text-black border border-amber-400/60 hover:bg-amber-500 rounded-none uppercase tracking-widest font-bold px-8">
                    {isSavingCase ? "Saving..." : "Save Case Record"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* PERSONNEL */}
        <TabsContent value="personnel" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Operator Control Panel</h3>
            <p className="text-[9px] text-zinc-700 mt-1 uppercase tracking-widest">Alias · Standing · Status · Promotion authority</p>
          </div>

          {/* Promotion queue banner */}
          {underReviewCount > 0 && (
            <div className="border border-emerald-900/40 bg-emerald-950/10 p-4 mb-6 flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-xs text-emerald-400 uppercase tracking-widest font-medium">
                  {underReviewCount} promotion request{underReviewCount !== 1 ? "s" : ""} pending review
                </span>
                <p className="text-[9px] text-zinc-600 mt-0.5">Operators requesting advancement are highlighted below.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {users.map(u => {
              const isProtected = u.isFounder || u.id === currentUserId;
              const isEditingThisAlias = editingAlias?.id === u.id;
              const userStatus = u.status || "active";
              const hasPromoRequest = u.promotionStatus === "Under Review";

              return (
                <div key={u.id} className={cn(
                  "border bg-zinc-950/60 p-5 flex flex-col gap-4 transition-colors",
                  hasPromoRequest ? "border-emerald-900/50 hover:border-emerald-800/60" : "border-zinc-800 hover:border-zinc-700",
                  userStatus === "banned" && "opacity-60",
                )}>
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {/* Alias line */}
                      {isEditingThisAlias ? (
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            autoFocus
                            value={editingAlias.value}
                            onChange={e => setEditingAlias({ ...editingAlias, value: e.target.value })}
                            onKeyDown={e => { if (e.key === "Enter") handleSaveAlias(u.id); if (e.key === "Escape") setEditingAlias(null); }}
                            className="flex-1 bg-transparent border-b border-amber-700/50 text-zinc-200 text-base font-medium uppercase tracking-wider outline-none py-0.5 min-w-0"
                          />
                          <button onClick={() => handleSaveAlias(u.id)} disabled={savingAlias === u.id} className="text-emerald-500 hover:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingAlias(null)} className="text-zinc-700 hover:text-zinc-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-1 group/alias">
                          <span className={cn("text-base font-medium uppercase tracking-wider", u.standing === "Command" ? "text-amber-400" : "text-zinc-200")}>
                            {u.alias}
                          </span>
                          {!isProtected && (
                            <button
                              onClick={() => setEditingAlias({ id: u.id, value: u.alias })}
                              className="opacity-0 group-hover/alias:opacity-100 transition-opacity text-zinc-700 hover:text-amber-600"
                              title="Edit alias"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="text-[9px] font-mono text-zinc-700 tracking-widest">{u.id}</div>
                    </div>
                    <div className="flex items-start gap-2 shrink-0">
                      <StandingBadge standing={u.standing} grade={u.grade} />
                      {/* Status pill */}
                      <span className={cn("text-[8px] uppercase tracking-widest border px-1.5 py-0.5 font-mono",
                        userStatus === "active"     && "border-zinc-800 text-zinc-600",
                        userStatus === "restricted" && "border-yellow-900/50 text-yellow-600 bg-yellow-950/20",
                        userStatus === "banned"     && "border-red-900/50 text-red-500 bg-red-950/20",
                      )}>
                        {userStatus}
                      </span>
                    </div>
                  </div>

                  {/* Promotion Request Banner */}
                  {hasPromoRequest && (
                    <div className="border border-emerald-900/40 bg-emerald-950/10 p-3">
                      <div className="text-[9px] text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3" /> Promotion Requested
                      </div>
                      <div className="text-[10px] text-zinc-500 mb-3">
                        Current: {u.standing}{u.grade ? ` · Grade ${u.grade}` : ""} → requesting advancement
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={savingPromotion === u.id}
                          onClick={() => handlePromotion(u.id, "approve", u.standing)}
                          className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest px-3 py-1.5 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/40 transition-colors disabled:opacity-40"
                        >
                          <Check className="w-3 h-3" />
                          {savingPromotion === u.id ? "…" : "Approve"}
                        </button>
                        <button
                          disabled={savingPromotion === u.id}
                          onClick={() => handlePromotion(u.id, "deny", u.standing)}
                          className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest px-3 py-1.5 border border-red-900/40 text-red-500 hover:bg-red-950/20 transition-colors disabled:opacity-40"
                        >
                          <X className="w-3 h-3" />
                          {savingPromotion === u.id ? "…" : "Deny"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  {isProtected ? (
                    <div className="text-[9px] text-amber-500 font-mono text-center tracking-widest bg-amber-950/20 py-2 border border-amber-900/30 mt-auto">
                      {u.isFounder ? "FOUNDER ACCOUNT — PROTECTED" : "ACTIVE COMMANDER — CURRENT SESSION"}
                    </div>
                  ) : (
                    <div className="space-y-3 mt-auto">
                      {/* Standing */}
                      <div>
                        <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1">Standing</label>
                        <select
                          value={u.standing}
                          onChange={e => updateUserOnServer(u.id, { standing: e.target.value as Standing })}
                          className="w-full bg-black/50 border border-zinc-800 text-[10px] uppercase tracking-widest p-1.5 text-zinc-300 outline-none focus:border-amber-600/50"
                        >
                          {["Observer","Scout","Operator","Analyst","Command"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-1">Network Status</label>
                        <div className="flex gap-1.5">
                          {(["active", "restricted", "banned"] as const).map(s => (
                            <button
                              key={s}
                              disabled={savingStatus === u.id}
                              onClick={() => handleSetStatus(u.id, s)}
                              className={cn(
                                "flex-1 text-[8px] uppercase tracking-widest py-1.5 border transition-colors disabled:opacity-40",
                                userStatus === s
                                  ? s === "active"     ? "border-zinc-600 bg-zinc-800/50 text-zinc-300"
                                    : s === "restricted" ? "border-yellow-700/60 bg-yellow-950/30 text-yellow-400"
                                    : "border-red-700/60 bg-red-950/30 text-red-400"
                                  : "border-zinc-800 bg-zinc-900/30 text-zinc-700 hover:text-zinc-400 hover:border-zinc-700"
                              )}
                            >
                              {s === "restricted" ? <Lock className="w-2.5 h-2.5 mx-auto" title="Restrict" /> : s === "banned" ? <Ban className="w-2.5 h-2.5 mx-auto" title="Ban" /> : s}
                            </button>
                          ))}
                        </div>
                        <div className="flex text-[7px] text-zinc-800 uppercase tracking-widest mt-0.5">
                          {["active","restrict","ban"].map(l => <span key={l} className="flex-1 text-center">{l}</span>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* MESSAGES */}
        <TabsContent value="messages" className="space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold border-b border-zinc-800/50 pb-2 mb-4">NETWORK COMMUNICATIONS OVERSIGHT</h3>
          <div className="space-y-2">
            {[...networkMessages].reverse().map(msg => (
              <div key={msg.id} className="border border-zinc-800 bg-zinc-950/60 p-4 flex justify-between items-start gap-4 hover:bg-zinc-900/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-zinc-200 font-medium text-sm">{getUserAlias(msg.userId)}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{msg.userId}</span>
                  </div>
                  <div className="text-sm text-zinc-300">{msg.text}</div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="text-[10px] text-zinc-600 font-mono">{msg.timestamp}</span>
                  <button onClick={() => setConfirmDelete({ type: "message", id: msg.id, name: msg.text.slice(0, 50) })} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {networkMessages.length === 0 && (
              <div className="text-xs text-zinc-600 font-mono uppercase text-center p-8 border border-zinc-800 bg-zinc-950/40">No active transmissions.</div>
            )}
          </div>
        </TabsContent>

        {/* PRIORITY BOARD */}
        <TabsContent value="priority" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-zinc-800 bg-zinc-950/40 p-5">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-red-400 flex items-center gap-2 mb-4"><Flag className="w-4 h-4" /> Priority Signals</h3>
              <div className="space-y-3">
                {signals.filter(s => s.priority).map(sig => (
                  <div key={sig.id} className="bg-black/40 border border-zinc-800 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-zinc-200 font-medium">{sig.title}</div>
                      <span className={cn("text-[9px] uppercase tracking-widest px-2 py-0.5 border", getStatusColor(sig.status))}>{sig.status}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-3">
                      By: {getUserAlias(sig.submittedBy)} • {sig.category}
                    </div>
                    {sig.status !== "VERIFIED" && (
                      <button onClick={() => updateSignal(sig.id, { status: "VERIFIED" })} className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 font-bold">
                        → VERIFY SIGNAL
                      </button>
                    )}
                  </div>
                ))}
                {signals.filter(s => s.priority).length === 0 && <div className="text-xs text-zinc-600 font-mono uppercase">No priority signals active.</div>}
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-950/40 p-5">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-amber-500 flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4" /> Case Triage</h3>
              <div className="space-y-3">
                {cases.filter(c => c.status === "ESCALATED" || c.status === "OPEN").map(c => (
                  <div key={c.id} className="bg-black/40 border border-zinc-800 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-zinc-200 font-medium">{c.name}</div>
                      <span className={cn("text-[9px] uppercase tracking-widest px-2 py-0.5 border", c.status === "ESCALATED" ? "text-red-400 border-red-900/50 bg-red-950/30" : "text-emerald-400 border-emerald-900/50 bg-emerald-950/30")}>{c.status}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-3">Lead: {getUserAlias(c.lead)} • Signals: {c.linkedSignals.length}</div>
                    <button onClick={() => { setEditingCaseId(c.id); setCaseForm({ name: c.name, summary: c.summary, status: c.status, lead: c.lead, notes: c.notes }); setCaseSignalsState(c.linkedSignals); setViewState("EDIT"); setActiveTab("cases"); }}
                      className="text-[10px] uppercase tracking-widest text-amber-500 hover:text-amber-400 font-bold">
                      → MANAGE CASE
                    </button>
                  </div>
                ))}
                {cases.filter(c => c.status === "ESCALATED" || c.status === "OPEN").length === 0 && <div className="text-xs text-zinc-600 font-mono uppercase">No cases require immediate triage.</div>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CHANNELS */}
        <TabsContent value="channels">
          <ChannelPanel
            rooms={rooms}
            onCreateRoom={async (name) => {
              const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
              try { await createRoom(name, slug); showToast(`Channel #${name} created.`); }
              catch (err) { showToast(err instanceof Error ? err.message : "Create failed.", "err"); }
            }}
            onRenameRoom={async (id, name) => {
              try { await renameRoom(id, name); showToast("Channel renamed."); }
              catch (err) { showToast(err instanceof Error ? err.message : "Rename failed.", "err"); }
            }}
            onDeleteRoom={async (id, name) => {
              try { await deleteRoom(id); showToast(`Channel #${name} removed.`); }
              catch (err) { showToast(err instanceof Error ? err.message : "Cannot delete system channel.", "err"); }
            }}
          />
        </TabsContent>

        {/* INTAKE */}
        <TabsContent value="intake">
          <IntakePanel
            users={users}
            currentUserId={currentUserId!}
            onPromote={async (id, standing) => {
              try { await updateUserOnServer(id, { standing, reviewStatus: "Active", promotionStatus: "Not Eligible" }); showToast(`Operator promoted to ${standing}.`); }
              catch { showToast("Promotion failed. Try again.", "err"); }
            }}
            onRemoveDirect={async (id, alias) => {
              if (!window.confirm(`Remove operator "${alias}" from the network? This cannot be undone.`)) return;
              try { await removeUserFromNetwork(id); showToast(`Operator ${alias} removed.`); }
              catch { showToast("Removal failed.", "err"); }
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
  onRemoveDirect: (id: string, alias: string) => Promise<void>;
}

// ── CHANNEL PANEL ──────────────────────────────────────────────────────────

interface ChannelPanelProps {
  rooms: Room[];
  onCreateRoom: (name: string) => Promise<void>;
  onRenameRoom: (id: number, name: string) => Promise<void>;
  onDeleteRoom: (id: number, name: string) => Promise<void>;
}

function loadOrder(): number[] {
  try { return JSON.parse(localStorage.getItem("rsr_room_order") || "[]"); } catch { return []; }
}
function saveOrder(o: number[]) { localStorage.setItem("rsr_room_order", JSON.stringify(o)); }

function ChannelPanel({ rooms, onCreateRoom, onRenameRoom, onDeleteRoom }: ChannelPanelProps) {
  const [order, setOrder] = useState<number[]>(loadOrder);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [savingRename, setSavingRename] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const sortedRooms = useMemo(() => {
    if (!order.length) return rooms;
    const map = new Map(order.map((id, i) => [id, i]));
    return [...rooms].sort((a, b) => (map.get(a.id) ?? 9999) - (map.get(b.id) ?? 9999));
  }, [rooms, order]);

  const move = (id: number, dir: -1 | 1) => {
    const current = sortedRooms.map(r => r.id);
    const idx = current.indexOf(id);
    const next = idx + dir;
    if (next < 0 || next >= current.length) return;
    [current[idx], current[next]] = [current[next], current[idx]];
    setOrder([...current]);
    saveOrder(current);
  };

  const startRename = (room: Room) => {
    setRenamingId(room.id);
    setRenameVal(room.name);
    setConfirmDeleteId(null);
  };

  const submitRename = async (id: number) => {
    if (!renameVal.trim()) { setRenamingId(null); return; }
    setSavingRename(id);
    try { await onRenameRoom(id, renameVal.trim()); } catch {}
    setSavingRename(null);
    setRenamingId(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    setDeletingId(id);
    try {
      await onDeleteRoom(id, name);
      setConfirmDeleteId(null);
      const newOrder = order.filter(oid => oid !== id);
      setOrder(newOrder);
      saveOrder(newOrder);
    } catch {}
    setDeletingId(null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try { await onCreateRoom(newName.trim()); setNewName(""); setShowCreate(false); } catch {}
    setCreating(false);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-300">Channel Management</h2>
          <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">
            {rooms.filter(r => r.type === "system").length} system · {rooms.filter(r => r.type === "custom").length} custom
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(s => !s); setNewName(""); }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest border border-white/[0.06] text-zinc-500 hover:text-amber-600 hover:border-amber-900/40 px-3 py-1.5 transition-colors"
        >
          <Plus className="w-3 h-3" /> New Channel
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="border border-amber-900/30 bg-amber-950/10 p-4 flex flex-col sm:flex-row gap-2 mb-6">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
            placeholder="Channel name…"
            className="flex-1 bg-black/40 border border-white/[0.06] text-zinc-300 text-sm px-3 py-1.5 outline-none focus:border-amber-700/40"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="text-[10px] uppercase tracking-widest border border-amber-800/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/30 px-4 py-1.5 disabled:opacity-40 transition-colors"
          >
            {creating ? "Creating…" : "Create"}
          </button>
          <button onClick={() => setShowCreate(false)} className="text-zinc-700 hover:text-zinc-400 px-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Channel list */}
      <div className="space-y-2">
        {sortedRooms.length === 0 && (
          <div className="p-8 border border-zinc-800 text-center text-zinc-600 text-xs uppercase tracking-widest">No channels.</div>
        )}
        {sortedRooms.map((room, idx) => {
          const isSystem = room.type === "system";
          const isRenaming = renamingId === room.id;
          const isConfirming = confirmDeleteId === room.id;
          const isDeleting = deletingId === room.id;
          const isFirst = idx === 0;
          const isLast = idx === sortedRooms.length - 1;

          return (
            <div
              key={room.id}
              className={cn(
                "border bg-zinc-950/60 p-4 flex items-center gap-4 transition-colors",
                isSystem ? "border-zinc-800/50 opacity-70" : "border-zinc-800",
                isConfirming && "border-red-900/50 bg-red-950/10",
                isDeleting && "opacity-40 pointer-events-none",
              )}
            >
              {/* Channel icon + name */}
              <Hash className={cn("w-3.5 h-3.5 shrink-0", isSystem ? "text-zinc-700" : "text-zinc-600")} />

              <div className="flex-1 min-w-0">
                {isRenaming ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") submitRename(room.id); if (e.key === "Escape") setRenamingId(null); }}
                      className="flex-1 bg-transparent border-b border-amber-700/50 text-zinc-200 text-sm outline-none py-0.5 min-w-0"
                    />
                    <button onClick={() => submitRename(room.id)} disabled={savingRename === room.id} className="text-emerald-500 hover:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setRenamingId(null)} className="text-zinc-600 hover:text-zinc-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm font-medium uppercase tracking-wide", isSystem ? "text-zinc-500" : "text-zinc-300")}>
                      {room.name}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-700">#{room.slug}</span>
                    <span className={cn("text-[8px] uppercase tracking-widest border px-1.5 py-0.5",
                      isSystem
                        ? "border-zinc-800 text-zinc-700"
                        : "border-zinc-700/50 text-zinc-600"
                    )}>
                      {room.type}
                    </span>
                    {isConfirming && (
                      <span className="text-[9px] text-red-500 uppercase tracking-widest font-mono">Delete?</span>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Reorder — all rooms */}
                <button onClick={() => move(room.id, -1)} disabled={isFirst} className="p-1 disabled:opacity-20 text-zinc-700 hover:text-zinc-400" title="Move up">
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button onClick={() => move(room.id, 1)} disabled={isLast} className="p-1 disabled:opacity-20 text-zinc-700 hover:text-zinc-400" title="Move down">
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isSystem ? (
                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest text-zinc-800 ml-1 font-mono border border-zinc-900 px-2 py-1">
                    <ShieldOff className="w-2.5 h-2.5" /> Protected
                  </span>
                ) : (
                  <>
                    {/* Rename */}
                    {!isRenaming && !isConfirming && (
                      <button onClick={() => startRename(room)} className="p-1 text-zinc-700 hover:text-zinc-400 ml-1" title="Rename">
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete / confirm */}
                    {isConfirming ? (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleDelete(room.id, room.name)}
                          disabled={isDeleting}
                          className="flex items-center gap-1 text-[9px] uppercase tracking-widest border border-red-800/60 bg-red-950/30 text-red-400 hover:bg-red-900/40 px-2 py-1 transition-colors disabled:opacity-40"
                        >
                          <Check className="w-2.5 h-2.5" /> Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1 text-zinc-600 hover:text-zinc-400"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : !isRenaming && (
                      <button
                        onClick={() => handleDelete(room.id, room.name)}
                        className="p-1 text-zinc-700 hover:text-red-600 ml-0.5"
                        title="Delete channel"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/[0.04] pt-4 mt-6">
        <div className="text-[8px] text-zinc-800 uppercase tracking-widest leading-relaxed">
          System channels cannot be renamed or deleted. Reorder persists across Network Room and Command.
          Custom channels and their messages are permanently removed on deletion.
        </div>
      </div>
    </div>
  );
}

// ── INTAKE PANEL ───────────────────────────────────────────────────────────

function IntakePanel({ users, currentUserId, onPromote, onRemoveDirect }: IntakePanelProps) {
  const observers = users.filter(u => u.standing === "Observer");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-300">Operator Intake</h2>
          <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Observer-standing operators awaiting review.</p>
        </div>
        <Badge className="bg-amber-950/40 border-amber-900/50 text-amber-500 rounded-none text-[10px]">{observers.length} pending</Badge>
      </div>

      {observers.length === 0 ? (
        <div className="border border-white/[0.05] bg-black/20 p-10 text-center">
          <div className="text-zinc-700 text-xs uppercase tracking-widest">No operators in intake queue.</div>
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
                  {op.bio && <div className="mt-3 text-[11px] text-zinc-600 leading-relaxed border-l border-white/[0.05] pl-3 italic">{op.bio}</div>}
                </div>
                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                  <div className="flex gap-1">
                    {["Scout","Operator","Analyst"].map(tier => (
                      <button key={tier} disabled={promoting === op.id}
                        onClick={async () => { setPromoting(op.id); await onPromote(op.id, tier); setPromoting(null); }}
                        className="text-[9px] uppercase tracking-widest px-2.5 py-1.5 border border-white/[0.07] text-zinc-500 hover:border-emerald-800/60 hover:text-emerald-500 hover:bg-emerald-950/20 transition-colors disabled:opacity-40">
                        {promoting === op.id ? "…" : `→ ${tier}`}
                      </button>
                    ))}
                  </div>
                  {op.id !== currentUserId && (
                    <button disabled={removing === op.id}
                      onClick={async () => { setRemoving(op.id); await onRemoveDirect(op.id, op.alias); setRemoving(null); }}
                      className="flex items-center gap-1 text-[9px] uppercase tracking-widest px-2.5 py-1.5 border border-white/[0.04] text-zinc-700 hover:border-red-900/50 hover:text-red-700 transition-colors disabled:opacity-40">
                      <UserX className="w-3 h-3" />{removing === op.id ? "…" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
