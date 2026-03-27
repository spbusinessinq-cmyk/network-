import React, { useState, useRef, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, Plus, Trash2, Hash, X, Check, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { StandingBadge } from "@/components/StandingBadge";
import { PresenceDot } from "@/components/PresenceDot";
import { cn } from "@/lib/utils";

function loadRoomOrder(): number[] {
  try {
    const stored = localStorage.getItem("rsr_room_order");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveRoomOrder(order: number[]) {
  localStorage.setItem("rsr_room_order", JSON.stringify(order));
}

export default function NetworkRoom() {
  const {
    networkMessages, users, currentUserId, rooms, currentRoomId,
    addNetworkMessage, setCurrentRoom, createRoom, deleteRoom, renameRoom,
    deleteNetworkMessage, refreshMessages,
  } = useStore();
  const [, navigate] = useLocation();

  const [msg, setMsg] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<number | null>(null);
  const [renamingRoomId, setRenamingRoomId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [roomOrder, setRoomOrder] = useState<number[]>(loadRoomOrder);
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = users.find(u => u.id === currentUserId);
  const isFounder = currentUser?.isFounder || currentUser?.standing === "Command";
  const currentRoom = rooms.find(r => r.id === currentRoomId);
  const roomMessages = networkMessages.filter(m => m.roomId === currentRoomId);

  const sortedRooms = useMemo(() => {
    if (roomOrder.length === 0) return rooms;
    const orderMap = new Map(roomOrder.map((id, i) => [id, i]));
    return [...rooms].sort((a, b) => {
      const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
      const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
      return ai - bi;
    });
  }, [rooms, roomOrder]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [roomMessages.length, currentRoomId]);

  useEffect(() => {
    if (currentRoomId) refreshMessages(currentRoomId);
  }, [currentRoomId]);

  // Mark messages as seen when visiting this room
  useEffect(() => {
    localStorage.setItem("rsr_network_seen", String(networkMessages.length));
  }, [networkMessages.length]);

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
    try {
      await deleteRoom(id);
      setConfirmDeleteRoom(null);
      const newOrder = roomOrder.filter(rid => rid !== id);
      setRoomOrder(newOrder);
      saveRoomOrder(newOrder);
    } catch {}
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

  const moveRoom = (e: React.MouseEvent, id: number, dir: -1 | 1) => {
    e.stopPropagation();
    const currentOrder = sortedRooms.map(r => r.id);
    const idx = currentOrder.indexOf(id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;
    [currentOrder[idx], currentOrder[newIdx]] = [currentOrder[newIdx], currentOrder[idx]];
    setRoomOrder([...currentOrder]);
    saveRoomOrder(currentOrder);
  };

  const handleDeleteMessage = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirmDeleteMsg !== id) { setConfirmDeleteMsg(id); return; }
    try {
      await deleteNetworkMessage(id);
      setConfirmDeleteMsg(null);
    } catch {}
  };

  return (
    <div className="h-full flex flex-row overflow-hidden">
      {/* Channel Rail */}
      <div className="w-52 flex-shrink-0 bg-black/30 border-r border-white/[0.04] flex flex-col">
        <div className="h-12 border-b border-white/[0.04] flex items-center px-4 shrink-0">
          <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-700">Channels</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="py-2 px-1.5 space-y-px">
            {sortedRooms.map((room, idx) => {
              const isActive = room.id === currentRoomId;
              const canManageContent = isFounder && room.type === "custom";
              const canReorder = isFounder;
              const isConfirming = confirmDeleteRoom === room.id;
              const isRenaming = renamingRoomId === room.id;
              const isFirst = idx === 0;
              const isLast = idx === sortedRooms.length - 1;

              return (
                <div
                  key={room.id}
                  className={cn(
                    "group flex items-center gap-1.5 px-2 py-2 cursor-pointer transition-colors border-l",
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

                  {!isRenaming && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0 shrink-0 transition-opacity">
                      {canReorder && (
                        <>
                          <button onClick={e => moveRoom(e, room.id, -1)} disabled={isFirst} className="p-0.5 disabled:opacity-20" title="Move up">
                            <ChevronUp className="w-2.5 h-2.5 text-zinc-700 hover:text-zinc-400" />
                          </button>
                          <button onClick={e => moveRoom(e, room.id, 1)} disabled={isLast} className="p-0.5 disabled:opacity-20" title="Move down">
                            <ChevronDown className="w-2.5 h-2.5 text-zinc-700 hover:text-zinc-400" />
                          </button>
                        </>
                      )}
                      {canManageContent && (
                        <>
                          <button onClick={e => startRename(e, room)} className="p-0.5" title="Rename">
                            <Pencil className="w-2.5 h-2.5 text-zinc-700 hover:text-zinc-400" />
                          </button>
                          <button onClick={e => handleDeleteRoom(e, room.id)} className="p-0.5" title={isConfirming ? "Confirm" : "Delete"}>
                            {isConfirming
                              ? <Check className="w-2.5 h-2.5 text-red-500" />
                              : <Trash2 className="w-2.5 h-2.5 text-zinc-700 hover:text-red-600" />}
                          </button>
                        </>
                      )}
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
                className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] text-zinc-700 hover:text-amber-700 transition-colors">
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
              const isConfirmingDel = confirmDeleteMsg === m.id;

              return (
                <div key={m.id} className="flex flex-col gap-1.5 group">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => author && navigate(`/operators/${author.id}`)}
                      className={cn(
                        "text-[11px] font-medium tracking-wide transition-opacity hover:opacity-70",
                        isCommand ? "text-amber-500" : isMe ? "text-zinc-300" : "text-zinc-500"
                      )}
                      title={`View ${author?.alias || m.userId} profile`}
                    >
                      {author?.alias || m.userId}
                    </button>
                    {author && <StandingBadge standing={author.standing} grade={author.grade} />}
                    <span className="text-[9px] text-zinc-800 font-mono tracking-widest ml-auto">{m.timestamp}</span>

                    {/* Founder-only inline delete */}
                    {isFounder && (
                      <button
                        onClick={e => handleDeleteMessage(e, m.id)}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-all text-[8px] uppercase tracking-widest flex items-center gap-1 px-1.5 py-0.5 border",
                          isConfirmingDel
                            ? "opacity-100 text-red-400 border-red-800/50 bg-red-950/20"
                            : "text-zinc-700 border-white/[0.04] hover:text-red-600 hover:border-red-900/40"
                        )}
                        title={isConfirmingDel ? "Click again to confirm removal" : "Remove transmission"}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        {isConfirmingDel ? "Confirm" : ""}
                      </button>
                    )}
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
