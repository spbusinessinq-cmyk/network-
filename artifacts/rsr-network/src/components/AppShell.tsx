import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { 
  Fingerprint, 
  Radio, 
  Radar, 
  FolderOpen, 
  Users, 
  UserCircle, 
  Shield,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { currentUserId, users, signals, cases, logoutUser } = useStore();
  const currentUser = users.find((u) => u.id === currentUserId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Network HQ", path: "/", icon: LayoutDashboard },
    { label: "Identity", path: "/identity", icon: Fingerprint },
    { label: "Network Room", path: "/network", icon: Radio },
    { label: "Signals", path: "/signals", icon: Radar },
    { label: "Cases", path: "/cases", icon: FolderOpen },
    { label: "Operators", path: "/operators", icon: Users },
    { label: "Profile", path: "/profile", icon: UserCircle },
  ];

  const isAdmin = currentUser?.standing === "Command";

  const standingColor = (standing?: string) => {
    if (standing === "Command") return "text-amber-400";
    if (standing === "Analyst") return "text-zinc-200";
    if (standing === "Operator") return "text-red-400";
    if (standing === "Scout") return "text-slate-300";
    return "text-zinc-400";
  };

  return (
    <div className="min-h-screen bg-[#050607] text-zinc-100 flex flex-col font-sans">
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
        
        <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono uppercase tracking-wider">
          <div className="hidden sm:flex items-center gap-4">
            <div>Signals: <span className="text-zinc-100">{signals.length}</span></div>
            <div>Cases: <span className="text-zinc-100">{cases.length}</span></div>
          </div>

          {/* Operator Account Menu */}
          {currentUser && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className={cn(
                  "flex items-center gap-2 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 px-3 py-1.5 transition-colors",
                  menuOpen && "bg-zinc-800/80 border-zinc-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isAdmin ? "bg-amber-400" : "bg-emerald-400")} />
                  <span className={cn("text-[11px] font-medium uppercase tracking-wider", standingColor(currentUser.standing))}>
                    {currentUser.alias}
                  </span>
                  {isAdmin && (
                    <span className="text-[9px] uppercase tracking-widest text-amber-500 font-mono bg-amber-950/40 px-1.5 py-0.5 border border-amber-900/40">
                      CMD
                    </span>
                  )}
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-500 transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 border border-zinc-700 bg-zinc-950 shadow-2xl z-50">
                  <div className="p-3 border-b border-zinc-800">
                    <div className={cn("text-xs font-medium uppercase tracking-wider", standingColor(currentUser.standing))}>
                      {currentUser.alias}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{currentUser.id}</div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">
                      {currentUser.standing} {currentUser.grade ? `· Grade ${currentUser.grade}` : ""}
                    </div>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors uppercase tracking-widest"
                    >
                      <UserCircle className="w-3.5 h-3.5 text-zinc-500" />
                      Operator Dossier
                    </Link>
                    <Link
                      href="/identity"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors uppercase tracking-widest"
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-zinc-500" />
                      Identity Card
                    </Link>
                  </div>
                  <div className="p-1 border-t border-zinc-800">
                    <button
                      onClick={() => { setMenuOpen(false); logoutUser(); }}
                      className="flex items-center gap-3 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors uppercase tracking-widest w-full text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Exit Network
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Left Rail */}
        <aside className="w-60 border-r border-zinc-800 bg-zinc-950/50 flex flex-col shrink-0">
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto rsr-scroll">
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
            <div className="p-3 mb-4 shrink-0">
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
        <main className="flex-1 overflow-auto rsr-scroll bg-black/20">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
