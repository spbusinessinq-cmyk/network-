import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
      <SheetContent side="right" className="w-full sm:max-w-md border-l border-zinc-800 bg-[#050607] p-0 flex flex-col rounded-none">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
          <SheetHeader className="text-left space-y-4">
            <div className="flex justify-between items-start">
              <Badge className="bg-zinc-900 border-zinc-800 text-zinc-300 rounded-none tracking-wider text-[10px]">
                SIGNAL #{signal.id.toString().padStart(4, "0")}
              </Badge>
              <div className="flex items-center gap-2">
                {signal.priority && (
                  <Badge className="bg-red-950/50 border-red-900/50 text-red-400 rounded-none flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    PRIORITY
                  </Badge>
                )}
                {isFounder && (
                  <button
                    onClick={handleDelete}
                    className={`flex items-center gap-1.5 text-[10px] px-2 py-1 border transition-colors ${
                      confirmDelete
                        ? "border-red-700 text-red-400 bg-red-950/30 hover:bg-red-950/50"
                        : "border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-800"
                    }`}
                    title={confirmDelete ? "Confirm delete signal" : "Delete signal"}
                  >
                    <Trash2 className="w-3 h-3" />
                    {confirmDelete ? "Confirm" : "Delete"}
                  </button>
                )}
              </div>
            </div>
            <SheetTitle className="text-xl font-medium tracking-wide text-zinc-100 leading-snug">
              {signal.title}
            </SheetTitle>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{signal.category}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{signal.location}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{signal.timestamp}</span>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Description</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">{signal.description}</p>
            </div>

            <div className="flex justify-between items-center py-4 border-y border-zinc-800/50">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Submitted By</div>
                <div className="text-sm text-zinc-300">{submitbyUser?.alias || signal.submittedBy}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Status</div>
                <div className="text-sm text-emerald-400">{signal.status}</div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Operational Response</h4>
              <ResponseChips
                options={["ACKNOWLEDGED", "TRACKING", "VERIFYING", "ESCALATE", "LOGGED"]}
                onSelect={() => {}}
              />
            </div>

            <div className="pt-4 space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-600">Signal Thread</h4>
              {signal.thread.length === 0 ? (
                <div className="text-sm text-zinc-600 italic">No thread history.</div>
              ) : (
                signal.thread.map((msg) => {
                  const author = users.find(u => u.id === msg.userId);
                  return (
                    <div key={msg.id} className="bg-zinc-900/30 border border-zinc-800 p-3 text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-zinc-400 font-medium">{author?.alias || msg.userId}</span>
                        <span className="text-zinc-600 text-xs">{msg.timestamp}</span>
                      </div>
                      <p className="text-zinc-300">{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex gap-2">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Add thread entry..."
              className="rounded-none border-zinc-800 bg-black text-zinc-300"
            />
            <Button onClick={handleSend} variant="outline" size="icon" className="rounded-none border-zinc-800 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
