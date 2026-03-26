import React from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { 
  Fingerprint, 
  Radio, 
  Radar, 
  FolderOpen, 
  Users, 
  UserCircle, 
  Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { currentUserId, users, signals, cases } = useStore();
  const currentUser = users.find((u) => u.id === currentUserId);

  const navItems = [
    { label: "Identity", path: "/identity", icon: Fingerprint },
    { label: "Network Room", path: "/network", icon: Radio },
    { label: "Signals", path: "/signals", icon: Radar },
    { label: "Cases", path: "/cases", icon: FolderOpen },
    { label: "Operators", path: "/operators", icon: Users },
    { label: "Profile", path: "/profile", icon: UserCircle },
  ];

  const isAdmin = currentUser?.standing === "Command";

  return (
    <div className="min-h-screen bg-[#050607] text-zinc-100 flex flex-col font-sans">
      {/* Background Texture */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] z-0" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none [background:repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,rgba(255,255,255,0.03)_4px)] z-0" />

      {/* Top Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-500 font-mono tracking-widest text-xs uppercase">
            <Shield className="w-4 h-4" />
            RSR Net
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">Status: Secure</div>
        </div>
        
        <div className="flex items-center gap-6 text-xs text-zinc-400 font-mono uppercase tracking-wider">
          <div>Signals: <span className="text-zinc-100">{signals.length}</span></div>
          <div>Cases: <span className="text-zinc-100">{cases.length}</span></div>
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-6">
            {currentUser ? (
              <>
                <span className="text-emerald-400">{currentUser.alias}</span>
                <span className="text-zinc-600">[{currentUser.id}]</span>
              </>
            ) : (
              <span className="text-amber-500">UNIDENTIFIED</span>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Left Rail */}
        <aside className="w-60 border-r border-zinc-800 bg-zinc-950/50 flex flex-col">
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => {
              const active = location === item.path;
              return (
                <Link key={item.path} href={item.path} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-none group",
                  active 
                    ? "bg-zinc-900 text-emerald-400 border-l-2 border-emerald-500" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border-l-2 border-transparent"
                )}>
                  <item.icon className={cn("w-4 h-4", active ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-400")} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {isAdmin && (
            <div className="p-3 mt-auto mb-4">
              <Link href="/command" className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors border border-amber-900/30 bg-amber-950/20 text-amber-500 hover:bg-amber-900/30 group",
                location === "/command" && "bg-amber-900/40 border-amber-500/50"
              )}>
                <Shield className="w-4 h-4" />
                <span className="tracking-wide font-medium uppercase">Command</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-black/20">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
