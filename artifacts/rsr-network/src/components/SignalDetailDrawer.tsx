import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Signal, useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { ResponseChips } from "./ResponseChips";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MapPin, Clock, Tag, AlertTriangle, Trash2 } from "lucide-react";

interface SignalDetailDrawerProps {
  signalId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignalDetailDrawer({ signalId, open, onOpenChange }: SignalDetailDrawerProps) {
  const { signals, currentUserId, users, addSignalThreadMessage, deleteSignal } = useStore();
  const signal = signals.find((s) => s.id === signalId);
  const [newMsg, setNewMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!signal) return null;

  const submitbyUser = users.find((u) => u.id === signal.submittedBy);
  const currentUser = users.find((u) => u.id === currentUserId);
  const isFounder = currentUser?.isFounder || currentUser?.standing === "Command";

  const handleSend = () => {
    if (!newMsg.trim() || !currentUser) return;
    addSignalThreadMessage(signal.id, { userId: currentUser.id, text: newMsg });
    setNewMsg("");
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteSignal(signal.id);
    onOpenChange(false);
    setConfirmDelete(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); setConfirmDelete(false); }}>
      <SheetContent side="right" className="w-full sm:max-w-md border-l border-white/[0.06] bg-[#020203] p-0 flex flex-col rounded-none">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/[0.06] bg-black/30 backdrop-blur-md shrink-0">
          <SheetHeader className="text-left space-y-3">
            <div className="flex justify-between items-start">
              <Badge className="bg-black/50 border-white/[0.08] text-zinc-500 rounded-none tracking-widest text-[9px] font-mono">
                SIG-{signal.id.toString().padStart(4, "0")}
              </Badge>
              {signal.priority && (
                <Badge className="bg-red-950/40 border-red-900/40 text-red-500 rounded-none flex items-center gap-1 text-[9px]">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  PRIORITY
                </Badge>
              )}
            </div>
            <SheetTitle className="text-base font-medium tracking-wide text-zinc-200 leading-snug">
              {signal.title}
            </SheetTitle>
            <div className="flex flex-wrap gap-3 text-[10px] text-zinc-600">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{signal.category}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{signal.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{signal.timestamp}</span>
            </div>
          </SheetHeader>
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Description</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">{signal.description}</p>
            </div>

            <div className="flex justify-between items-center py-4 border-y border-white/[0.05]">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Submitted By</div>
                <div className="text-sm text-zinc-300">{submitbyUser?.alias || signal.submittedBy}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Status</div>
                <div className="text-sm text-zinc-400">{signal.status}</div>
              </div>
            </div>

            <div>
              <h4 className="text-[9px] uppercase tracking-widest text-zinc-600 mb-3">Operational Response</h4>
              <ResponseChips
                options={["ACKNOWLEDGED", "TRACKING", "VERIFYING", "ESCALATE", "LOGGED"]}
                onSelect={() => {}}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] uppercase tracking-widest text-zinc-600">Signal Thread</h4>
              {signal.thread.length === 0 ? (
                <div className="text-xs text-zinc-700 italic">No thread history.</div>
              ) : (
                signal.thread.map((msg) => {
                  const author = users.find(u => u.id === msg.userId);
                  const isCmd = author?.standing === "Command";
                  return (
                    <div key={msg.id} className="border border-white/[0.05] bg-black/20 p-3 text-sm">
                      <div className="flex justify-between mb-1.5">
                        <span className={isCmd ? "text-amber-400 font-medium text-xs" : "text-zinc-400 text-xs"}>
                          {author?.alias || msg.userId}
                        </span>
                        <span className="text-zinc-700 text-[10px]">{msg.timestamp}</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer — thread input + delete */}
        <div className="border-t border-white/[0.06] bg-black/40 backdrop-blur-md shrink-0">
          <div className="p-4 flex gap-2">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Add thread entry…"
              className="rounded-none border-white/[0.07] bg-black/50 text-zinc-300 focus-visible:ring-0 text-sm"
            />
            <Button onClick={handleSend} variant="ghost" size="icon" className="rounded-none border border-white/[0.08] shrink-0 hover:bg-white/[0.05]">
              <Send className="w-4 h-4 text-zinc-500" />
            </Button>
          </div>

          {isFounder && (
            <div className="px-4 pb-4 flex justify-end">
              <button
                onClick={handleDelete}
                className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                  confirmDelete
                    ? "border-red-800/60 text-red-400 bg-red-950/30 hover:bg-red-950/50"
                    : "border-white/[0.05] text-zinc-700 hover:text-red-600 hover:border-red-900/40"
                }`}
              >
                <Trash2 className="w-3 h-3" />
                {confirmDelete ? "Confirm Removal" : "Remove Signal"}
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
