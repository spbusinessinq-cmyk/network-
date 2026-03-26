import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Plus, Trash2, Hash, X, Check } from "lucide-react";
import { StandingBadge } from "@/components/StandingBadge";
import { ResponseChips } from "@/components/ResponseChips";
import { OperatorCard } from "@/components/OperatorCard";

export default function NetworkRoom() {
  const {
    networkMessages, users, currentUserId, rooms, currentRoomId,
    addNetworkMessage, addMessageResponse, setCurrentRoom, createRoom, deleteRoom, refreshMessages,
  } = useStore();

  const [msg, setMsg] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = users.find(u => u.id === currentUserId);
  const isFounder = currentUser?.isFounder || currentUser?.standing === "Command";
  const currentRoom = rooms.find(r => r.id === currentRoomId);

  const roomMessages = networkMessages.filter(m => m.roomId === currentRoomId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [roomMessages.length, currentRoomId]);

  useEffect(() => {
    if (currentRoomId) {
      refreshMessages(currentRoomId);
    }
  }, [currentRoomId]);

  const handleSend = () => {
    if (!msg.trim() || !currentUser) return;
    addNetworkMessage({ userId: currentUser.id, text: msg }, currentRoomId || undefined);
    setMsg("");
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const slug = newRoomName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    try {
      const room = await createRoom(newRoomName.trim(), slug);
      setCurrentRoom(room.id);
      setNewRoomName("");
      setShowCreateRoom(false);
    } catch {}
  };

  const handleDeleteRoom = async (id: number) => {
    if (confirmDeleteRoom !== id) {
      setConfirmDeleteRoom(id);
      return;
    }
    try {
      await deleteRoom(id);
      setConfirmDeleteRoom(null);
    } catch {}
  };

  return (
    <div className="h-full flex flex-row overflow-hidden">
      {/* Channel Rail */}
      <div className="w-52 flex-shrink-0 bg-zinc-950 border-r border-zinc-800/80 flex flex-col">
        <div className="h-14 border-b border-zinc-800 flex items-center px-4 shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 font-medium">Channels</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="py-2 px-2 space-y-px">
            {rooms.map(room => {
              const isActive = room.id === currentRoomId;
              const canDelete = isFounder && room.type === "custom";
              const isConfirming = confirmDeleteRoom === room.id;
              return (
                <div
                  key={room.id}
                  className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-zinc-800/60 text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300"
                  }`}
                  onClick={() => { setCurrentRoom(room.id); setConfirmDeleteRoom(null); }}
                >
                  <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-sky-400" : "text-zinc-600"}`} />
                  <span className="text-[12px] tracking-wide truncate flex-1">{room.name}</span>
                  {canDelete && (
                    <button
                      className={`opacity-0 group-hover:opacity-100 shrink-0 transition-opacity ${isConfirming ? "opacity-100" : ""}`}
                      onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                      title={isConfirming ? "Confirm delete" : "Delete room"}
                    >
                      {isConfirming
                        ? <Check className="w-3 h-3 text-red-400" />
                        : <Trash2 className="w-3 h-3 text-zinc-600 hover:text-red-400" />
                      }
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {isFounder && (
          <div className="border-t border-zinc-800 p-2 shrink-0">
            {showCreateRoom ? (
              <div className="flex flex-col gap-1.5">
                <Input
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreateRoom(); if (e.key === "Escape") setShowCreateRoom(false); }}
                  placeholder="Channel name..."
                  className="h-7 text-xs bg-black border-zinc-700 text-zinc-200 rounded-none focus-visible:ring-1 focus-visible:ring-sky-500/50 px-2"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={handleCreateRoom}
                    className="flex-1 h-6 text-[10px] rounded-none bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30"
                    variant="ghost"
                  >
                    Create
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => { setShowCreateRoom(false); setNewRoomName(""); }}
                    className="h-6 w-6 rounded-none p-0 border border-zinc-700"
                    variant="ghost"
                  >
                    <X className="w-3 h-3 text-zinc-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateRoom(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-zinc-600 hover:text-amber-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Channel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800">
        <div className="h-14 border-b border-zinc-800 flex items-center px-6 bg-zinc-950/50 shrink-0 gap-3">
          <Hash className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-sm font-medium tracking-[0.15em] uppercase text-zinc-100">
            {currentRoom?.name || "Network Room"}
          </span>
          {currentRoom?.type === "system" && (
            <span className="text-[9px] border border-zinc-800 text-zinc-600 px-1.5 py-0.5 tracking-widest uppercase">System</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
          <div className="space-y-6 max-w-4xl mx-auto">
            {roomMessages.length === 0 && (
              <div className="text-center text-zinc-700 text-sm py-16 tracking-widest uppercase">
                No transmissions in this channel
              </div>
            )}
            {roomMessages.map((m) => {
              const author = users.find(u => u.id === m.userId);
              const isMe = currentUserId === m.userId;
              const isCommand = author?.standing === "Command";

              return (
                <div key={m.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-sm font-medium ${isCommand ? "text-amber-500" : isMe ? "text-emerald-400" : "text-zinc-300"}`}>
                      {author?.alias || m.userId}
                    </span>
                    {author && <StandingBadge standing={author.standing} grade={author.grade} />}
                    {author?.cardStyle && !isCommand && (
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 border border-zinc-800 px-1.5 py-0.5">
                        {author.cardStyle}
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-600 font-mono tracking-widest ml-auto">{m.timestamp}</span>
                  </div>

                  <div className={`text-[15px] p-4 leading-relaxed border ${
                    isCommand
                      ? "bg-amber-950/10 border-amber-900/30 text-amber-100/90"
                      : "bg-black/40 border-zinc-800/50 text-zinc-300"
                  }`}>
                    {m.text}
                  </div>

                  <div className="pl-4">
                    <ResponseChips
                      options={["ACKNOWLEDGED", "TRACKING", "VERIFYING", "LOGGED"]}
                      selected={m.responses}
                      onSelect={(resp) => addMessageResponse(m.id, resp)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 shrink-0">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={currentRoom ? `Transmit to #${currentRoom.name.toLowerCase()}...` : "Transmit to network..."}
              className="bg-black border-zinc-800 text-zinc-100 h-12 rounded-none focus-visible:ring-1 focus-visible:ring-sky-500/50"
            />
            <Button
              onClick={handleSend}
              className="h-12 px-6 rounded-none bg-zinc-100 hover:bg-white text-black font-bold uppercase tracking-widest"
            >
              <Send className="w-4 h-4 mr-2" />
              Transmit
            </Button>
          </div>
        </div>
      </div>

      {/* Personnel Panel */}
      <div className="w-72 hidden lg:flex flex-col bg-zinc-950/30">
        <div className="h-14 border-b border-zinc-800 flex items-center px-6 shrink-0">
          <h3 className="text-xs tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2">
            <Users className="w-4 h-4" /> Personnel ({users.length})
          </h3>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {users.map(u => (
              <OperatorCard key={u.id} user={u} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
