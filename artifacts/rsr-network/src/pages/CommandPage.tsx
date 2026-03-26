import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Shield, Activity, Users, FolderOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CommandPage() {
  const { currentUserId, users, signals, updateSignal, updateUser } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const [activeTab, setActiveTab] = useState("signals");

  if (currentUser?.standing !== "Command") {
    return (
      <div className="h-full flex items-center justify-center text-red-500 tracking-widest uppercase bg-red-950/10">
        Unauthorized Access Attempt
      </div>
    );
  }

  const unverifiedSignals = signals.filter(s => s.status === "UNVERIFIED");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-2xl font-medium tracking-[0.1em] text-amber-500 uppercase mb-2 flex items-center gap-3">
          <Shield className="w-6 h-6" /> Command Center
        </h1>
        <p className="text-sm text-zinc-400">Total network oversight and access control.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-zinc-800 rounded-none w-full justify-start h-auto p-0 mb-8 gap-6">
          <TabsTrigger value="signals" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-500 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs">
            Signal Control <Badge className="ml-2 bg-amber-950 text-amber-500 border-amber-900 rounded-none">{unverifiedSignals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-500 px-0 pb-2 bg-transparent text-zinc-500 uppercase tracking-widest text-xs">
            User Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Pending Verification</h3>
          {unverifiedSignals.length === 0 && <p className="text-zinc-600 text-sm">No signals pending.</p>}
          {unverifiedSignals.map(sig => (
            <div key={sig.id} className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="text-zinc-200 font-medium mb-1">{sig.title}</div>
                <div className="text-xs text-zinc-500 font-mono">By: {sig.submittedBy} | {sig.category}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => updateSignal(sig.id, { status: "VERIFIED" })}
                  className="bg-emerald-950/50 text-emerald-400 border border-emerald-900 hover:bg-emerald-900/50 rounded-none text-xs h-8 uppercase tracking-wider"
                >
                  Verify
                </Button>
                <Button 
                  onClick={() => updateSignal(sig.id, { status: "ARCHIVED" })}
                  className="bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 rounded-none text-xs h-8 uppercase tracking-wider"
                >
                  Archive
                </Button>
                <Button 
                  onClick={() => updateSignal(sig.id, { priority: !sig.priority })}
                  className="bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/50 rounded-none text-xs h-8 uppercase tracking-wider"
                >
                  {sig.priority ? "Drop Priority" : "Set Priority"}
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                <div key={u.id} className="border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-zinc-200 font-medium">{u.alias}</div>
                    <Badge variant="outline" className="rounded-none text-[10px] uppercase">{u.standing}</Badge>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mb-4">{u.id}</div>
                  
                  {u.standing !== "Command" && (
                    <div className="pt-3 border-t border-zinc-800 flex flex-wrap gap-2">
                      <Button 
                        onClick={() => updateUser(u.id, { standing: "Analyst" })}
                        className="bg-zinc-900 text-zinc-300 border-zinc-800 rounded-none text-[10px] h-6 px-2 uppercase"
                      >Promote to Analyst</Button>
                      <Button 
                        onClick={() => updateUser(u.id, { presence: "Offline" })}
                        className="bg-zinc-900 text-zinc-300 border-zinc-800 rounded-none text-[10px] h-6 px-2 uppercase"
                      >Force Offline</Button>
                    </div>
                  )}
                </div>
              ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
