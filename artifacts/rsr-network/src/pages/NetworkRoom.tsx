import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Plus, Trash2, Hash, X, Check, Pencil } from "lucide-react";
import { StandingBadge } from "@/components/StandingBadge";
import { PresenceDot } from "@/components/PresenceDot";
import { cn } from "@/lib/utils";

export default function NetworkRoom() {
  const {
    networkMessages, users, currentUserId, rooms, currentRoomId,
    addNetworkMessage, setCurrentRoom, createRoom, deleteRoom, renameRoom, refreshMessages,
  } = useStore();
  const [, navigate] = useLocation();

  const [msg, setMsg] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<number | null>(null);
  const [renamingRoomId, setRenamingRoomId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = users.find(u => u.id === currentUserId);
  const isFounder = currentUser?.isFounder || currentUser?.standing === "Command";
  const currentRoom = rooms.find(r => r.id === currentRoomId);
  const roomMessages = networkMessages.filter(m => m.roomId === currentRoomId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [roomMessages.length, currentRoomId]);

  useEffect(() => {
    if (currentRoomId) refreshMessages(currentRoomId);
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

  const handleDeleteRoom = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirmDeleteRoom !== id) { setConfirmDeleteRoom(id); return; }
    try { await deleteRoom(id); setConfirmDeleteRoom(null); } catch {}
  };

  const startRename = (e: React.MouseEvent, room: typeof rooms[0]) => {
    e.stopPropagation();
    setRenamingRoomId(room.id);
    setRenameValue(room.name);
    setConfirmDeleteRoom(null);
  };

  const submitRename = async (id: number) => {
    if (!renameValue.trim()) { setRenamingRoomId(null); return; }
    try { await renameRoom(id, renameValue.trim()); } catch {}
    setRenamingRoomId(null);
  };

  return (
    <div className="h-full flex flex-row overflow-hidden">
      {/* Channel Rail */}
      <div className="w-48 flex-shrink-0 bg-black/30 border-r border-white/[0.04] flex flex-col">
        <div className="h-12 border-b border-white/[0.04] flex items-center px-4 shrink-0">
          <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-700">Channels</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="py-2 px-1.5 space-y-px">
            {rooms.map(room => {
              const isActive = room.id === currentRoomId;
              const canManage = isFounder && room.type === "custom";
              const isConfirming = confirmDeleteRoom === room.id;
              const isRenaming = renamingRoomId === room.id;

              return (
                <div
                  key={room.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-l",
                    isActive
                      ? "bg-white/[0.05] text-zinc-300 border-l-zinc-600/40"
                      : "text-zinc-700 hover:bg-white/[0.02] hover:text-zinc-500 border-l-transparent"
                  )}
                  onClick={() => { if (!isRenaming) { setCurrentRoom(room.id); setConfirmDeleteRoom(null); } }}
                >
                  <Hash className={cn("w-3 h-3 shrink-0", isActive ? "text-zinc-600" : "text-zinc-800")} />

                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") submitRename(room.id);
                        if (e.key === "Escape") setRenamingRoomId(null);
                        e.stopPropagation();
                      }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 text-[11px] bg-transparent border-b border-zinc-700/50 outline-none text-zinc-200 py-0.5 min-w-0"
                    />
                  ) : (
                    <span className="text-[11px] tracking-wide truncate flex-1">{room.name}</span>
                  )}

                  {canManage && !isRenaming && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
                      <button onClick={e => startRename(e, room)} className="p-0.5">
                        <Pencil className="w-2.5 h-2.5 text-zinc-700 hover:text-zinc-400" />
                      </button>
                      <button onClick={e => handleDeleteRoom(e, room.id)} className="p-0.5">
                        {isConfirming
                          ? <Check className="w-2.5 h-2.5 text-red-500" />
                          : <Trash2 className="w-2.5 h-2.5 text-zinc-700 hover:text-red-600" />}
                      </button>
                    </div>
                  )}

                  {isRenaming && (
                    <button onClick={e => { e.stopPropagation(); setRenamingRoomId(null); }} className="shrink-0 p-0.5">
                      <X className="w-3 h-3 text-zinc-700 hover:text-zinc-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {isFounder && (
          <div className="border-t border-white/[0.04] p-2 shrink-0">
            {showCreateRoom ? (
              <div className="flex flex-col gap-1.5">
                <Input
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreateRoom(); if (e.key === "Escape") setShowCreateRoom(false); }}
                  placeholder="Channel name..."
                  className="h-7 text-xs bg-black/50 border-white/[0.07] text-zinc-300 rounded-none focus-visible:ring-0 px-2"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleCreateRoom} variant="ghost"
                    className="flex-1 h-6 text-[9px] rounded-none text-zinc-500 hover:text-zinc-300 border border-white/[0.06]">
                    Create
                  </Button>
                  <Button size="sm" onClick={() => { setShowCreateRoom(false); setNewRoomName(""); }} variant="ghost"
                    className="h-6 w-6 rounded-none p-0 border border-white/[0.06]">
                    <X className="w-3 h-3 text-zinc-700" />
                  </Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreateRoom(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] text-zinc-800 hover:text-amber-700 transition-colors">
                <Plus className="w-3 h-3" /> New Channel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.03]">
        <div className="h-12 border-b border-white/[0.04] flex items-center px-6 bg-black/20 shrink-0 gap-3">
          <Hash className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-400">
            {currentRoom?.name || "Network Room"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5" ref={scrollRef}>
          <div className="space-y-5 max-w-3xl mx-auto">
            {roomMessages.length === 0 && (
              <div className="text-center text-zinc-800 text-[10px] py-16 tracking-widest uppercase font-mono">
                No transmissions in this channel
              </div>
            )}
            {roomMessages.map((m) => {
              const author = users.find(u => u.id === m.userId);
              const isMe = currentUserId === m.userId;
              const isCommand = author?.standing === "Command";

              return (
                <div key={m.id} className="flex flex-col gap-1.5 group">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[11px] font-medium tracking-wide",
                      isCommand ? "text-amber-500" : isMe ? "text-zinc-300" : "text-zinc-500"
                    )}>
                      {author?.alias || m.userId}
                    </span>
                    {author && <StandingBadge standing={author.standing} grade={author.grade} />}
                    <span className="text-[9px] text-zinc-800 font-mono tracking-widest ml-auto">{m.timestamp}</span>
                  </div>

                  <div className={cn("text-sm leading-relaxed pl-3 border-l",
                    isCommand
                      ? "border-l-amber-800/40 text-zinc-400"
                      : isMe
                      ? "border-l-zinc-700/50 text-zinc-300"
                      : "border-l-zinc-800/40 text-zinc-500"
                  )}>
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/[0.04] bg-black/20 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={currentRoom ? `#${currentRoom.name.toLowerCase()} …` : "Transmit…"}
              className="bg-black/40 border-white/[0.06] text-zinc-300 h-10 rounded-none focus-visible:ring-0 placeholder:text-zinc-800"
            />
            <Button
              onClick={handleSend}
              variant="ghost"
              className="h-10 px-5 rounded-none border border-white/[0.06] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] uppercase tracking-widest text-[10px]"
            >
              <Send className="w-3 h-3 mr-2" /> Send
            </Button>
          </div>
        </div>
      </div>

      {/* Personnel */}
      <div className="w-56 hidden lg:flex flex-col bg-black/20">
        <div className="h-12 border-b border-white/[0.04] flex items-center px-5 shrink-0">
          <h3 className="text-[9px] tracking-[0.25em] uppercase text-zinc-700 flex items-center gap-2">
            <Users className="w-3 h-3" /> Personnel
          </h3>
        </div>
        <ScrollArea className="flex-1 py-2 px-2">
          <div className="space-y-px">
            {users.map(u => {
              const isCmd = u.standing === "Command";
              const online = u.presence.includes("ACTIVE") || u.presence === "Online";
              return (
                <div
                  key={u.id}
                  onClick={() => navigate(`/operators/${u.id}`)}
                  className="flex items-center gap-2.5 px-2 py-2 cursor-pointer hover:bg-white/[0.02] transition-colors group"
                >
                  <PresenceDot status={online ? "online" : "away"} />
                  <span className={cn("text-[11px] truncate flex-1", isCmd ? "text-amber-500/80" : "text-zinc-600 group-hover:text-zinc-400")}>
                    {u.alias}
                  </span>
                  <StandingBadge standing={u.standing} grade={u.grade} className="shrink-0 opacity-60" />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
