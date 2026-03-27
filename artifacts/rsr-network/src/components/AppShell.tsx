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
import { StarfieldCanvas } from "./StarfieldCanvas";

interface AppShellProps {
  children: React.ReactNode;
}

function getSeenCount(): number {
  try { return parseInt(localStorage.getItem("rsr_network_seen") || "0", 10); } catch { return 0; }
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { currentUserId, users, signals, cases, networkMessages, logoutUser } = useStore();
  const currentUser = users.find((u) => u.id === currentUserId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Unread network message tracking
  const [seenCount, setSeenCount] = useState(getSeenCount);
  const hasUnread = networkMessages.length > seenCount;

  // When user navigates to /network, mark all as seen
  useEffect(() => {
    if (location === "/network") {
      const current = networkMessages.length;
      setSeenCount(current);
      localStorage.setItem("rsr_network_seen", String(current));
    }
  }, [location, networkMessages.length]);

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
    { label: "Network HQ",    path: "/",         icon: LayoutDashboard },
    { label: "Identity",      path: "/identity",  icon: Fingerprint },
    { label: "Network Room",  path: "/network",   icon: Radio, unread: hasUnread },
    { label: "Signals",       path: "/signals",   icon: Radar },
    { label: "Cases",         path: "/cases",     icon: FolderOpen },
    { label: "Operators",     path: "/operators", icon: Users },
    { label: "Profile",       path: "/profile",   icon: UserCircle },
  ];

  const isAdmin = currentUser?.standing === "Command";
  const isOperatorSubPath = location.startsWith("/operators/");

  const standingColor = (standing?: string) => {
    if (standing === "Command") return "text-amber-400";
    return "text-zinc-300";
  };

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-100 flex flex-col font-sans">
      <StarfieldCanvas />

      {/* Top Header */}
      <header className="h-13 border-b border-white/[0.05] bg-black/50 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono tracking-widest text-[11px] uppercase text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-zinc-600" />
            <span>RSR Net</span>
          </div>
          <div className="h-3.5 w-px bg-white/5" />
          <div className="text-[9px] text-zinc-700 tracking-[0.25em] uppercase">Secure</div>
        </div>

        <div className="flex items-center gap-5 text-[10px] text-zinc-700 font-mono uppercase tracking-wider">
          <div className="hidden sm:flex items-center gap-5">
            <div>Signals <span className="text-zinc-500 ml-1">{signals.length}</span></div>
            <div>Cases <span className="text-zinc-500 ml-1">{cases.length}</span></div>
          </div>

          {currentUser && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className={cn(
                  "flex items-center gap-2.5 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] px-3 py-1.5 transition-colors",
                  menuOpen && "bg-white/[0.05] border-white/[0.09]"
                )}
              >
                <div className={cn("w-1 h-1 rounded-full shrink-0", isAdmin ? "bg-amber-500" : "bg-zinc-600")} />
                <span className={cn("text-[11px] font-medium uppercase tracking-widest", standingColor(currentUser.standing))}>
                  {currentUser.alias}
                </span>
                {isAdmin && (
                  <span className="text-[8px] uppercase tracking-widest text-amber-600 font-mono bg-amber-950/30 px-1.5 py-0.5 border border-amber-900/30">
                    CMD
                  </span>
                )}
                <ChevronDown className={cn("w-3 h-3 text-zinc-700 transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 border border-white/[0.06] bg-black/80 backdrop-blur-lg shadow-2xl z-50">
                  <div className="p-3 border-b border-white/[0.05]">
                    <div className={cn("text-xs font-medium uppercase tracking-wider", standingColor(currentUser.standing))}>
                      {currentUser.alias}
                    </div>
                    <div className="text-[9px] text-zinc-700 font-mono mt-0.5">{currentUser.id}</div>
                    <div className="text-[9px] text-zinc-700 uppercase tracking-widest mt-1">
                      {currentUser.standing}{currentUser.grade ? ` · Grade ${currentUser.grade}` : ""}
                    </div>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[11px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200 transition-colors uppercase tracking-widest"
                    >
                      <UserCircle className="w-3.5 h-3.5 text-zinc-700" />
                      Operator Profile
                    </Link>
                    <Link
                      href="/identity"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[11px] text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200 transition-colors uppercase tracking-widest"
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-zinc-700" />
                      Identity Card
                    </Link>
                  </div>
                  <div className="p-1 border-t border-white/[0.05]">
                    <button
                      onClick={() => { setMenuOpen(false); logoutUser(); }}
                      className="flex items-center gap-3 px-3 py-2 text-[11px] text-red-600 hover:bg-red-950/20 hover:text-red-400 transition-colors uppercase tracking-widest w-full text-left"
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
        {/* Left Nav Rail */}
        <aside className="w-56 border-r border-white/[0.04] bg-black/35 backdrop-blur-sm flex flex-col shrink-0">
          <nav className="flex-1 py-5 px-2 space-y-px overflow-y-auto rsr-scroll">
            {navItems.map((item) => {
              const active = location === item.path || (item.path === "/operators" && isOperatorSubPath);
              return (
                <Link key={item.path} href={item.path} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-[12px] transition-all group",
                  active
                    ? "text-zinc-200 bg-white/[0.06] border-l border-l-sky-500/40"
                    : "text-zinc-600 hover:bg-white/[0.03] hover:text-zinc-400 border-l border-l-transparent"
                )}>
                  <item.icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", active ? "text-zinc-400" : "text-zinc-600 group-hover:text-zinc-400")} />
                  <span className="tracking-widest uppercase text-[10px] flex-1">{item.label}</span>
                  {/* Unread indicator */}
                  {(item as any).unread && location !== item.path && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" title="New activity" />
                  )}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="px-2 pb-4 shrink-0">
              <div className="h-px bg-amber-900/15 mb-3 mx-3" />
              <Link href="/command" className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[10px] uppercase tracking-widest transition-all border-l",
                location === "/command"
                  ? "text-amber-500 bg-amber-950/20 border-l-amber-600/40"
                  : "text-amber-800 hover:text-amber-600 hover:bg-amber-950/10 border-l-transparent"
              )}>
                <Shield className="w-3.5 h-3.5" />
                <span>Command</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto rsr-scroll">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
