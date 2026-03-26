import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users } from "lucide-react";
import { StandingBadge } from "@/components/StandingBadge";
import { ResponseChips } from "@/components/ResponseChips";
import { OperatorCard } from "@/components/OperatorCard";

export default function NetworkRoom() {
  const { networkMessages, users, currentUserId, addNetworkMessage, addMessageResponse } = useStore();
  const [msg, setMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentUser = users.find(u => u.id === currentUserId);
  const onlineUsers = users.filter(u => u.presence.includes("Online") || u.presence.includes("ACTIVE"));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [networkMessages]);

  const handleSend = () => {
    if (!msg.trim() || !currentUser) return;
    addNetworkMessage({
      userId: currentUser.id,
      text: msg
    });
    setMsg("");
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      <div className="flex-1 flex flex-col h-full border-r border-zinc-800">
        <div className="h-14 border-b border-zinc-800 flex items-center px-6 bg-zinc-950/50 shrink-0">
          <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-100 flex items-center gap-3">
            <RadioIcon /> Network Room
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
          <div className="space-y-6 max-w-4xl mx-auto">
            {networkMessages.map((m) => {
              const author = users.find(u => u.id === m.userId);
              const isMe = currentUserId === m.userId;
              return (
                <div key={m.id} className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className={`text-sm font-medium ${isMe ? "text-emerald-400" : "text-zinc-300"}`}>
                      {author?.alias || m.userId}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono tracking-widest">{m.timestamp}</span>
                    {author && <StandingBadge standing={author.standing} />}
                  </div>
                  <div className="text-[15px] text-zinc-300 bg-black/40 border border-zinc-800/50 p-4 leading-relaxed">
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
              placeholder="Transmit to network..."
              className="bg-black border-zinc-800 text-zinc-100 h-12 rounded-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
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

      <div className="w-80 hidden lg:flex flex-col bg-zinc-950/30">
        <div className="h-14 border-b border-zinc-800 flex items-center px-6 shrink-0">
          <h3 className="text-xs tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2">
            <Users className="w-4 h-4" /> Personnel ({onlineUsers.length})
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

function RadioIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>;
}
